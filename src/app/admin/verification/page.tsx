'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Award, Briefcase, FileText, CheckCircle, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'mentor' | 'recruiter' | 'scholarship';

export default function VerificationConsole() {
  const [activeTab, setActiveTab] = useState<Tab>('mentor');
  const [mentors, setMentors] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opsLoading, setOpsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 3) setLoading(false);
    };

    const unsubMentors = onSnapshot(collection(db, 'mentors'), (snapshot) => {
      const data = snapshot.docs
        .map((mentorDoc) => ({ id: mentorDoc.id, ...mentorDoc.data() }))
        .filter((mentor: any) => mentor.verified !== true && mentor.status !== 'rejected');
      setMentors(sortByCreatedAt(data));
      markLoaded();
    }, () => markLoaded());

    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const data = snapshot.docs
        .map((jobDoc) => ({ id: jobDoc.id, ...jobDoc.data() }))
        .filter((job: any) => job.approved === false || job.status === 'pending_review');
      setJobs(sortByCreatedAt(data));
      markLoaded();
    }, () => markLoaded());

    const unsubScholarships = onSnapshot(collection(db, 'scholarship_requests'), (snapshot) => {
      const data = snapshot.docs
        .map((requestDoc) => ({ id: requestDoc.id, ...requestDoc.data() }))
        .filter((request: any) => !request.status || request.status === 'pending');
      setScholarships(sortByCreatedAt(data));
      markLoaded();
    }, () => markLoaded());

    return () => {
      unsubMentors();
      unsubJobs();
      unsubScholarships();
    };
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const verifyMentor = async (mentor: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'mentors', mentor.id), {
        verified: true,
        active: true,
        status: 'verified',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Mentor verified: ${mentor.name || 'profile'}`);
    });
  };

  const rejectMentor = async (mentor: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'mentors', mentor.id), {
        active: false,
        status: 'rejected',
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Mentor rejected: ${mentor.name || 'profile'}`);
    });
  };

  const approveJob = async (job: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'jobs', job.id), {
        approved: true,
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Job approved: ${job.title || 'listing'}`);
    });
  };

  const rejectJob = async (job: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'jobs', job.id), {
        approved: false,
        status: 'rejected',
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Job rejected: ${job.title || 'listing'}`);
    });
  };

  const approveScholarship = async (request: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'scholarship_requests', request.id), {
        status: 'approved',
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Scholarship approved: ${request.student || request.name || 'request'}`);
    });
  };

  const dismissScholarship = async (request: any) => {
    await runOperation(async () => {
      await updateDoc(doc(db, 'scholarship_requests', request.id), {
        status: 'dismissed',
        updated_at: new Date().toISOString()
      });
      triggerToast('success', `Scholarship dismissed: ${request.student || request.name || 'request'}`);
    });
  };

  const purgeRequest = async (collectionName: string, id: string) => {
    await runOperation(async () => {
      await deleteDoc(doc(db, collectionName, id));
      triggerToast('success', 'Request removed.');
    });
  };

  const runOperation = async (operation: () => Promise<void>) => {
    setOpsLoading(true);
    try {
      await operation();
    } catch (error: any) {
      triggerToast('error', error?.message || 'Verification operation failed.');
    } finally {
      setOpsLoading(false);
    }
  };

  const tabs = [
    { id: 'mentor' as const, label: `Mentors (${mentors.length})`, icon: Award },
    { id: 'recruiter' as const, label: `Jobs (${jobs.length})`, icon: Briefcase },
    { id: 'scholarship' as const, label: `Scholarships (${scholarships.length})`, icon: FileText }
  ];

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#FACC15] text-black' : 'bg-red-600 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-8 border-black pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">
            Verification <span className="text-blue-600">Base</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Live approval queues for mentors, pending jobs, and scholarship requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-4 border-black p-1 bg-white shadow-[4px_4px_0px_0px_black]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'bg-black text-[#FACC15]' : 'bg-white text-slate-600 hover:text-black'}`}
            >
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {activeTab === 'mentor' && (
            <QueueGrid emptyText="No pending mentor profiles.">
              {mentors.map((mentor) => (
                <QueueCard key={mentor.id} title={mentor.name || 'Unnamed mentor'} subtitle={mentor.company || mentor.email || 'No company provided'}>
                  <p className="text-xs font-bold text-slate-600">{mentor.role || mentor.credentials || 'Role pending'}</p>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">{mentor.bio || mentor.specialization || 'No bio submitted.'}</p>
                  {mentor.linkedin && <ExternalLinkButton href={mentor.linkedin} label="LinkedIn" />}
                  <ActionRow disabled={opsLoading} rejectLabel="Reject" approveLabel="Verify Mentor" onReject={() => rejectMentor(mentor)} onApprove={() => verifyMentor(mentor)} />
                </QueueCard>
              ))}
            </QueueGrid>
          )}

          {activeTab === 'recruiter' && (
            <QueueGrid emptyText="No pending job approvals.">
              {jobs.map((job) => (
                <QueueCard key={job.id} title={job.company || 'Unknown company'} subtitle={job.title || 'Untitled job'}>
                  <p className="text-xs font-bold text-slate-600">{job.location || 'Location pending'} | {job.type || 'Role type pending'}</p>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">Application URL: {job.link || 'not submitted'}</p>
                  {job.link && <ExternalLinkButton href={job.link} label="Application" />}
                  <ActionRow disabled={opsLoading} rejectLabel="Reject" approveLabel="Approve Job" onReject={() => rejectJob(job)} onApprove={() => approveJob(job)} />
                </QueueCard>
              ))}
            </QueueGrid>
          )}

          {activeTab === 'scholarship' && (
            <QueueGrid emptyText="No pending scholarship requests.">
              {scholarships.map((request) => (
                <QueueCard key={request.id} title={request.student || request.name || 'Unnamed student'} subtitle={request.institution || request.email || 'Institution pending'}>
                  <p className="text-xs font-bold text-slate-600">{request.financialStatus || request.category || 'Financial status pending'}</p>
                  <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">{request.reason || request.notes || 'No request details submitted.'}</p>
                  {request.fileUrl && <ExternalLinkButton href={request.fileUrl} label="Evidence File" />}
                  <ActionRow disabled={opsLoading} rejectLabel="Dismiss" approveLabel="Approve Support" onReject={() => dismissScholarship(request)} onApprove={() => approveScholarship(request)} />
                  <button onClick={() => purgeRequest('scholarship_requests', request.id)} className="mt-3 text-[9px] font-black uppercase text-slate-300 hover:text-red-600">Remove record</button>
                </QueueCard>
              ))}
            </QueueGrid>
          )}
        </>
      )}
    </div>
  );
}

