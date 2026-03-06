"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    UploadCloud, FileVideo, Clock,
    ArrowRight, Sparkles, TrendingUp, Loader2,
    Users, Globe, FileText, Image as ImageIcon,
    LayoutGrid, Trash2, Edit2, Check, X
} from "lucide-react";
import { CursorAwareButton } from "@/components/CursorAwareButton";
import { Navbar } from "@/components/layout/navbar";
import toast, { Toaster } from "react-hot-toast";

// Dummy Data
const DUMMY_SOCIETAL_POSTS = [
    { id: "1", postType: "Text", topic: "AI in Education", trend_alignment_score: 92, date: "2026-03-01T12:00:00Z" },
    { id: "2", postType: "Video", topic: "Climate Tech", trend_alignment_score: 85, date: "2026-02-28T09:30:00Z" },
    { id: "3", postType: "Photo", topic: "Remote Work", trend_alignment_score: 78, date: "2026-02-25T15:45:00Z" },
    { id: "4", postType: "Text", topic: "Quantum Computing", trend_alignment_score: 95, date: "2026-02-20T11:20:00Z" },
];

export default function SocietiesDashboard({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;

    // Right Column States
    const [activeTab, setActiveTab] = useState("Text");
    const [textContent, setTextContent] = useState("");
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);

    // Edit specific states
    const [editingTopicId, setEditingTopicId] = useState(null);
    const [editTopicValue, setEditTopicValue] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            if (!userIdFromParams) return;
            setIsLoadingPosts(true);
            try {
                const res = await fetch(`/api/societies?userId=${userIdFromParams}`);
                const data = await res.json();
                if (data.audits) {
                    setPosts(data.audits);
                }
            } catch (error) {
                console.error("Failed to fetch societal audits:", error);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [userIdFromParams]);

    // Card Action Handlers
    const confirmDelete = (e, jobId) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        toast((t) => (
            <div className="flex flex-col gap-4">
                <div>
                    <h4 className="text-gray-900 font-bold mb-1">Delete Audit?</h4>
                    <p className="text-gray-500 text-sm">Are you sure you want to permanently delete this societal audit? This action cannot be undone.</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            handleDelete(jobId);
                        }}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-[0_4px_15px_rgba(244,63,94,0.3)] transition-all"
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: {
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(244,63,94,0.2)'
            }
        });
    };

    const handleDelete = async (jobId) => {
        const previousPosts = [...posts]; // Save state for rollback
        setPosts(prevPosts => prevPosts.filter(p => (p.jobId || p.id) !== jobId));

        try {
            const res = await fetch(`/api/societies/${jobId}?userId=${userIdFromParams}`, { method: "DELETE" });
            if (!res.ok) {
                console.error("Failed to delete audit");
                setPosts(previousPosts); // Revert on failure
                toast.error("Failed to delete audit.");
            } else {
                toast.success("Audit deleted successfully.", {
                    style: { borderRadius: '12px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' },
                    iconTheme: { primary: '#10b981', secondary: '#fff' }
                });
            }
        } catch (error) {
            console.error("Error deleting audit:", error);
            setPosts(previousPosts); // Revert on failure
            toast.error("An error occurred.");
        }
    };

    const handleUpdateTopic = async (e, jobId, newTopic) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!newTopic.trim()) return;
        setEditingTopicId(null);

        const previousPosts = [...posts]; // Save state for rollback
        setPosts(prevPosts => prevPosts.map(p =>
            (p.jobId || p.id) === jobId ? { ...p, topic: newTopic } : p
        ));

        try {
            const res = await fetch(`/api/societies/${jobId}?userId=${userIdFromParams}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newTopic })
            });
            if (!res.ok) {
                console.error("Failed to update topic");
                setPosts(previousPosts); // Revert on failure
                toast.error("Failed to update title.");
            } else {
                toast.success("Title updated.", {
                    style: { borderRadius: '12px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' },
                    iconTheme: { primary: '#10b981', secondary: '#fff' }
                });
            }
        } catch (error) {
            console.error("Error updating topic:", error);
            setPosts(previousPosts); // Revert on failure
            toast.error("An error occurred.");
        }
    };

    // Upload Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        if (!isAnalyzing) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (isAnalyzing) return;
        const droppedFile = e.dataTransfer.files[0];

        if (activeTab === "Photo" && droppedFile?.type.startsWith('image/')) {
            setFile(droppedFile);
        } else if (activeTab === "Video" && droppedFile?.type.startsWith('video/')) {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        if (isAnalyzing) return;
        const selectedFile = e.target.files[0];
        if (activeTab === "Photo" && selectedFile?.type.startsWith('image/')) {
            setFile(selectedFile);
        } else if (activeTab === "Video" && selectedFile?.type.startsWith('video/')) {
            setFile(selectedFile);
        }
    };

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();

        // Validation
        if (activeTab === "Text" && !textContent.trim()) return;
        if ((activeTab === "Photo" || activeTab === "Video") && !file) return;
        if (isAnalyzing) return;

        setIsAnalyzing(true);
        setStatusMessage("");

        try {
            const jobId = crypto.randomUUID();
            const currentFeature = "societies";

            if (activeTab === "Text") {
                setStatusMessage('Submitting text for societal audit...');

                const sqsRes = await fetch('/api/societies-sqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        userId: userIdFromParams,
                        postType: 'text',
                        content: textContent
                    })
                });

                if (!sqsRes.ok) throw new Error('Failed to submit text for audit');

                setStatusMessage('Text successfully queued for audit!');
                setTextContent("");

                // Add to UI optimistically
                setPosts([{
                    jobId,
                    postType: 'Text',
                    topic: textContent.substring(0, 50) + '...',
                    createdAt: new Date().toISOString()
                }, ...posts]);

            } else {
                setStatusMessage('Requesting secure upload link...');

                const presignRes = await fetch('/api/societies-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type || (activeTab === 'Photo' ? 'image/jpeg' : 'video/mp4'),
                        userId: userIdFromParams,
                        feature: currentFeature
                    })
                });

                if (!presignRes.ok) throw new Error('Failed to get upload URL');

                const { presignedUrl, s3Key, userId: returnedUserId, feature: returnedFeature } = await presignRes.json();

                setStatusMessage('Uploading media to secure vault...');
                const uploadRes = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type || (activeTab === 'Photo' ? 'image/jpeg' : 'video/mp4') },
                    body: file
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file to vault');

                setStatusMessage('Upload complete. Queueing for societal audit...');

                const sqsRes = await fetch('/api/societies-sqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        userId: returnedUserId || userIdFromParams,
                        postType: activeTab.toLowerCase(),
                        content: s3Key
                    })
                });

                if (!sqsRes.ok) throw new Error('Failed to queue media analysis in SQS');

                setStatusMessage('Media successfully uploaded and queued for audit!');
                setFile(null);

                // Add to UI optimistically
                setPosts([{
                    jobId,
                    postType: activeTab,
                    topic: file.name,
                    createdAt: new Date().toISOString()
                }, ...posts]);
            }
        } catch (error) {
            console.error("Error during upload:", error);
            setStatusMessage(`Error: ${error.message || "An unexpected error occurred."}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper for icons based on post type
    const getPostIcon = (type) => {
        switch (type) {
            case 'Text': return <FileText className="w-6 h-6 text-indigo-500" />;
            case 'Photo': return <ImageIcon className="w-6 h-6 text-emerald-500" />;
            case 'Video': return <FileVideo className="w-6 h-6 text-orange-500" />;
            default: return <LayoutGrid className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 font-sans relative overflow-x-hidden">
            <Toaster position="top-center" reverseOrder={false} />

            {/* Background Gradients - Keeping theme from analyze page */}
            <div className="fixed top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[400px] opacity-40 blur-[80px]"
                    style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] opacity-[0.15] blur-[100px] rounded-full"
                    style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-6 pb-6 lg:pb-12 max-w-[1400px] mx-auto h-full flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch relative flex-1 min-h-0">

                    {/* LEFT COLUMN: Analyzed Posts */}
                    <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-h-0">
                        <div className="mb-10 shrink-0">
                            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-950 mb-3 tracking-tight">
                                Societal <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">Audits</span>
                            </h2>
                            <p className="text-lg text-gray-500 font-medium">Your historical content perception & generational alignment.</p>
                        </div>

                        {/* Posts Grid */}
                        <div className="overflow-y-auto pr-4 pb-4 custom-scrollbar flex-1 min-h-0">
                            {isLoadingPosts ? (
                                <div className="flex flex-col items-center justify-center p-32 h-full">
                                    <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Audits...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 h-full relative group">
                                    <div className="relative z-10 w-24 h-24 rounded-full bg-emerald-50/80 border border-emerald-100 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform duration-700">
                                        <Users className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">No audits completed yet</h3>
                                    <p className="text-gray-500 max-w-sm text-center">Run an audit on a post to see how different generations perceive it.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {posts.map((post, idx) => (
                                        <Link href={`/societies/${userIdFromParams}/${post.jobId || post.id}`} key={post.jobId || post.id || idx} className="cursor-pointer pb-2 block">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                                                className="group relative bg-white rounded-[2rem] p-5 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-500 overflow-hidden h-full flex flex-col justify-between"
                                            >
                                                {/* Delete Button */}
                                                <div className="absolute top-16 right-4 z-20">
                                                    <button
                                                        onClick={(e) => confirmDelete(e, post.jobId || post.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all duration-300 shadow-sm border border-gray-100 bg-white"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Gradient Border on Hover */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                {/* Top section */}
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 overflow-hidden relative">
                                                        {post.mediaUrl && post.postType?.toLowerCase() === 'photo' || post.postType?.toLowerCase() === 'image' ? (
                                                            <img src={post.mediaUrl} alt="thumbnail" className="w-full h-full object-cover" />
                                                        ) : post.mediaUrl && post.postType?.toLowerCase() === 'video' ? (
                                                            <video src={`${post.mediaUrl}#t=0.1`} className="w-full h-full object-cover" muted playsInline />
                                                        ) : (
                                                            getPostIcon(post.postType?.charAt(0).toUpperCase() + post.postType?.slice(1))
                                                        )}
                                                    </div>
                                                    <div className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                        {post.postType || "Unknown"}
                                                    </div>
                                                </div>

                                                {/* Info Area */}
                                                <div className="space-y-4 relative z-10">
                                                    <div className="flex justify-between items-end gap-4">
                                                        <div className="flex-1 group/title relative">
                                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Globe className="w-3 h-3" /> Topic</p>
                                                            {editingTopicId === (post.jobId || post.id) ? (
                                                                <div
                                                                    className="flex items-center gap-2 pr-2"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        value={editTopicValue}
                                                                        onChange={(e) => setEditTopicValue(e.target.value)}
                                                                        className="flex-1 w-full bg-gray-50 border border-emerald-300 rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                                                        autoFocus
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') handleUpdateTopic(e, post.jobId || post.id, editTopicValue);
                                                                            if (e.key === 'Escape') setEditingTopicId(null);
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={(e) => handleUpdateTopic(e, post.jobId || post.id, editTopicValue)}
                                                                        className="p-1 rounded-md bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTopicId(null); }}
                                                                        className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="relative flex items-start">
                                                                    <h3 className="font-serif font-medium text-xl leading-snug text-gray-900 line-clamp-2">
                                                                        {post.topic || post.topic_summary || `Untitled ${post.postType || 'Content'} Audit`}
                                                                    </h3>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            setEditingTopicId(post.jobId || post.id);
                                                                            setEditTopicValue(post.topic || post.topic_summary || `Untitled ${post.postType || 'Content'} Audit`);
                                                                        }}
                                                                        className="opacity-0 group-hover/title:opacity-100 p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all bg-white shadow-sm border border-gray-100 ml-2 mt-0.5"
                                                                    >
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100/50 pt-4">
                                                        <div className="flex items-center gap-1.5 opacity-80">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {post.createdAt || post.date ? formatDistanceToNow(new Date(post.createdAt || post.date), { addSuffix: true }) : "Unknown date"}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-emerald-600 font-bold uppercase text-[10px] tracking-widest group-hover:text-emerald-500 transition-colors">
                                                            View Audit <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Initiate Audit */}
                    <div className="lg:col-span-5 xl:col-span-5 pb-10 lg:pb-0 font-sans mt-0 flex flex-col h-full justify-center relative z-20">
                        <div className="bg-white rounded-[3rem] p-8 py-10 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] h-fit max-w-lg mx-auto w-full group overflow-hidden relative">
                            {/* Animated Background flairs */}
                            <motion.div
                                animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none"
                            />

                            <div className="relative z-10 w-full text-center mb-8">
                                <h3 className="text-3xl font-serif font-medium text-gray-950 mb-3 tracking-tight">Initiate Audit</h3>
                                <p className="text-gray-500 text-sm font-medium">Submit content to analyze how different generations will perceive it.</p>
                            </div>

                            {/* Tabs Toggle */}
                            <div className="relative z-10 flex p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl mb-8 border border-gray-200/50 w-full">
                                {['Text', 'Photo', 'Video'].map((tab) => (
                                    <button
                                        key={tab}
                                        disabled={isAnalyzing}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setFile(null); // Clear file when switching tabs
                                            setStatusMessage("");
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${activeTab === tab
                                            ? 'bg-white text-gray-900 shadow-[0_4px_15px_rgba(0,0,0,0.05)] scale-[1.02]'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                            }`}
                                    >
                                        {tab === 'Text' && <FileText className="w-4 h-4" />}
                                        {tab === 'Photo' && <ImageIcon className="w-4 h-4" />}
                                        {tab === 'Video' && <FileVideo className="w-4 h-4" />}
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Forms Based on Tab */}
                            {activeTab === 'Text' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative z-10 mb-8 w-full"
                                >
                                    <textarea
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        disabled={isAnalyzing}
                                        placeholder="Paste your caption, tweet, or ideas here..."
                                        className="w-full h-48 p-5 bg-gray-50/50 backdrop-blur-sm border-2 border-gray-200 rounded-[2rem] focus:outline-none focus:border-emerald-300 focus:bg-white resize-none transition-all placeholder:text-gray-400 font-medium text-gray-800 disabled:opacity-50"
                                    />
                                </motion.div>
                            )}

                            {(activeTab === 'Photo' || activeTab === 'Video') && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative z-10 mb-8 w-full"
                                >
                                    <label
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`w-full relative flex flex-col items-center justify-center py-12 px-6 rounded-[2rem] bg-gray-50/50 backdrop-blur-sm transition-all duration-500 overflow-hidden cursor-pointer group/dropzone
                                            ${isDragging ? 'bg-emerald-50/80 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)] scale-[1.02]' : 'hover:bg-gray-50 hover:shadow-[0_10px_30px_rgba(16,185,129,0.05)]'}
                                            ${file && !isAnalyzing ? 'bg-emerald-50/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}
                                            ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}
                                        `}
                                    >
                                        {/* Dynamic Borders */}
                                        {!file && (
                                            <div className={`absolute inset-0 rounded-[2rem] border-2 border-dashed pointer-events-none transition-colors duration-500 ${isDragging ? 'border-emerald-400' : 'border-gray-200 group-hover/dropzone:border-emerald-300'}`} />
                                        )}
                                        {file && !isDragging && (
                                            <div className="absolute inset-0 rounded-[2rem] border-2 border-solid border-emerald-300 pointer-events-none" />
                                        )}

                                        <input
                                            type="file"
                                            accept={activeTab === 'Photo' ? "image/*" : "video/*"}
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={isAnalyzing}
                                        />

                                        <motion.div
                                            animate={isDragging ? { y: [0, -10, 0] } : {}}
                                            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0, ease: "easeInOut" }}
                                            className={`relative z-10 p-5 rounded-2xl mb-4 transition-all duration-500 shadow-sm ${file ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white text-gray-400 group-hover/dropzone:text-emerald-500 group-hover/dropzone:-translate-y-1 group-hover/dropzone:shadow-md border border-gray-100'}`}
                                        >
                                            {activeTab === 'Photo'
                                                ? (file ? <ImageIcon className="w-8 h-8" /> : <UploadCloud className="w-8 h-8 group-hover/dropzone:scale-110 transition-transform duration-300" />)
                                                : (file ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8 group-hover/dropzone:scale-110 transition-transform duration-300" />)
                                            }
                                        </motion.div>

                                        <h4 className="relative z-10 text-lg font-serif font-medium text-gray-900 mb-2 line-clamp-1 w-full text-center px-4">
                                            {file ? file.name : `Drop your ${activeTab.toLowerCase()} here`}
                                        </h4>

                                        <p className="relative z-10 text-gray-400 font-medium text-xs text-center uppercase tracking-widest">
                                            {file
                                                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready`
                                                : activeTab === 'Photo' ? "JPG, PNG, WEBP" : "MP4, MOV, WEBM"}
                                        </p>
                                    </label>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <div
                                className={`relative z-10 w-full transition-opacity duration-300 flex justify-center ${(isAnalyzing || (activeTab === 'Text' && !textContent.trim()) || ((activeTab === 'Photo' || activeTab === 'Video') && !file))
                                    ? 'opacity-50 pointer-events-none'
                                    : 'opacity-100'
                                    }`}
                                onClick={handleAnalyze}
                            >
                                <CursorAwareButton
                                    variant="dark"
                                    className={`w-full !py-3.5 flex justify-center max-w-sm`}
                                >
                                    <span className="flex items-center justify-center gap-2 font-medium text-base">
                                        {isAnalyzing ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing Audit...</>
                                        ) : (
                                            <><Users className="w-5 h-5" /> Run Societal Audit</>
                                        )}
                                    </span>
                                </CursorAwareButton>
                            </div>

                            {statusMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative z-10 w-full mt-6 text-center text-sm font-medium p-4 rounded-xl ${statusMessage.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                                >
                                    {statusMessage}
                                </motion.div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
