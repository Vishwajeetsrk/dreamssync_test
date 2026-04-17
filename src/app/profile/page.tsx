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
        setMessage({ type: 'success', text: 'SYNC COMPLETE.' });
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
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        try {
          setAvatarUrl(base64data);
          await setDoc(doc(db, 'users', user.uid), { avatar_url: base64data }, { merge: true });
          setMessage({ type: 'success', text: 'PHOTO UPDATED.' });
        } catch (dbErr: any) {
          setMessage({ type: 'error', text: 'SAVE FAILED. PHOTO TOO BIG.' });
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
     <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="border-4 border-black p-10 bg-white shadow-[8px_8px_0px_0px_black]">
           <Loader2 className="w-12 h-12 text-black animate-spin" />
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-40 pb-20 px-4 sm:px-6 md:px-12 text-black selection:bg-yellow-400/40 relative">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 md:mb-16 flex flex-col items-center text-center space-y-6 border-b-8 border-black pb-12">
            <div className="inline-block px-6 py-2 bg-black text-white font-black text-[10px] uppercase tracking-[0.4em] shadow-[4px_4px_0px_0px_#2563EB] italic">YOUR ACCOUNT SETTINGS</div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none text-black uppercase italic">
              MY <span className="text-blue-600 drop-shadow-[4px_4px_0px_#F1F5F9] not-italic decoration-8 decoration-[#FACC15] underline underline-offset-8">PROFILE</span>
            </h1>
            <p className="text-base sm:text-xl font-bold text-gray-400 uppercase tracking-tight max-w-2xl mx-auto">Update your name and keep your account safe from the settings below.</p>
          
          <div className="flex bg-white p-2 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto mt-8">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 sm:grow-0 px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_black]' : 'text-gray-400 hover:text-black'}`}
            >
              YOUR INFO
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex-1 sm:grow-0 px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-[4px_4px_0px_0px_black]' : 'text-gray-400 hover:text-black'}`}
            >
              PASSWORD
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Profile Card */}
              <div className="lg:col-span-12 xl:col-span-4 space-y-8">
                <div className="bg-white border-8 border-black p-8 md:p-12 flex flex-col items-center text-center space-y-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 border-8 border-black shadow-[8px_8px_0px_0px_#2563EB] group-hover:scale-105 transition-transform overflow-hidden bg-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Identity" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                         <UserIcon className="w-32 h-32 text-black/10" />
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
                    <div className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] inline-block border-4 border-black shadow-[4px_4px_0px_0px_black] italic">ID: {user?.uid.substring(0,8).toUpperCase()}</div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest block pt-2">{user?.email}</p>
                  </div>
                </div>

                <Link 
                  href="/donate" 
                  className="w-full bg-[#FACC15] border-8 border-black p-8 font-black uppercase text-black text-center flex items-center justify-center gap-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                   <Coffee className="w-8 h-8 fill-current text-black" /> GIVE SUPPORT
                </Link>
              </div>

              {/* Form Section */}
              <div className="lg:col-span-12 xl:col-span-8 space-y-12">
                <div className="bg-white border-8 border-black p-8 sm:p-12 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-12 flex items-center gap-4 italic border-b-4 border-gray-100 pb-4">
                    <Settings className="w-6 h-6 text-black" /> YOUR INFO
                  </h3>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-blue-600 block italic">Your Full Name</label>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">This name will be shown on your resumes and papers.</p>
                      </div>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-6 text-2xl border-4 border-black font-black focus:outline-none focus:bg-gray-50 transition-colors bg-white shadow-[6px_6px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1" 
                        placeholder="ENTER YOUR NAME"
                      />
                    </div>

                    <div className="pt-8 space-y-4">
                       <button type="submit" className="w-full sm:w-auto px-16 py-8 bg-black text-white border-4 border-black font-black text-xl uppercase italic shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-6 group">
                         <Save className="w-8 h-8 group-hover:rotate-12 transition-transform" /> SAVE INFO
                       </button>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                         <CheckCircle2 className="w-4 h-4 text-green-500" /> Takes 2 seconds · Keep it real
                       </p>
                    </div>
                  </form>
                </div>

                <div className="bg-black text-white p-10 md:p-16 border-8 border-black shadow-[16px_16px_0px_0px_#FACC15]">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="p-6 bg-white shrink-0 shadow-[8px_8px_0px_0px_#2563EB] rotate-6 group-hover:rotate-0 transition-transform">
                       <ShieldCheck className="w-16 h-16 text-black" strokeWidth={3} />
                    </div>
                    <div className="space-y-6 text-center md:text-left">
                       <h4 className="text-xs font-black uppercase tracking-[0.4em] text-[#FACC15]">SAFETY GUARANTEE</h4>
                       <p className="text-xl md:text-2xl font-bold leading-tight uppercase italic text-white/90 tracking-tight">We keep your data safe. We use high security systems to protect your privacy at all times.</p>
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
              <div className="bg-white border-8 border-black p-8 md:p-16 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-4xl mx-auto w-full">
                <h2 className="text-4xl md:text-6xl font-black uppercase mb-16 flex flex-col md:flex-row md:items-center gap-6 tracking-tighter text-black italic leading-none">
                  <Lock className="w-16 h-16 text-[#2563EB]" /> CHANGE PASSWORD
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-blue-600 block italic">Old Password</label>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">Type your current password here.</p>
                    </div>
                    <input 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-6 text-2xl border-4 border-black font-black focus:outline-none bg-white shadow-[6px_6px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1" 
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-blue-600 block italic">New Password</label>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">At least 8 letters or numbers.</p>
                    </div>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full p-6 text-2xl border-4 border-black font-black focus:outline-none bg-white shadow-[6px_6px_0px_0px_black] focus:shadow-none focus:translate-x-1 focus:translate-y-1" 
                    />
                  </div>
                  <div className="pt-8 space-y-6">
                    <button type="submit" className="w-full sm:w-auto px-16 py-8 bg-black text-white border-4 border-black font-black text-xl uppercase italic shadow-[10px_10px_0px_0px_#2563EB] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-6 group">
                      <Shield className="w-8 h-8 group-hover:scale-110 transition-transform" /> UPDATE SECURELY
                    </button>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                       <Zap className="w-4 h-4 text-[#FACC15]" /> Takes 10 seconds · 100% Safe
                    </p>
                  </div>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-gray-100 border-8 border-black p-8 sm:p-12 md:p-16 flex flex-col xl:flex-row xl:items-center justify-between gap-12 md:gap-16 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-6xl mx-auto w-full group">
                <div className="space-y-6">
                  <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black italic leading-none group-hover:text-red-600 transition-colors">DANGER ZONE</h3>
                  <p className="text-lg md:text-xl font-bold text-gray-500 max-w-xl leading-snug uppercase tracking-tight">
                    Delete your account. This will permanently remove your resumes, roadmaps, and all your data.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
                  <button 
                    onClick={handleSignOut}
                    className="flex-1 px-12 py-6 bg-white text-black border-4 border-black font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    Log Out
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className={`flex-1 px-12 py-6 border-4 border-black font-black uppercase text-xs tracking-widest transition-all shadow-[6px_6px_0px_black] ${confirmDelete ? 'bg-red-600 text-white animate-pulse' : 'bg-white text-red-600 hover:bg-red-600 hover:text-white'}`}
                  >
                    {confirmDelete ? 'SURE? CLICK AGAIN' : 'Delete Everything'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messaging Matrix */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 50 }}
              className={`fixed bottom-8 sm:bottom-12 right-4 sm:right-12 p-8 sm:p-12 border-8 border-black shadow-[12px_12px_0px_0px_black] z-[100] flex flex-col gap-6 max-w-[90vw] sm:max-w-sm ${message.type === 'success' ? 'bg-blue-600 text-white' : 'bg-black text-red-400'}`}
            >
              <div className="flex items-center gap-6">
                {message.type === 'success' ? <CheckCircle2 className="w-12 h-12" /> : <ShieldAlert className="w-12 h-12 animate-pulse" />}
                <p className="text-xl font-black uppercase tracking-tight leading-none italic">{message.text}</p>
              </div>
              <div className="w-full h-4 bg-white/20 border-4 border-black/10">
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
       <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="border-8 border-black p-20 bg-white shadow-[16px_16px_0px_0px_black]">
            <Loader2 className="w-16 h-16 text-black animate-spin" />
          </div>
       </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
