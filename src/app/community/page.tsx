'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  orderBy,
  increment,
  getDocs
} from 'firebase/firestore';
import { validateCareerInput } from '@/lib/aiGuard';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Flame, 
  MessageCircle, 
  AlertOctagon, 
  ChevronDown, 
  Send, 
  X, 
  Loader2, 
  CheckCircle2,
  AlertTriangle,
  Award,
  Briefcase,
  Edit2,
  Image as ImageIcon,
  Video as VideoIcon,
  Globe,
  ArrowUpRight,
  Sparkles,
  Smile,
  Calendar,
  BarChart2,
  FileText,
  ChevronDown as ChevronDownIcon,
  ThumbsUp,
  Repeat,
  CheckCircle,
  Heart,
  Upload,
  Camera,
  Cloud,
  Play,
  Volume2,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentCommunity() {
  const { user, userData } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Post Blog State
  const [newContent, setNewContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [eduLink, setEduLink] = useState('');

  // Device file upload states
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingType, setUploadingType] = useState<'photo' | 'video' | null>(null);

  // Admin scheduled meetings list
  const [meetings, setMeetings] = useState<any[]>([]);

  // Live broadcast simulated overlay states (legacy stream fallback support)
  const [showLiveRoom, setShowLiveRoom] = useState(false);
  const [liveComments, setLiveComments] = useState<any[]>([
    { id: '1', authorName: 'Surja', authorRole: 'Care Leaver Advocacy Expert', text: 'So excited to be part of this conversation! 🔥', time: '8:30 PM' },
    { id: '2', authorName: 'Rahul Paswan', authorRole: 'Student Scholar', text: 'Family Beyond Blood is such a beautiful topic.', time: '8:32 PM' },
    { id: '3', authorName: 'Priya Sen', authorRole: 'UX Mentor', text: 'Looking forward to hearing from Karishma and Nisha! ⭐️', time: '8:33 PM' }
  ]);
  const [newLiveComment, setNewLiveComment] = useState('');
  const [liveReactions, setLiveReactions] = useState<{ id: string, type: string, x: number }[]>([]);

  // Emoji & Calendar event scheduler states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEventScheduler, setShowEventScheduler] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventPlatform, setEventPlatform] = useState('Google Meet');
  const [eventLink, setEventLink] = useState('');

  // Form Field Toggles
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Comments Drawer States (Map of postId -> comments list, loading state, input state)
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Double Click Heart Animation Tracker (postId -> boolean)
  const [doubleClickHearts, setDoubleClickHearts] = useState<Record<string, boolean>>({});

  // Local Likes and Reposts Tracker for instant Optimistic UI
  const [localLikedPosts, setLocalLikedPosts] = useState<string[]>([]);
  const [localRepostCount, setLocalRepostCount] = useState<Record<string, number>>({});

  // Report Abuse State
  const [reportingPost, setReportingPost] = useState<any>(null);
  const [reportReason, setReportReason] = useState('');

  // Edit own post
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editEduLink, setEditEduLink] = useState('');

  // Notifications Alert
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Fetch Community Posts Realtime (Index-Free In-Memory Sorted)
  useEffect(() => {
    const q = query(collection(db, 'community_posts'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = data.filter((p: any) => p.hidden !== true);
      // Sort in-memory to prevent composite index blocks
      filtered.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setPosts(filtered);
      setLoading(false);
    }, (error) => {
      console.error("[Community] Firestore posts fetch error:", error);
      setLoading(false); // Escape loading screen hang
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Active Admin Meetings / Webinars Real-time
  useEffect(() => {
    const q = query(collection(db, 'meetings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by creation date
      data.sort((a: any, b: any) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      setMeetings(data);
    }, (err) => {
      console.error("[Community] Firestore meetings fetch error:", err);
    });
    return () => unsubscribe();
  }, []);

  // 3. Realtime Comments Listener (Index-Free In-Memory Sorted)
  useEffect(() => {
    if (!openCommentsPostId) return;

    setCommentsLoading(prev => ({ ...prev, [openCommentsPostId]: true }));
    
    const q = query(collection(db, `community_posts/${openCommentsPostId}/comments`));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      commentsList.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });
      setCommentsMap(prev => ({ ...prev, [openCommentsPostId]: commentsList }));
      setCommentsLoading(prev => ({ ...prev, [openCommentsPostId]: false }));
    }, (err) => {
      console.error("Failed to load comments:", err);
      setCommentsLoading(prev => ({ ...prev, [openCommentsPostId]: false }));
    });

    return () => unsubscribe();
  }, [openCommentsPostId]);

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Edit own post modal setup
  const openEditModal = (post: any) => {
    setEditingPost(post);
    setEditContent(post.content || '');
    setEditPhotoUrl(post.photoUrl || '');
    setEditVideoUrl(post.videoUrl || '');
    setEditEduLink(post.eduLink || '');
  };

  // Submit Post Abuse report to Firestore collection
  const handleReportPost = async () => {
    if (!user || !reportingPost || !reportReason.trim()) return;
    try {
      await addDoc(collection(db, 'reports'), {
        postId: reportingPost.id,
        postContent: reportingPost.content || '',
        reason: reportReason.trim(),
        reporterId: user.uid,
        reporterName: userData?.name || user.email?.split('@')[0],
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      
      const postRef = doc(db, 'community_posts', reportingPost.id);
      await updateDoc(postRef, {
        reportsCount: increment(1)
      });
      
      setReportingPost(null);
      setReportReason('');
      triggerAlert('success', 'TRANSMISSION REPORTED FOR AUDIT. 🚨');
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'REPORT ROUTING FAILED.');
    }
  };

  // Local Device File Upload processor (PC and Mobile Phone cameras/galleries)
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingType(type);
    setUploadProgress(10);
    
    // Simulate real-time uploading progress bar in Neo-Brutalist frame
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 120);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'photo') {
          setPhotoUrl(reader.result as string);
          triggerAlert('success', 'LOCAL PC/MOBILE PHOTO LOADED! 📸');
        } else {
          setVideoUrl(reader.result as string);
          triggerAlert('success', 'LOCAL PC/MOBILE VIDEO LOADED! 🎥');
        }
        setUploadProgress(null);
        setUploadingType(null);
      };
      reader.readAsDataURL(file);
    }, 850);
  };

  // Spawn reactive floating emoji particles in simulated live event stream
  const triggerLiveReaction = (type: string) => {
    const id = Date.now().toString() + Math.random().toString();
    const x = Math.random() * 120 - 60; // offset
    setLiveReactions(prev => [...prev, { id, type, x }]);
    setTimeout(() => {
      setLiveReactions(prev => prev.filter(r => r.id !== id));
    }, 2800);
  };

  // call serverless AI to enhance the post draft text
  const handleEnhancePost = async () => {
    if (!newContent.trim()) {
      triggerAlert('error', 'WRITE A POST DRAFT FIRST TO ENHANCE! ✍️');
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setNewContent(data.enhancedText);
      triggerAlert('success', 'POST ENHANCED WITH AI INTEL! ✨');
    } catch (err: any) {
      triggerAlert('error', `AI COUPLER ERROR: ${err.message}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Inject LinkedIn Job Hunt Template
  const handleInjectJobTemplate = () => {
    const template = `Hi everyone! I'm seeking a new role and would appreciate your support. If you hear of any opportunities or just want to catch up, please send me a message or comment below. I'd love to reconnect. #OpenToWork\n\nAbout me & what I'm looking for:\n💼 I'm looking for Frontend Developer, Full-stack Developer, and Web Developer Internship roles.\n🌏 I'm open to roles in Bengaluru.\n⭐️ I've previously worked at Software Services.`;
    setNewContent(template);
    triggerAlert('success', '#OPENTOWORK TEMPLATE INJECTED! 💼');
  };

  // Create Community Post with Blog attachments
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newContent.trim()) return;

    const safety = validateCareerInput(newContent);
    if (!safety.allowed) {
      triggerAlert('error', `POST BLOCKED: ${safety.message}`);
      return;
    }

    try {
      await addDoc(collection(db, 'community_posts'), {
        content: newContent,
        photoUrl: photoUrl.trim() || null,
        videoUrl: videoUrl.trim() || null,
        eduLink: eduLink.trim() || null,
        authorId: user.uid,
        authorName: userData?.name || user.email?.split('@')[0],
        authorRole: userData?.role || 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportsCount: 0,
        hidden: false,
        repostsCount: 0,
        reactions: { like: 0, fire: 0, rocket: 0 }
      });

      setNewContent('');
      setPhotoUrl('');
      setVideoUrl('');
      setEduLink('');
      setShowPhotoInput(false);
      setShowVideoInput(false);
      setShowLinkInput(false);
      setIsAdding(false);
      triggerAlert('success', 'TRANSMISSION DEPLOYED TO COHORT! ⚡');
    } catch (err) {
      triggerAlert('error', 'DEPLOYMENT TIMEOUT. RETRY AGAIN.');
    }
  };

  // Edit own post
  const handleUpdatePost = async () => {
    if (!user || !editingPost || !editContent.trim()) return;

    const safety = validateCareerInput(editContent);
    if (!safety.allowed) {
      triggerAlert('error', `UPDATE BLOCKED: ${safety.message}`);
      return;
    }

    try {
      const postRef = doc(db, 'community_posts', editingPost.id);
      await updateDoc(postRef, {
        content: editContent,
        photoUrl: editPhotoUrl.trim() || null,
        videoUrl: editVideoUrl.trim() || null,
        eduLink: editEduLink.trim() || null,
        updatedAt: new Date().toISOString()
      });

      setEditingPost(null);
      setEditContent('');
      setEditPhotoUrl('');
      setEditVideoUrl('');
      setEditEduLink('');
      triggerAlert('success', 'TRANSMISSION MODIFIED.');
    } catch (err) {
      triggerAlert('error', 'UPDATE PROTOCOL FAILURE.');
    }
  };

  // Delete own post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("PERMANENTLY PURGE THIS POST FROM CENTRAL GRID?")) return;
    try {
      await deleteDoc(doc(db, 'community_posts', postId));
      triggerAlert('success', 'TRANSMISSION ERASED.');
    } catch (err) {
      triggerAlert('error', 'PURGE PROTOCOL FAILED.');
    }
  };

  // Add Comment to Post
  const handleAddComment = async (postId: string) => {
    if (!user) return;
    const commentInput = commentInputs[postId] || '';
    if (!commentInput.trim()) return;

    const safety = validateCareerInput(commentInput);
    if (!safety.allowed) {
      triggerAlert('error', `COMMENT BLOCKED: ${safety.message}`);
      return;
    }

    try {
      await addDoc(collection(db, `community_posts/${postId}/comments`), {
        content: commentInput,
        authorId: user.uid,
        authorName: userData?.name || user.email?.split('@')[0],
        authorRole: userData?.role || 'student',
        createdAt: new Date().toISOString()
      });

      // Clear matching comment input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      triggerAlert('error', 'COMMENT ROUTING FAILED.');
    }
  };

  // Reaction Increments
  const handleReact = async (postId: string, type: 'like' | 'fire' | 'rocket') => {
    if (!user) return;
    try {
      // Optimistic UI updates
      if (type === 'like') {
        if (localLikedPosts.includes(postId)) {
          setLocalLikedPosts(prev => prev.filter(id => id !== postId));
        } else {
          setLocalLikedPosts(prev => [...prev, postId]);
        }
      }
      
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        [`reactions.${type}`]: increment(1)
      });
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  // Repost Action (SaaS increment)
  const handleRepost = async (postId: string) => {
    if (!user) return;
    try {
      // Optimistic UI
      setLocalRepostCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }));
      
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        repostsCount: increment(1)
      });
      triggerAlert('success', 'TRANSMISSION REPOSTED TO CENTRAL GRID! 🔁');
    } catch (err) {
      console.error("Failed to repost:", err);
    }
  };

  // Share post URL link
  const handleShareLink = (postId: string) => {
    const postUrl = `${window.location.origin}/community#post-${postId}`;
    navigator.clipboard.writeText(postUrl);
    triggerAlert('success', 'LINK COPIED TO CLIPBOARD! 📢');
  };

  // Instagram Double-Tap to Heart
  const handleDoubleTap = async (postId: string) => {
    if (!user) return;
    setDoubleClickHearts(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setDoubleClickHearts(prev => ({ ...prev, [postId]: false }));
    }, 800);

    await handleReact(postId, 'like');
  };

  const defaultRealPhoto = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
  const userAvatarUrl = user?.photoURL || userData?.photoUrl || defaultRealPhoto;
  const userName = userData?.name || user?.displayName || 'vishwajeet srk';

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-40 pb-20 px-6 md:px-12 text-black">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 border-4 border-black bg-[#0A66C2] text-white px-8 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_0px_black] flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            {alertMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Community Feed (2 Span width) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Header Block */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-8 border-black pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black text-[#FACC15] shadow-[4px_4px_0px_0px_#2563EB]">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Student Central Cohort</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                STUDENT <span className="text-blue-600 not-italic">FEED</span>
              </h1>
            </div>
            
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-3 bg-black text-white px-6 py-3.5 border-4 border-black font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_#2563EB] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={3} /> Share Update
            </button>
          </div>

          {/* Feed list */}
          <div className="space-y-12">
            {loading ? (
              <div className="py-24 text-center">
                 <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                 <p className="font-black uppercase text-xs text-slate-400 tracking-widest">Syncing Feed...</p>
              </div>
            ) : posts.length === 0 ? (
               <div className="bg-white border-8 border-black p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-16 h-16 border-4 border-black bg-[#FACC15] flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                     <MessageSquare className="w-8 h-8 text-black" />
                  </div>
                  <p className="font-black uppercase text-xl text-black tracking-tight italic">DreamSync Feed Empty.</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-3">Be the pioneer! Publish the first update on the student central cohort grid.</p>
               </div>
            ) : posts.map((post) => {
              const isAuthor = post.authorId === user?.uid;
              const commentsOpen = openCommentsPostId === post.id;
              const commentsList = commentsMap[post.id] || [];
              const commLoading = commentsLoading[post.id] || false;
              
              const reactions = post.reactions || { like: 0, fire: 0, rocket: 0 };
              const isMentor = post.authorRole === 'mentor' || post.authorRole === 'super_admin';
              
              const totalLikes = (reactions.like || 0) + (localLikedPosts.includes(post.id) ? 1 : 0);
              const repostCount = (post.repostsCount || 0) + (localRepostCount[post.id] || 0);
              const isHeartAnimating = doubleClickHearts[post.id] || false;
              
              const commentVal = commentInputs[post.id] || '';

              return (
                <motion.div 
                  key={post.id}
                  id={`post-${post.id}`}
                  layout
                  className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black] hover:border-black transition-all flex flex-col group overflow-hidden"
                >
                  
                  {/* 1. Author Top Header */}
                  <div className="flex justify-between items-center p-4 border-b-4 border-black bg-white relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-black rounded-full overflow-hidden bg-[#FACC15] flex items-center justify-center shadow-[2px_2px_0px_0px_black]">
                           {isAuthor ? (
                             <img src={userAvatarUrl} alt={post.authorName} className="w-full h-full object-cover" />
                           ) : (
                             <span className="font-black uppercase text-sm">{post.authorName?.charAt(0) || 'D'}</span>
                           )}
                        </div>
                        <div>
                           <div className="flex items-center gap-1.5">
                             <h4 className="font-black uppercase text-xs leading-none">{post.authorName}</h4>
                             {isMentor && (
                               <span className="bg-black text-[#FACC15] px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest border border-black shadow-[1px_1px_0px_0px_black] flex items-center gap-0.5">
                                  <Award className="w-2.5 h-2.5" /> Mentor
                               </span>
                             )}
                           </div>
                           <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                             {new Date(post.createdAt).toLocaleDateString()} • <Globe className="w-3 h-3 text-slate-400" />
                           </p>
                        </div>
                     </div>

                     {/* Delete/Edit own operations */}
                     {isAuthor ? (
                       <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(post)}
                            className="p-1.5 bg-slate-50 border border-black hover:bg-slate-100 transition-colors"
                          >
                             <Edit2 className="w-3 h-3" strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-500 transition-colors"
                          >
                             <Trash2 className="w-3 h-3" strokeWidth={3} />
                          </button>
                       </div>
                     ) : (
                       <button onClick={() => setReportingPost(post)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <AlertOctagon className="w-4 h-4" />
                       </button>
                     )}
                  </div>

                  {/* 2. Text Caption */}
                  <div className="px-5 pt-4 pb-2 space-y-3 bg-white">
                     <p className="text-xs font-semibold text-slate-800 leading-relaxed break-words whitespace-pre-wrap select-all">
                        {post.content}
                     </p>
                  </div>

                  {/* 3. Main Visual Asset */}
                  {post.photoUrl && (
                    <div 
                      onDoubleClick={() => handleDoubleTap(post.id)}
                      className="w-full aspect-square md:aspect-[4/3] border-y-4 border-black relative overflow-hidden bg-slate-50 cursor-pointer select-none group"
                    >
                       <img 
                         src={post.photoUrl} 
                         alt="Instagram Feed Content" 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                         onError={(e) => {
                           (e.target as any).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'; // fallback
                         }}
                       />

                       {/* Double-Tap Heart Overlay Animation */}
                       <AnimatePresence>
                         {isHeartAnimating && (
                           <motion.div 
                             initial={{ scale: 0.3, opacity: 0 }}
                             animate={{ scale: [1, 1.2, 0.9, 1], opacity: 1 }}
                             exit={{ scale: 1.5, opacity: 0 }}
                             transition={{ duration: 0.6 }}
                             className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none"
                           >
                              <Heart className="w-24 h-24 text-red-600 fill-current drop-shadow-[0_0_12px_rgba(220,38,38,0.6)]" />
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  )}

                  {post.videoUrl && !post.photoUrl && (
                    <div className="w-full aspect-square md:aspect-[4/3] border-y-4 border-black overflow-hidden shadow-inner bg-black flex items-center justify-center">
                       <video 
                         src={post.videoUrl} 
                         controls 
                         className="w-full h-full object-cover"
                       />
                    </div>
                  )}

                  {/* Reference Link Citation Box */}
                  {post.eduLink && (
                    <div className="px-5 py-2">
                       <a 
                         href={post.eduLink} 
                         target="_blank" 
                         className="block border-2 border-black bg-blue-50/10 p-3 hover:translate-x-[-1.5px] hover:translate-y-[-1.5px] hover:shadow-[3px_3px_0px_0px_#2563EB] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all group/link"
                       >
                         <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[#2563EB]">
                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Educational Link</span>
                            <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                         </div>
                         <p className="text-[10px] font-bold truncate mt-1 text-slate-500 lowercase">{post.eduLink}</p>
                       </a>
                    </div>
                  )}

                  {/* 4. Activity Ledger */}
                  {totalLikes > 0 || commentsList.length > 0 || repostCount > 0 ? (
                    <div className="px-5 pt-3 pb-2 text-[9px] font-black uppercase text-slate-400 select-none flex justify-between items-center border-b-2 border-slate-50 bg-white">
                       <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[#0A66C2] text-white flex items-center justify-center border border-black">
                             <ThumbsUp className="w-2.5 h-2.5 fill-current text-white" />
                          </div>
                          <span className="text-black">Liked by {totalLikes} users</span>
                       </div>
                       <div className="flex gap-2">
                          <span>{commentsList.length} comment{commentsList.length === 1 ? '' : 's'}</span>
                          <span>•</span>
                          <span>{repostCount} repost{repostCount === 1 ? '' : 's'}</span>
                       </div>
                    </div>
                  ) : null}

                  {/* 5. Action Buttons Bar */}
                  <div className="grid grid-cols-4 border-b-2 border-slate-100 bg-white relative z-10 text-center font-black text-[10px] uppercase">
                     <button 
                       onClick={() => handleReact(post.id, 'like')}
                       className={`py-3 flex items-center justify-center gap-1.5 transition-all hover:bg-slate-50 ${localLikedPosts.includes(post.id) ? 'text-[#0A66C2]' : 'text-slate-600'}`}
                     >
                       <ThumbsUp className={`w-4 h-4 ${localLikedPosts.includes(post.id) ? 'fill-current' : ''}`} /> Like
                     </button>
                     
                     <button 
                       onClick={() => setOpenCommentsPostId(commentsOpen ? null : post.id)}
                       className="py-3 flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-50 transition-all"
                     >
                       <MessageSquare className="w-4 h-4" /> Comment
                     </button>

                     <button 
                       onClick={() => handleRepost(post.id)}
                       className="py-3 flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-50 transition-all"
                     >
                       <Repeat className="w-4 h-4" /> Repost
                     </button>

                     <button 
                       onClick={() => handleShareLink(post.id)}
                       className="py-3 flex items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-50 transition-all animate-pulse"
                     >
                       <Send className="w-4 h-4" /> Send
                     </button>
                  </div>

                  {/* 6. Live Collapsible Comments Drawer & Inline comment input */}
                  <AnimatePresence>
                    {commentsOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t-4 border-black p-4 bg-slate-50 space-y-4 overflow-hidden"
                      >
                        <div className="flex gap-3 items-center bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_black] rounded-full">
                           <div className="w-8 h-8 rounded-full border border-black overflow-hidden shrink-0 shadow-[1px_1px_0px_0px_black]">
                              <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
                           </div>
                           <input 
                             value={commentVal}
                             onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                             placeholder="Add a comment..."
                             className="flex-grow border-none focus:outline-none font-bold text-xs bg-transparent"
                             onKeyDown={e => {
                               if (e.key === 'Enter') handleAddComment(post.id);
                             }}
                           />
                           <div className="flex items-center gap-2 pr-2 text-slate-400">
                              <Smile className="w-5 h-5 hover:text-black cursor-pointer" />
                              <ImageIcon className="w-5 h-5 hover:text-black cursor-pointer" />
                           </div>
                        </div>

                        <div className="space-y-4 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                           {commLoading ? (
                             <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                           ) : commentsList.length === 0 ? (
                             <p className="text-[9px] font-black text-slate-400 uppercase italic pl-2">No comments on this signal yet.</p>
                           ) : commentsList.map((comm) => (
                             <div key={comm.id} className="flex gap-3 items-start pl-2">
                                <div className="w-7 h-7 rounded-full border-2 border-black overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_black]">
                                   {comm.authorId === user?.uid ? (
                                     <img src={userAvatarUrl} alt={comm.authorName} className="w-full h-full object-cover" />
                                   ) : (
                                     <span className="font-black uppercase text-[9px]">{comm.authorName?.charAt(0) || 'A'}</span>
                                   )}
                                </div>
                                <div className="flex-1 space-y-1">
                                   <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_black]">
                                      <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                                         <div className="flex items-center gap-1">
                                            <span className="font-black uppercase text-[#2563EB]">{comm.authorName}</span>
                                            {comm.authorRole === 'mentor' && (
                                              <span className="bg-black text-[#FACC15] px-1 py-0.5 text-[5px] font-black uppercase tracking-widest border border-black shadow-[0.5px_0.5px_0px_0px_black] flex items-center">
                                                 <CheckCircle className="w-2 h-2 text-green-400" /> Mentor
                                              </span>
                                            )}
                                         </div>
                                         <span>{new Date(comm.createdAt).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Care Leaver Independent Scholar</p>
                                      <p className="text-[10px] font-bold text-slate-700 pt-2 leading-relaxed">{comm.content}</p>
                                   </div>
                                   <div className="flex gap-4 pl-2 text-[8px] font-black uppercase text-slate-400">
                                      <button className="hover:text-blue-600 transition-colors">Like</button>
                                      <button className="hover:text-blue-600 transition-colors">Reply</button>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: WeLive Upcoming Events & Community Guidelines Sidebar (1 Span width) */}
        <div className="space-y-8">
           
           {/* Active Live Sync Beacon */}
           <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_black] flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Live Grid Status</span>
              <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                 <span className="text-[9px] font-black uppercase text-green-600">Sync Pipeline Active</span>
              </div>
           </div>

           {/* Dynamic WeLive Foundation / Admin Scheduled Webinar Sidebar Widgets */}
           {meetings.length === 0 ? (
               <div className="border-8 border-black bg-white p-5 shadow-[8px_8px_0px_0px_black] space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="px-2 py-1 bg-[#FACC15] border-2 border-black text-[7px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_black]">
                        Upcoming broadcast
                     </span>
                     <Tv className="w-5 h-5 text-slate-400" />
                  </div>

                  <div className="space-y-2">
                     <div className="flex gap-2 items-center text-[7px] font-black uppercase text-slate-400 tracking-wider">
                        <span>WeLive Foundation</span>
                        <span>•</span>
                        <span>1d ago</span>
                     </div>
                     
                     <h3 className="text-lg font-black uppercase italic leading-tight">
                        Fireside Chat 3.0
                     </h3>
                     <p className="text-[10px] font-black text-[#2563EB] uppercase">
                        Topic: Family Beyond Blood
                     </p>
                     <p className="text-[9px] font-bold text-slate-600 leading-normal">
                        "Not all families are born; some are beautifully built." Join Nisha Das and Karishma Jha for an empathetic dialogue.
                     </p>
                  </div>

                  {/* Event Metadata Banner */}
                  <div className="bg-slate-50 border-2 border-black p-3 space-y-1.5 text-[8px] font-black uppercase">
                     <div className="flex justify-between">
                        <span className="text-slate-400">📅 Date:</span>
                        <span>30th May, 2026</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-400">⏰ Time:</span>
                        <span>8:30 PM (IST)</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-slate-400">📍 Venue:</span>
                        <span className="text-red-600">🔴 Google Meet / Zoom</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => {
                      window.open('https://meet.google.com/vdw-zngu-pux', '_blank');
                      triggerAlert('success', 'CONNECTING TO GOOGLE MEET SESSION... 🔴');
                    }}
                    className="w-full py-3 bg-[#FACC15] hover:bg-yellow-400 text-black border-4 border-black font-black uppercase italic text-xs shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-2 animate-bounce"
                  >
                     <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block animate-ping" /> Join Live Room
                  </button>
               </div>
            ) : (
              meetings.map((meet: any) => (
                <div key={meet.id} className="border-8 border-black bg-white p-5 shadow-[8px_8px_0px_0px_black] space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-purple-600 text-white border-2 border-black text-[7px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_black]">
                         Admin Broadcast
                      </span>
                      <Tv className="w-5 h-5 text-[#2563EB]" />
                   </div>

                   <div className="space-y-2">
                      <div className="flex gap-2 items-center text-[7px] font-black uppercase text-slate-400 tracking-wider">
                         <span>Cohort Scheduled Broadcast</span>
                         <span>•</span>
                         <span>Active</span>
                      </div>
                      
                      <h3 className="text-lg font-black uppercase italic leading-tight">
                         {meet.title}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-600 leading-normal whitespace-pre-line">
                         {meet.desc || 'No description provided.'}
                      </p>
                   </div>

                   {/* Event Metadata Banner */}
                   <div className="bg-slate-50 border-2 border-black p-3 space-y-1.5 text-[8px] font-black uppercase">
                      <div className="flex justify-between">
                         <span className="text-slate-400">📅 Date:</span>
                         <span>{meet.date}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">⏰ Time:</span>
                         <span>{meet.time}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-slate-400">📍 Venue:</span>
                         <span className="text-red-600">🔴 Google Meet / Zoom</span>
                      </div>
                   </div>

                   <button 
                     onClick={() => {
                       window.open(meet.link.startsWith('http') ? meet.link : `https://${meet.link}`, '_blank');
                       triggerAlert('success', 'ROUTING TO CENTRAL CONVERSATION... 🚀');
                     }}
                     className="w-full py-3 bg-[#FACC15] hover:bg-yellow-400 text-black border-4 border-black font-black uppercase italic text-xs shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-2"
                   >
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block animate-ping" /> Join Live Room
                   </button>
                </div>
              ))
            )}

           {/* Community Guidelines Board */}
           <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_black] space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2">Central cohort Guidelines</h4>
              <ul className="space-y-2 text-[9px] font-bold text-slate-500 uppercase list-disc list-inside">
                 <li>No toxicity allowed. Be supportive.</li>
                 <li>All career posts are vetted by operators.</li>
                 <li>Flag spam updates via the report abuse button.</li>
                 <li>Verify links before pasting.</li>
              </ul>
           </div>
        </div>

      </div>

      {/* ───── MODAL: LINKEDIN DRAFT BUILDER ───── */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white border-8 border-black max-w-xl w-full p-6 md:p-8 shadow-[16px_16px_0px_0px_black] flex flex-col justify-between"
            >
              <form onSubmit={handleCreatePost} className="space-y-6">
                 {/* 1. Header Bar: Profile User info */}
                 <div className="flex justify-between items-center pb-4 border-b-2 border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_black]">
                          <img src={userAvatarUrl} alt={userName} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <div className="flex items-center gap-1">
                             <h3 className="font-black uppercase text-sm leading-none">{userName}</h3>
                          </div>
                       </div>
                    </div>
                    <button type="button" onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-100 border border-black shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 {/* 2. Text Area */}
                 <div className="space-y-2 relative border-b border-slate-100 pb-2">
                    <textarea 
                      ref={textareaRef}
                      required
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      placeholder="What do you want to talk about?"
                      rows={6}
                      className="w-full border-none focus:outline-none placeholder:text-slate-300 font-bold text-sm bg-transparent resize-none leading-relaxed"
                    />
                 </div>

                 {/* Emoji Picker Console */}
                 <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-3 border-4 border-black bg-slate-50 shadow-[3px_3px_0px_0px_black] overflow-hidden">
                         <p className="text-[8px] font-black uppercase tracking-widest text-[#2563EB] mb-2">Select Cohort Emoji</p>
                         <div className="flex flex-wrap gap-2">
                            {['😀', '🚀', '🔥', '💼', '🎓', '💻', '🤝', '📝', '💡', '🌟', '🎯', '📅', '📣', '✅', '✨', '❤️', '🎉', '👋'].map((emoji) => (
                              <button 
                                key={emoji}
                                type="button" 
                                onClick={() => {
                                  setNewContent(prev => prev + emoji);
                                  triggerAlert('success', `${emoji} Emoji Inserted! 🚀`);
                                  setTimeout(() => textareaRef.current?.focus(), 50);
                                }}
                                className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:bg-slate-50 transition-all"
                              >
                                 {emoji}
                              </button>
                            ))}
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 {/* Upgraded attachments draw panels */}
                 <AnimatePresence>
                    {showPhotoInput && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 border-4 border-black bg-slate-50 space-y-4 shadow-[4px_4px_0px_0px_black]">
                         <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-[#2563EB] tracking-widest">Add Post Photo</label>
                         </div>

                         {/* Drag-drop / Upload Local device */}
                         <div className="border-4 border-dashed border-slate-300 bg-white p-6 text-center cursor-pointer hover:border-black transition-colors relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleLocalFileUpload(e, 'photo')} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase">Upload from PC or Mobile Phone</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Accepts JPEG, PNG, WebP up to 10MB</p>
                         </div>

                         {/* Progress bar */}
                         {uploadingType === 'photo' && uploadProgress !== null && (
                           <div className="space-y-1.5">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                 <span>Uploading File...</span>
                                 <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 border-2 border-black h-4 overflow-hidden shadow-[2px_2px_0px_0px_black]">
                                 <div className="bg-[#FACC15] h-full border-r-2 border-black transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                           </div>
                         )}

                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Or Paste Image URL</label>
                            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..." className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none" />
                         </div>

                         {photoUrl && (
                           <div className="border-4 border-black relative aspect-[4/3] overflow-hidden bg-slate-100 shadow-[3px_3px_0px_0px_black]">
                              <img src={photoUrl} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setPhotoUrl('')} className="absolute top-2 right-2 bg-red-600 border-2 border-black text-white p-1.5 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-[8px] font-black uppercase">Remove</button>
                           </div>
                         )}
                      </motion.div>
                    )}
                    
                    {showVideoInput && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 border-4 border-black bg-slate-50 space-y-4 shadow-[4px_4px_0px_0px_black]">
                         <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black uppercase text-[#2563EB] tracking-widest">Add Post Video</label>
                         </div>

                         {/* Drag-drop / Upload Local device */}
                         <div className="border-4 border-dashed border-slate-300 bg-white p-6 text-center cursor-pointer hover:border-black transition-colors relative">
                            <input 
                              type="file" 
                              accept="video/*" 
                              onChange={(e) => handleLocalFileUpload(e, 'video')} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            />
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase">Upload from PC or Mobile Phone</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Accepts MP4, Mov, WebM up to 50MB</p>
                         </div>

                         {/* Progress bar */}
                         {uploadingType === 'video' && uploadProgress !== null && (
                           <div className="space-y-1.5">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                 <span>Uploading Video...</span>
                                 <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 border-2 border-black h-4 overflow-hidden shadow-[2px_2px_0px_0px_black]">
                                 <div className="bg-[#FACC15] h-full border-r-2 border-black transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                           </div>
                         )}

                         <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Or Paste Video URL</label>
                            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://..." className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none" />
                         </div>

                         {videoUrl && (
                           <div className="border-4 border-black relative aspect-[4/3] overflow-hidden bg-slate-100 shadow-[3px_3px_0px_0px_black]">
                              <video src={videoUrl} controls className="w-full h-full object-cover" />
                              <button type="button" onClick={() => setVideoUrl('')} className="absolute top-2 right-2 bg-red-600 border-2 border-black text-white p-1.5 shadow-[2px_2px_0px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-[8px] font-black uppercase">Remove</button>
                           </div>
                         )}
                      </motion.div>
                    )}

                    {showLinkInput && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-3 border-2 border-black bg-slate-50 space-y-1.5">
                         <label className="text-[8px] font-black uppercase text-[#2563EB] tracking-widest">Reference Hyperlink</label>
                         <input value={eduLink} onChange={e => setEduLink(e.target.value)} placeholder="Paste educational article link..." className="w-full p-2 border border-black bg-white text-[10px] font-semibold focus:outline-none" />
                      </motion.div>
                    )}

                    {/* Calendar Event Scheduler Panel */}
                    {showEventScheduler && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="p-4 border-4 border-black bg-slate-50 space-y-4 shadow-[4px_4px_0px_0px_black]">
                         <div className="flex justify-between items-center pb-2 border-b-2 border-black">
                            <label className="text-[10px] font-black uppercase text-[#2563EB] tracking-widest">Schedule Cohort Session invitation</label>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[8px] font-black uppercase text-slate-400">Event Date</label>
                               <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none" />
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[8px] font-black uppercase text-slate-400">Event Time</label>
                               <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none" />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className="text-[8px] font-black uppercase text-slate-400">Platform invite type</label>
                               <select value={eventPlatform} onChange={e => setEventPlatform(e.target.value)} className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none">
                                  <option value="Google Meet">Google Meet 🔴</option>
                                  <option value="Zoom Meeting">Zoom Meeting 🖥️</option>
                                  <option value="Discord Webinar">Discord Webinar 👥</option>
                               </select>
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[8px] font-black uppercase text-slate-400">Invite URL</label>
                               <input type="text" value={eventLink} onChange={e => setEventLink(e.target.value)} placeholder="https://meet.google.com/..." className="w-full p-2 border-2 border-black bg-white text-[10px] font-semibold focus:outline-none" />
                            </div>
                         </div>

                         <button 
                           type="button" 
                           onClick={() => {
                             if (!eventDate) {
                               triggerAlert('error', 'Please select a valid event Date! 📅');
                               return;
                             }
                             const formattedInvite = `\n\n📅 Scheduled Cohort Event invitation:\n🗓️ Date: ${eventDate}\n⏰ Time: ${eventTime || 'TBD'}\n📍 Venue: ${eventPlatform}${eventLink ? `\n🔗 Invitation Link: ${eventLink}` : ''}\nCome participate and enjoy with us! 👋`;
                             setNewContent(prev => prev + formattedInvite);
                             setShowEventScheduler(false);
                             setEventDate('');
                             setEventTime('');
                             setEventLink('');
                             triggerAlert('success', 'EVENT INJECTED TO POST TEXT! 🗓️');
                             setTimeout(() => textareaRef.current?.focus(), 50);
                           }}
                           className="w-full py-3 bg-[#FACC15] border-4 border-black text-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                         >
                            Inject Webinar Invite 🗓️
                         </button>
                      </motion.div>
                    )}
                 </AnimatePresence>

                 {/* 3. Bottom Toolbar Console */}
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6 border-t-2 border-slate-100">
                    
                    {/* Left: AI Enhancer & Attachments */}
                    <div className="flex flex-wrap items-center gap-4">
                       <button 
                         type="button"
                         disabled={isEnhancing}
                         onClick={handleEnhancePost}
                         className="flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-white hover:bg-slate-50 font-black uppercase text-[10px] shadow-[2.5px_2.5px_0px_0px_black] hover:shadow-none hover:translate-x-[2.5px] hover:translate-y-[2.5px] transition-all disabled:opacity-50"
                       >
                          {isEnhancing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enhancing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Enhance post
                            </>
                          )}
                       </button>

                       {/* Attachments Icons */}
                       <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                          <button type="button" onClick={() => setShowPhotoInput(!showPhotoInput)} className={`p-1.5 border rounded-sm transition-all ${showPhotoInput ? 'bg-[#FACC15] border-black shadow-[1.5px_1.5px_0px_0px_black]' : 'border-transparent text-slate-400 hover:text-black hover:bg-slate-50'}`}>
                             <ImageIcon className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={() => setShowVideoInput(!showVideoInput)} className={`p-1.5 border rounded-sm transition-all ${showVideoInput ? 'bg-[#FACC15] border-black shadow-[1.5px_1.5px_0px_0px_black]' : 'border-transparent text-slate-400 hover:text-black hover:bg-slate-50'}`}>
                             <VideoIcon className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className={`p-1.5 border rounded-sm transition-all ${showLinkInput ? 'bg-[#FACC15] border-black shadow-[1.5px_1.5px_0px_0px_black]' : 'border-transparent text-slate-400 hover:text-black hover:bg-slate-50'}`}>
                             <Globe className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={handleInjectJobTemplate} className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-50 border border-transparent rounded-sm transition-all">
                             <Briefcase className="w-5 h-5" />
                          </button>
                          <button 
                             type="button" 
                             onClick={() => {
                               setShowEmojiPicker(!showEmojiPicker);
                               setShowEventScheduler(false);
                             }}
                             className={`p-1.5 border rounded-sm transition-all ${showEmojiPicker ? 'bg-[#FACC15] border-black shadow-[1.5px_1.5px_0px_0px_black]' : 'border-transparent text-slate-400 hover:text-black hover:bg-slate-50'}`}
                           >
                              <Smile className="w-5 h-5" />
                           </button>
                           <button 
                             type="button" 
                             onClick={() => {
                               setShowEventScheduler(!showEventScheduler);
                               setShowEmojiPicker(false);
                             }}
                             className={`p-1.5 border rounded-sm transition-all ${showEventScheduler ? 'bg-[#FACC15] border-black shadow-[1.5px_1.5px_0px_0px_black]' : 'border-transparent text-slate-400 hover:text-black hover:bg-slate-50'}`}
                           >
                              <Calendar className="w-5 h-5" />
                           </button>
                       </div>
                    </div>

                    {/* Right: Submit */}
                    <button type="submit" className="px-6 py-3.5 bg-[#2563EB] text-white border-4 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                       Post
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── MODAL: EDIT POST PROTOCOL ───── */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black max-w-xl w-full p-6 shadow-[16px_16px_0px_0px_black]"
            >
              <div className="flex justify-between items-start border-b-4 border-black pb-3 mb-6">
                 <h2 className="text-xl font-black uppercase italic">Edit Transmission</h2>
                 <button onClick={() => setEditingPost(null)} className="p-1 border border-black hover:bg-slate-100">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">Update Caption Text</label>
                    <textarea 
                      required
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 border-2 border-black">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-[#2563EB]">Photo URL</label>
                       <input value={editPhotoUrl} onChange={e => setEditPhotoUrl(e.target.value)} className="w-full p-2 border border-black text-[9px] font-semibold bg-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-[#2563EB]">Video URL</label>
                       <input value={editVideoUrl} onChange={e => setEditVideoUrl(e.target.value)} className="w-full p-2 border border-black text-[9px] font-semibold bg-white" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[8px] font-black uppercase text-[#2563EB]">Edu Link</label>
                       <input value={editEduLink} onChange={e => setEditEduLink(e.target.value)} className="w-full p-2 border border-black text-[9px] font-semibold bg-white" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
                    <button 
                      onClick={() => setEditingPost(null)}
                      className="py-3 border-2 border-black font-black uppercase text-[10px]"
                    >
                      Abort
                    </button>
                    <button 
                      onClick={handleUpdatePost}
                      className="py-3 bg-[#FACC15] border-2 border-black font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                      Apply Edit ⚡
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── MODAL: REPORT ABUSE ───── */}
      <AnimatePresence>
        {reportingPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-8 border-black max-w-md w-full p-6 shadow-[16px_16px_0px_0px_black]"
            >
              <div className="flex justify-between items-start border-b-4 border-black pb-3 mb-6">
                 <h2 className="text-lg font-black uppercase italic flex items-center gap-2 text-red-600">
                   <AlertTriangle className="w-5 h-5 text-red-600" /> Flag Abuse
                 </h2>
                 <button onClick={() => setReportingPost(null)} className="p-1 border border-black hover:bg-slate-100">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-6">
                 <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed">
                   Help enforce friendly career conversations. Explain why this post breaches code-of-conduct guidelines.
                 </p>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">Abuse Reason</label>
                    <textarea 
                      required
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      placeholder="e.g. Toxicity, hate-speech, spam links, unsupportive behaviors, self-harm signals."
                      rows={4}
                      className="w-full p-4 border-4 border-black font-bold focus:outline-none focus:bg-slate-50 transition-all text-xs"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setReportingPost(null)}
                      className="py-3 border-2 border-black font-black uppercase text-[10px]"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={handleReportPost}
                      className="py-3 bg-red-600 text-white border-2 border-black font-black uppercase text-[10px] shadow-[3px_3px_0px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                    >
                       Deploy Report 🚨
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ───── MODAL: LIVE FIRESIDE CHAT BROADCAST ROOM ───── */}
      <AnimatePresence>
        {showLiveRoom && (
          <div className="fixed inset-0 z-[70] bg-black flex flex-col lg:flex-row overflow-hidden text-white font-mono">
             {/* Left Pane: Simulated Streaming Area */}
             <div className="flex-1 flex flex-col justify-between p-6 border-b-4 lg:border-b-0 lg:border-r-4 border-white bg-slate-900 relative">
                
                <div className="flex justify-between items-center z-10">
                   <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-red-600 border-2 border-white font-black text-[9px] uppercase tracking-widest animate-pulse flex items-center gap-1.5 shadow-[2px_2px_0px_0px_white]">
                         <span className="w-2 h-2 bg-white rounded-full inline-block" /> LIVE BROADCAST
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-widest bg-black/60 px-3 py-1 border border-slate-700">
                         👥 247 Scholars Watching
                      </span>
                   </div>
                   
                   <button 
                     onClick={() => setShowLiveRoom(false)}
                     className="px-4 py-2 border-2 border-white bg-black hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                   >
                      Exit Room
                   </button>
                </div>

                {/* Central Stream Screen */}
                <div className="my-8 flex-1 flex flex-col items-center justify-center relative">
                   <div className="max-w-md w-full border-8 border-white bg-black shadow-[16px_16px_0px_0px_#2563EB] overflow-hidden flex flex-col">
                      <div className="bg-[#0A66C2] text-white p-4 border-b-4 border-white text-center">
                         <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">Fireside Chat 3.0</h2>
                         <p className="text-[8px] font-bold tracking-widest uppercase mt-1">Family Beyond Blood — Online</p>
                      </div>
                      
                      <div className="grid grid-cols-2 border-b-4 border-white aspect-[16/9] bg-slate-950 relative">
                         <div className="border-r-4 border-white flex flex-col items-center justify-center p-4 relative group">
                            <div className="w-16 h-16 rounded-full border-4 border-[#FACC15] bg-[#2563EB] flex items-center justify-center font-black uppercase text-xl shadow-[3px_3px_0px_0px_black] mb-2 overflow-hidden">
                               <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-[#FACC15]">Karishma</span>
                            <span className="text-[6px] font-bold text-slate-300 uppercase tracking-widest text-center mt-0.5">HR Executive • PERSOL APAC</span>
                            <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-ping border border-white" />
                         </div>

                         <div className="flex flex-col items-center justify-center p-4 relative group">
                            <div className="w-16 h-16 rounded-full border-4 border-[#FACC15] bg-[#2563EB] flex items-center justify-center font-black uppercase text-xl shadow-[3px_3px_0px_0px_black] mb-2 overflow-hidden">
                               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-[#FACC15]">Nisha</span>
                            <span className="text-[6px] font-bold text-slate-300 uppercase tracking-widest text-center mt-0.5">Program Associate • PACT INDIA</span>
                         </div>

                         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/85 px-4 py-1.5 border border-white flex items-center gap-1">
                            {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((bar, idx) => (
                              <motion.div 
                                key={idx}
                                animate={{ height: [4, 16, 4] }}
                                transition={{ repeat: Infinity, duration: 0.6 + Math.random() * 0.8 }}
                                className="w-[2px] bg-red-500" 
                              />
                            ))}
                         </div>
                      </div>

                      <div className="bg-white text-black p-2.5 text-[6px] font-black uppercase tracking-widest flex justify-around items-center">
                         <span>🤝 UDAYAN CARE</span>
                         <span>❤️ MAKE A DIFFERENCE</span>
                         <span>🏠 WELIVE FOUNDATION</span>
                         <span>✨ MIRACLE FOUNDATION</span>
                      </div>
                   </div>

                   {/* Floating reactions */}
                   <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                      <AnimatePresence>
                         {liveReactions.map(reaction => (
                           <motion.div 
                             key={reaction.id}
                             initial={{ y: 400, x: reaction.x, scale: 0.8, opacity: 1 }}
                             animate={{ y: -100, x: reaction.x + (Math.sin(reaction.x) * 40), scale: 1.4, opacity: 0 }}
                             exit={{ opacity: 0 }}
                             transition={{ duration: 2.2, ease: 'easeOut' }}
                             className="absolute bottom-10 left-1/2 -translate-x-1/2 text-2xl"
                           >
                              {reaction.type === 'like' && '👍'}
                              {reaction.type === 'heart' && '❤️'}
                              {reaction.type === 'fire' && '🔥'}
                              {reaction.type === 'rocket' && '🚀'}
                           </motion.div>
                         ))}
                      </AnimatePresence>
                   </div>
                </div>

                <div className="flex justify-between items-center z-10">
                   <div className="flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-[#FACC15]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stream Sound: Active</span>
                   </div>
                   
                   <div className="flex gap-3 bg-black/60 p-2.5 border border-slate-700 shadow-[3px_3px_0px_0px_white]">
                      <button onClick={() => triggerLiveReaction('like')} className="hover:scale-125 transition-transform text-sm">👍</button>
                      <button onClick={() => triggerLiveReaction('heart')} className="hover:scale-125 transition-transform text-sm">❤️</button>
                      <button onClick={() => triggerLiveReaction('fire')} className="hover:scale-125 transition-transform text-sm">🔥</button>
                      <button onClick={() => triggerLiveReaction('rocket')} className="hover:scale-125 transition-transform text-sm">🚀</button>
                   </div>
                </div>

             </div>

             {/* Right Pane: Live Chat */}
             <div className="w-full lg:w-[400px] flex flex-col justify-between bg-slate-950 p-6 border-l border-slate-800">
                <div className="space-y-4 flex flex-col h-full justify-between">
                   <div className="border-b border-slate-800 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15] flex items-center gap-2">
                         💬 REALTIME COHORT CHAT
                      </h3>
                      <p className="text-[7.5px] font-bold text-slate-500 uppercase mt-1">Comments are visible to all live participants</p>
                   </div>

                   <div className="flex-1 my-4 overflow-y-auto pr-1 space-y-4 max-h-[400px] lg:max-h-[550px] custom-scrollbar flex flex-col justify-end">
                      {liveComments.map(comment => (
                        <div key={comment.id} className="bg-slate-900 border-2 border-white/10 p-3 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)]">
                           <div className="flex justify-between items-center text-[7.5px] font-black uppercase">
                              <span className="text-[#FACC15]">{comment.authorName}</span>
                              <span className="text-slate-500">{comment.time}</span>
                           </div>
                           <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{comment.authorRole}</p>
                           <p className="text-[9.5px] text-slate-100 font-semibold mt-2 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                   </div>

                   <form 
                     onSubmit={(e) => {
                       e.preventDefault();
                       if (!newLiveComment.trim()) return;
                       const newMsg = {
                         id: Date.now().toString(),
                         authorName: userName || 'Scholar',
                         authorRole: 'Care Leaver Student Scholar',
                         text: newLiveComment.trim(),
                         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                       };
                       setLiveComments(prev => [...prev, newMsg]);
                       setNewLiveComment('');
                       triggerLiveReaction('heart');
                     }}
                     className="flex gap-2 pt-3 border-t border-slate-800"
                   >
                      <input 
                        value={newLiveComment}
                        onChange={e => setNewLiveComment(e.target.value)}
                        placeholder="Say something nice..."
                        className="flex-grow p-3 bg-slate-900 border-2 border-white/20 text-xs font-semibold focus:outline-none focus:border-white placeholder:text-slate-500 text-white"
                      />
                      <button type="submit" className="px-4 py-3 bg-[#FACC15] text-black border-2 border-white font-black uppercase text-xs shadow-[2px_2px_0px_0px_white] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                         Send
                      </button>
                   </form>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
