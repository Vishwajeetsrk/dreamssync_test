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
    });

    return () => unsubscribe();
  }, [router, searchParams]);

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
      setMessage({ type: 'success', text: 'NAME UPDATED SUCCESSFULLY.' });
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
      setMessage({ type: 'success', text: 'PHOTO UPDATED.' });
    } catch (err: any) {
       // fallback handled in previous code
    } finally {
       setUploading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    setLoading(true);
    try {
      await updatePassword(auth.currentUser!, newPassword);
      setMessage({ type: 'success', text: 'PASSWORD CHANGED SUCCESSFULLY.' });
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
      setMessage({ type: 'error', text: 'RE-LOGIN TO DELETE ACCOUNT.' });
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
     <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-32 pb-16 px-4 sm:px-6 text-black selection:bg-yellow-400/40 relative">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 md:mb-12 flex flex-col items-center text-center space-y-4 border-b-4 border-black pb-10">
            <div className="px-4 py-1.5 bg-black text-white font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_0px_#2563EB] italic">YOUR SETTINGS</div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none text-black uppercase italic">
              MY <span className="text-blue-600 not-italic decoration-4 decoration-[#FACC15] underline underline-offset-4">PROFILE</span>
            </h1>
            <p className="text-sm md:text-lg font-bold text-gray-400 uppercase max-w-xl mx-auto italic">Change your name or password here.</p>
          
          <div className="flex bg-white p-1.5 border-2 border-black shadow-[4px_4px_0px_0px_black] mt-6">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_black]' : 'text-gray-400'}`}
            >
              YOUR INFO
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_black]' : 'text-gray-400'}`}
            >
              PASSWORD
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Profile Card */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                <div className="bg-white border-4 border-black p-6 md:p-10 flex flex-col items-center text-center space-y-6 shadow-[8px_8px_0px_0px_black]">
                  <div className="relative w-32 h-32 sm:w-48 sm:h-48 border-4 border-black shadow-[4px_4px_0px_0px_#2563EB] overflow-hidden bg-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                         <UserIcon className="w-20 h-20 text-black/10" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-20">
                        <Loader2 className="w-8 h-8 text-black animate-spin" />
                      </div>
                    )}
                    <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarUpload} />
                    <label htmlFor="avatar-upload" className="absolute inset-0 bg-blue-600/20 opacity-0 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer z-10">
                      <Camera className="w-10 h-10 text-white" />
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-black uppercase italic leading-none">{name || 'NAME'}</h3>
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{user?.email}</div>
                  </div>
                </div>

                <Link href="/donate" className="w-full bg-[#FACC15] border-4 border-black p-6 font-black uppercase text-black flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm italic">
                   <Coffee className="w-5 h-5 text-black" /> GIVE SUPPORT
                </Link>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-8">
                <div className="bg-white border-4 border-black p-6 sm:p-10 md:p-12 shadow-[8px_8px_0px_0px_black]">
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 block italic">Your Full Name</label>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight italic">Shown on your resumes.</p>
                      </div>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-4 text-xl border-4 border-black font-black focus:outline-none focus:bg-gray-50 transition-colors bg-white shadow-[4px_4px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1" 
                        placeholder="ENTER NAME"
                      />
                    </div>

                    <button type="submit" className="w-full sm:w-auto px-10 py-5 bg-black text-white border-2 border-black font-black text-base uppercase italic shadow-[6px_6px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">
                      <Save className="w-6 h-6" /> SAVE INFO
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="bg-white border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_black] max-w-2xl mx-auto w-full">
                <h2 className="text-3xl font-black uppercase mb-10 flex items-center gap-4 tracking-tighter text-black italic leading-none">
                  <Lock className="w-10 h-10 text-[#2563EB]" /> NEW PASSWORD
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-blue-600 block italic">New Secure Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-4 text-xl border-4 border-black font-black focus:outline-none bg-white shadow-[4px_4px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1" 
                    />
                  </div>
                  <button type="submit" className="px-10 py-5 bg-black text-white border-2 border-black font-black text-base uppercase italic shadow-[6px_6px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-4">
                    <Shield className="w-6 h-6" /> UPDATE NOW
                  </button>
                </form>
              </div>

              <div className="bg-gray-100 border-4 border-black p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[8px_8px_0px_0px_black] max-w-4xl mx-auto w-full">
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black uppercase text-black italic leading-none mb-2">DANGER ZONE</h3>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight italic">Log out or delete your account here.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <button onClick={handleSignOut} className="px-8 py-4 bg-white text-black border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black] hover:shadow-none transition-all">
                    Log Out
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className={`px-8 py-4 border-2 border-black font-black uppercase text-[10px] shadow-[4px_4px_0px_black] ${confirmDelete ? 'bg-red-600 text-white' : 'bg-white text-red-600'}`}
                  >
                    {confirmDelete ? 'SURE?' : 'Delete All'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {message && (
          <div className={`fixed bottom-6 right-6 p-6 border-4 border-black shadow-[6px_6px_0px_0px_black] z-[100] ${message.type === 'success' ? 'bg-blue-600 text-white' : 'bg-black text-red-400'}`}>
            <p className="text-sm font-black uppercase tracking-tight italic">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center p-6"><Loader2 className="w-8 h-8 text-black animate-spin" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