function sortByCreatedAt(items: any[]) {
  return items.sort((a, b) => {
    const left = new Date(a.created_at || a.createdAt || 0).getTime();
    const right = new Date(b.created_at || b.createdAt || 0).getTime();
    return right - left;
  });
}

function QueueGrid({ children, emptyText }: { children: React.ReactNode; emptyText: string }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {Array.isArray(children) && children.length === 0 ? (
        <div className="xl:col-span-2 border-4 border-dashed border-slate-200 p-20 text-center bg-white">
          <p className="font-black uppercase text-slate-400">{emptyText}</p>
        </div>
      ) : children}
    </div>
  );
}

function QueueCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_black] hover:border-blue-600 transition-all flex flex-col justify-between">
      <div className="space-y-4">
        <div className="border-b-2 border-slate-50 pb-4">
          <h3 className="text-xl font-black uppercase italic leading-tight">{title}</h3>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{subtitle}</p>
        </div>
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

function ExternalLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" className="inline-flex items-center gap-1.5 p-2 border border-black hover:bg-slate-50 text-[8px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white">
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function ActionRow({ disabled, rejectLabel, approveLabel, onReject, onApprove }: { disabled: boolean; rejectLabel: string; approveLabel: string; onReject: () => void; onApprove: () => void }) {
  return (
    <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-50 mt-6">
      <button disabled={disabled} onClick={onReject} className="px-4 py-2 border-2 border-black text-[10px] font-black uppercase disabled:opacity-50">
        {rejectLabel}
      </button>
      <button disabled={disabled} onClick={onApprove} className="px-4 py-2 bg-[#FACC15] border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50">
        {approveLabel}
      </button>
    </div>
  );
}
