'use client';

import { useState, useEffect, Suspense } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updatePassword, deleteUser, signOut as firebaseSignOut } from 'firebase/auth';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  Camera, 
  Loader2, 
  Save, 
  LogOut,
  Trash2,
  Lock,
  ShieldAlert,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Zap,
  Coffee,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function ProfileContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || '');
        setAvatarUrl(data.avatar_url || '');
      }
      setLoading(false);

      if (searchParams.get('action') === 'fix') {
         await handleHeadlessSync(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handleHeadlessSync = async (currentUser: any) => {
    setUploading(true);
    try {
      const currentPhoto = currentUser.photoURL || '';
      if (currentPhoto) {
        await setDoc(doc(db, 'users', currentUser.uid), {
          avatar_url: currentPhoto,
          last_sync: new Date().toISOString()
        }, { merge: true });
        setAvatarUrl(currentPhoto);
        setMessage({ type: 'success', text: 'PROFILE SYNC COMPLETE.' });
      } else {
        setMessage({ type: 'error', text: 'NO SOURCE PHOTO DETECTED. MANUAL UPDATE REQUIRED.' });
      }
    } catch (err) {
      console.error('Headless sync failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { merge: true });
      setMessage({ type: 'success', text: 'PROFILE UPDATED SUCCESSFULLY.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
      await setDoc(doc(db, 'users', user.uid), { avatar_url: url }, { merge: true });
      setMessage({ type: 'success', text: 'PROFILE PHOTO UPDATED.' });
    } catch (err: any) {
      console.warn('Storage blocked, fallback sync initiated...');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          setAvatarUrl(base64data);
          await setDoc(doc(db, 'users', user.uid), { avatar_url: base64data }, { merge: true });
          setMessage({ type: 'success', text: 'PROFILE PHOTO UPLOADED.' });
        } catch (dbErr: any) {
          setMessage({ type: 'error', text: 'SYNC FAILED. FILE SIZE EXCEEDS BUFFER.' });
        } finally {
          setUploading(false);
        }
      };
    } finally {
        // Handled in reader
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    try {
      await updatePassword(auth.currentUser!, newPassword);
      setMessage({ type: 'success', text: 'SECURITY SETTINGS UPDATED SUCCESSFULLY.' });
      setNewPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      const uid = user.uid;
      await deleteDoc(doc(db, 'users', uid));
      await deleteUser(auth.currentUser!);
      router.push('/signup');
    } catch (err: any) {
      setMessage({ type: 'error', text: 'PLEASE RE-LOGIN TO DELETE ACCOUNT.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    await nextAuthSignOut({ redirect: false });
    router.push('/');
  };

  if (loading && !user) return (
     <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="neo-box p-10 bg-white">
           <Loader2 className="w-12 h-12 text-black animate-spin" />
        </div>
     </div>
  );

  const userName = name?.split(' ')[0] || "Vishwajeet Srk";

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-40 pb-20 px-6 md:px-12 text-black selection:bg-[#FACC15]/40 relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* Header Architecture (Audit Recap State) */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-end gap-10 border-b-8 border-black pb-8 md:pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-white shadow-[3px_3px_0px_0px_#2563EB]">
                <UserIcon className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Your Account Hub</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-black uppercase italic">
              Your <br /> <span className="text-blue-600 drop-shadow-[4px_4px_0px_#F1F5F9] not-italic decoration-8 decoration-[#FACC15] underline underline-offset-8">Profile</span>
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Manage your identity and account security.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full md:w-auto px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400 hover:text-black'}`}
            >
              PROFILE INFO
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full md:w-auto px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'text-gray-400 hover:text-black'}`}
            >
              SECURITY
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-16"
            >
              {/* Profile Context Card */}
              <div className="lg:col-span-4 space-y-10">
                <div className="bg-white border-4 border-black p-6 md:p-12 flex flex-col items-center text-center space-y-10 group overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <div className="relative w-56 h-56 border-8 border-black shadow-[8px_8px_0px_0px_#2563EB] group-hover:scale-105 transition-transform overflow-hidden bg-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Identity" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center z-20">
                         <UserIcon className="w-24 h-24 text-black/10" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                        <Loader2 className="w-12 h-12 text-black animate-spin" />
                      </div>
                    )}
                    <input type="file" id="avatar-upload-profile" hidden accept="image/*" onChange={handleAvatarUpload} />
                    <label htmlFor="avatar-upload-profile" className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer z-10">
                      <Camera className="w-16 h-16 text-white" />
                    </label>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black tracking-tighter text-black uppercase leading-none">{name || 'STUDENT NAME'}</h3>
                    <div className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] inline-block border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] italic">STU-ID: {user?.uid.substring(0,8).toUpperCase()}</div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] block pt-2">{user?.email}</p>
                  </div>
 
                  <div className="w-full pt-10 border-t-4 border-gray-100 grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">ACCESS</div>
                      <div className="text-xs font-black text-blue-600 uppercase">STUDENT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">STATUS</div>
                      <div className="text-xs font-black text-teal-600 uppercase tracking-widest flex items-center justify-center gap-1">
                         <Zap className="w-3 h-3 fill-current" /> ACTIVE
                      </div>
                    </div>
                  </div>
                </div>
 
                <Link 
                  href="/donate" 
                  className="w-full bg-[#FACC15] border-4 border-black p-8 font-black uppercase text-black text-center flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                   <Coffee className="w-6 h-6 fill-current" /> SUPPORT OUR MISSION
                </Link>
              </div>
 
              {/* Profile Form */}
              <div className="lg:col-span-8 space-y-12">
                <div className="bg-white border-4 border-black p-8 sm:p-12 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-12 flex items-center gap-4">
                    <Settings className="w-6 h-6 text-black" /> BASIC INFORMATION
                  </h3>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 block italic">YOUR FULL NAME</label>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">This name will appear on your resumes and certificates.</p>
                      </div>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-5 text-2xl border-4 border-black font-black uppercase focus:outline-none focus:bg-gray-50 transition-colors" 
                        placeholder="e.g. VISHWAJEET SRK"
                      />
                    </div>
 
                    <div className="pt-8 space-y-6">
                       <button type="submit" className="w-full md:w-auto px-16 py-6 bg-black text-white border-4 border-black font-black text-xl uppercase italic shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-6 group">
                         <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" /> SAVE PROFILE
                       </button>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-teal-500" /> Takes 2 seconds · You can edit later
                       </p>
                    </div>
                  </form>
                </div>
 
                <div className="bg-black text-white p-12 shadow-[12px_12px_0px_0px_#FACC15] border-8 border-black">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <ShieldCheck className="w-16 h-16 shrink-0 text-[#FACC15]" strokeWidth={3} />
                    <div className="space-y-4 text-center md:text-left">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FACC15]">Privacy Protocol</h4>
                       <p className="text-xl font-bold leading-tight uppercase italic text-white/90">Your data is safe with us. We use professional security measures to protect your personal information at all times.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="space-y-16"
            >
              <div className="bg-white border-8 border-black p-8 sm:p-12 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-4xl font-black uppercase mb-16 flex items-center gap-6 tracking-tighter text-black italic">
                  <Lock className="w-12 h-12 text-[#2563EB]" /> SECURITY SETTINGS
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-12 max-w-2xl">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 block italic">Current Secure Code</label>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Enter your old password to authorize the change.</p>
                    </div>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-5 text-2xl border-4 border-black font-black focus:outline-none" 
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 block italic">New Secure Code</label>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Minimum 8 characters for high security.</p>
                    </div>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-5 text-2xl border-4 border-black font-black focus:outline-none" 
                    />
                  </div>
                  <div className="pt-4 space-y-6">
                    <button type="submit" className="w-full md:w-auto px-16 py-6 bg-black text-white border-4 border-black font-black text-xl uppercase italic shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-6 group">
                      <Shield className="w-8 h-8 group-hover:scale-110 transition-transform" /> UPDATE SECURITY
                    </button>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                       <Zap className="w-4 h-4 text-[#FACC15]" /> Takes 10 seconds · System wide sync
                    </p>
                  </div>
                </form>
              </div>
 
              {/* Danger Zone */}
              <div className="bg-gray-50 border-8 border-black p-8 sm:p-12 md:p-16 flex flex-col xl:flex-row xl:items-center justify-between gap-8 md:gap-16 shadow-[12px_12px_0px_0px_rgba(32,32,32,0.1)]">
                <div className="space-y-6">
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-black italic">DANGER ZONE</h3>
                  <p className="text-base font-bold text-gray-400 max-w-xl leading-snug uppercase tracking-tight">
                    Full account closure. Permanent removal of all your resumes, roadmaps, and career data from the DreamSync network.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-8">
                  <button 
                    onClick={handleSignOut}
                    className="px-12 py-5 bg-white text-black border-4 border-black font-black uppercase text-[11px] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Logout System
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className={`px-12 py-5 border-4 border-black font-black uppercase text-[11px] tracking-widest transition-all shadow-[6px_6px_0px_rgba(0,0,0,1)] ${confirmDelete ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-600 hover:bg-red-600 hover:text-white'}`}
                  >
                    {confirmDelete ? 'CONFIRM PURGE?' : 'Purge Identity'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Feedback Matrix */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 50 }}
              className={`fixed bottom-12 right-12 p-10 border-4 border-slate-900 shadow-[8px_8px_0px_0px_#0F172A] z-[100] flex flex-col gap-4 max-w-sm ${message.type === 'success' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-red-400'}`}
            >
              <div className="flex items-center gap-6">
                {message.type === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10 animate-pulse" />}
                <p className="text-lg font-black uppercase tracking-tight leading-tighter w-48">{message.text}</p>
              </div>
              <div className="w-full h-3 bg-white/20 border-2 border-black/10 overflow-hidden">
                <motion.div 
                   initial={{ width: "100%" }}
                   animate={{ width: "0%" }}
                   transition={{ duration: 5 }}
                   className="h-full bg-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
       </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
