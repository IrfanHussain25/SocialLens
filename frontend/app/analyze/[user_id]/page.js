"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    UploadCloud, FileVideo, Play, Clock,
    ArrowRight, Sparkles, TrendingUp, Loader2, Link as LinkIcon, Instagram, Youtube, Trash2, RotateCcw
} from "lucide-react";
import { CursorAwareButton } from "@/components/CursorAwareButton";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "react-toastify";

export default function AnalyzeDashboard({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;

    const [file, setFile] = useState(null);
    const [instagramUrl, setInstagramUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [uploadType, setUploadType] = useState("file"); // "file" | "instagram" | "youtube"
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [videos, setVideos] = useState([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    const [videoToDelete, setVideoToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        let isFirstLoad = true;

        const fetchAnalyses = async () => {
            if (!userIdFromParams) return;
            if (isFirstLoad) setIsLoadingVideos(true);
            try {
                const res = await fetch(`/api/analyses?userId=${userIdFromParams}`);
                const data = await res.json();
                if (data.analyses) {
                    setVideos(prev => {
                        const fetchedAnalysesMap = new Map(data.analyses.map(v => [v.jobId, v]));
                        const optimisticToKeep = prev.filter(v => v.isOptimistic && !fetchedAnalysesMap.has(v.jobId));
                        const combined = [...optimisticToKeep, ...data.analyses];
                        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        return combined;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch analyses:", error);
            } finally {
                if (isFirstLoad) {
                    setIsLoadingVideos(false);
                    isFirstLoad = false;
                }
            }
        };

        fetchAnalyses();
    }, [userIdFromParams]);

    // Active Polling: Start polling 30 seconds after upload, then every 10 seconds.
    useEffect(() => {
        const hasGeneratingVideos = videos.some(v => v.status === 'GENERATING' || v.isOptimistic);
        if (!hasGeneratingVideos || !userIdFromParams) return;

        let intervalId;
        let timeoutId;

        const pollAnalyses = async () => {
            try {
                const res = await fetch(`/api/analyses?userId=${userIdFromParams}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.analyses) {
                    setVideos(prev => {
                        const fetchedMap = new Map(data.analyses.map(v => [v.jobId, v]));
                        const optimisticToKeep = prev.filter(v => v.isOptimistic && !fetchedMap.has(v.jobId));
                        const combined = [...optimisticToKeep, ...data.analyses];
                        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        return combined;
                    });
                }
            } catch (error) {
                console.error("Polling failed:", error);
            }
        };

        timeoutId = setTimeout(() => {
            pollAnalyses();
            intervalId = setInterval(pollAnalyses, 10000);
        }, 30000);

        return () => {
            clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [userIdFromParams, videos]);

    const handleReset = () => {
        setFile(null);
        setInstagramUrl("");
        setYoutubeUrl("");
        setStatusMessage("");
        setIsDragging(false);
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
        if (droppedFile && droppedFile.type.startsWith('video/')) {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e) => {
        if (isAnalyzing) return;
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
        }
    };

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();

        if (isAnalyzing) return;
        if (uploadType === "file" && !file) return;
        
        if (uploadType === "instagram") {
            const url = instagramUrl.trim();
            if (!url) return;
            const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/;
            if (!instagramRegex.test(url)) {
                toast.error("Please enter a valid Instagram URL");
                return;
            }
        }

        if (uploadType === "youtube") {
            const url = youtubeUrl.trim();
            if (!url) return;
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
            if (!youtubeRegex.test(url)) {
                toast.error("Please enter a valid YouTube URL");
                return;
            }
        }

        setIsAnalyzing(true);
        setStatusMessage("");

        try {
            setStatusMessage('Requesting secure upload link...');

            // Extract a reliable user ID from AWS Amplify's user object
            const currentUserId = user?.userId || user?.username || "anonymous_user";
            let currentFeature = "analysis";
            if (uploadType === "youtube") {
                currentFeature = "youtube-analysis";
            }

            if (uploadType === "youtube") {
                setStatusMessage('Processing YouTube Video...');
                const currentJobId = crypto.randomUUID();

                const ytRes = await fetch('/api/youtube', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        youtubeUrl: youtubeUrl.trim(),
                        userId: currentUserId,
                        feature: currentFeature,
                        jobId: currentJobId
                    })
                });

                if (!ytRes.ok) throw new Error('Failed to submit YouTube video');

                const optimisticVideo = {
                    jobId: currentJobId,
                    userId: currentUserId,
                    youtubeUrl: youtubeUrl.trim(),
                    video_title: "YouTube Video",
                    status: 'GENERATING',
                    feature: currentFeature,
                    isOptimistic: true,
                    createdAt: new Date().toISOString()
                };
                setVideos(prev => [optimisticVideo, ...prev]);

                setStatusMessage('YouTube video queued successfully!');
                setYoutubeUrl("");

                setTimeout(() => {
                    setStatusMessage("");
                }, 3000);

            } else if (uploadType === "instagram") {
                setStatusMessage('Scraping Reel...');
                const currentJobId = crypto.randomUUID();

                const instaRes = await fetch('/api/instagram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: instagramUrl.trim(),
                        userId: currentUserId,
                        feature: currentFeature,
                        jobId: currentJobId
                    })
                });

                if (!instaRes.ok) throw new Error('Failed to scrape Instagram reel');

                const { s3Key } = await instaRes.json();

                setStatusMessage('Scrape complete. Queueing for DNA extraction...');

                // Trigger SQS endpoint
                const sqsRes = await fetch('/api/trigger-sqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId: currentJobId,
                        s3Key,
                        userId: currentUserId,
                        feature: currentFeature
                    })
                });

                if (!sqsRes.ok) throw new Error('Failed to queue video analysis in SQS');

                const optimisticVideo = {
                    jobId: currentJobId,
                    userId: currentUserId,
                    s3Key: s3Key,
                    video_title: "Instagram Reel",
                    status: 'GENERATING',
                    feature: currentFeature,
                    isOptimistic: true,
                    createdAt: new Date().toISOString()
                };
                setVideos(prev => [optimisticVideo, ...prev]);

                setStatusMessage('Video successfully imported and queued for analysis!');
                setInstagramUrl("");
                
                setTimeout(() => {
                    setStatusMessage("");
                }, 3000);

            } else {
                // 1. Get Pre-signed URL
                const presignRes = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type || 'video/mp4',
                        userId: currentUserId,
                        feature: currentFeature
                    })
                });

                if (!presignRes.ok) throw new Error('Failed to get upload URL');

                const { presignedUrl, jobId, s3Key, userId: returnedUserId, feature: returnedFeature } = await presignRes.json();

                // 2. Upload file directly to S3
                setStatusMessage('Uploading video directly to secure vault...');
                const uploadRes = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type || 'video/mp4' },
                    body: file
                });

                if (!uploadRes.ok) throw new Error('Failed to upload file to vault');

                setStatusMessage('Upload complete. Queueing for DNA extraction...');

                // 3. Trigger SQS endpoint
                const sqsRes = await fetch('/api/trigger-sqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jobId,
                        s3Key,
                        userId: returnedUserId || currentUserId,
                        feature: returnedFeature || currentFeature
                    })
                });

                if (!sqsRes.ok) throw new Error('Failed to queue video analysis in SQS');

                const optimisticVideo = {
                    jobId: jobId,
                    userId: returnedUserId || currentUserId,
                    s3Key: s3Key,
                    video_title: file.name,
                    status: 'GENERATING',
                    feature: returnedFeature || currentFeature,
                    isOptimistic: true,
                    createdAt: new Date().toISOString()
                };
                setVideos(prev => [optimisticVideo, ...prev]);

                setStatusMessage('Video successfully uploaded and queued for analysis!');
                setFile(null);
                
                setTimeout(() => {
                    setStatusMessage("");
                }, 3000);
            }
        } catch (error) {
            console.error("Error during upload:", error);
            setStatusMessage(`Error: ${error.message || "An unexpected error occurred."}`);
            
            setTimeout(() => {
                setStatusMessage("");
            }, 5000);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDelete = (e, video) => {
        e.preventDefault();
        e.stopPropagation();
        setVideoToDelete(video);
    };

    const confirmDelete = async () => {
        if (!videoToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/analyses?userId=${videoToDelete.userId || userIdFromParams}&jobId=${videoToDelete.jobId}&s3Key=${videoToDelete.s3Key || ''}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to delete the report");

            // Remove from local state
            setVideos(prev => prev.filter(v => v.jobId !== videoToDelete.jobId));
            setVideoToDelete(null);
            toast.success("Video successfully deleted");
        } catch (error) {
            console.error("Error deleting analysis:", error);
            toast.error("Could not delete report at this time.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 font-sans relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[400px] opacity-40 blur-[80px]"
                    style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] opacity-[0.15] blur-[100px] rounded-full"
                    style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-6 pb-6 lg:pb-12 max-w-[1400px] mx-auto h-full flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch relative flex-1 min-h-0">

                    {/* LEFT COLUMN: Analyzed Videos */}
                    <div className="lg:col-span-7 xl:col-span-7 flex flex-col min-h-0">
                        <div className="mb-10 shrink-0">
                            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-950 mb-3 tracking-tight">
                                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Analyses</span>
                            </h2>

                        </div>

                        {/* Video Grid */}
                        <div className="overflow-y-auto pr-4 pb-4 custom-scrollbar flex-1 min-h-0">
                            {isLoadingVideos ? (
                                <div className="flex flex-col items-center justify-center p-32 h-full">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Analyses...</p>
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 h-full relative group bg-white/30 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                                    {/* Animated Radar Pulse */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: [0.5, 2], opacity: [0, 0.4, 0] }}
                                                transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
                                                className="absolute w-32 h-32 rounded-full border border-indigo-400/30"
                                            />
                                        ))}
                                    </div>
                                    <div className="relative z-10 w-24 h-24 rounded-full bg-white/50 backdrop-blur-xl border border-white/80 flex items-center justify-center mb-6 shadow-[inset_0_0_20px_rgba(255,255,255,0.8),0_0_30px_rgba(79,70,229,0.1)] group-hover:scale-110 transition-transform duration-700">
                                        <FileVideo className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2 relative z-10">No content mapped yet</h3>
                                    <p className="text-gray-500 max-w-sm text-center relative z-10">Feed the engine a video to start the analysis.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {videos.map((video, idx) => {
                                        const isGenerating = video.status === 'GENERATING' || video.isOptimistic;

                                        return (
                                            <Link
                                                href={isGenerating ? '#' : `/analyze/${userIdFromParams || 'user'}/${video.jobId}`}
                                                key={video.jobId}
                                                onClick={(e) => isGenerating && e.preventDefault()}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                                                    className={`group relative backdrop-blur-2xl rounded-[2rem] p-4 border shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden ${isGenerating ? 'bg-white/20 border-indigo-200/50 cursor-default' : 'bg-white/40 border-white/60 hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)] hover:bg-white/50 cursor-pointer'}`}
                                                >
                                                    {/* Inner Glass Shine */}
                                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none rounded-[2rem]" />

                                                    {/* Gradient Border on Hover */}
                                                    {!isGenerating && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />}

                                                    {/* Thumbnail Area */}
                                                    <div className={`relative aspect-video rounded-2xl overflow-hidden mb-5 relative z-10 border shadow-inner ${isGenerating ? 'bg-indigo-50/50 border-indigo-200/50' : 'bg-gray-100/50 border-white/50'}`}>
                                                        {isGenerating ? (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                                                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2 opacity-80" />
                                                                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Extracting DNA</div>
                                                                <div className="absolute bottom-0 inset-x-0 h-1 bg-indigo-100">
                                                                    <motion.div
                                                                        initial={{ width: "0%" }}
                                                                        animate={{ width: "100%" }}
                                                                        transition={{ duration: 30, ease: "linear" }}
                                                                        className="h-full bg-indigo-400"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {video.feature === "youtube-analysis" && video.youtubeUrl ? (
                                                                    <img
                                                                        src={`https://img.youtube.com/vi/${video.youtubeUrl.includes("shorts/") ? video.youtubeUrl.split("shorts/")[1].split("?")[0] :
                                                                            video.youtubeUrl.includes("watch?v=") ? video.youtubeUrl.split("watch?v=")[1].split("&")[0] :
                                                                                video.youtubeUrl.split("/").pop()
                                                                            }/hqdefault.jpg`}
                                                                        alt="YouTube Thumbnail"
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={video.videoUrl ? `${video.videoUrl}#t=0.1` : ''}
                                                                        preload="metadata"
                                                                        muted={true}
                                                                        playsInline={true}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                                                                    />
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-60" />

                                                                {/* Play Overlay */}
                                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500">
                                                                        <Play className="w-6 h-6 text-white fill-white ml-1 shadow-sm" />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}

                                                        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border ${isGenerating ? 'border-amber-500/50 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse' : 'border-indigo-500/50 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.6)]'} text-[10px] font-bold uppercase tracking-widest z-20`}>
                                                            {video.status || "COMPLETED"}
                                                        </div>

                                                        {/* Delete Button */}
                                                        {!isGenerating && (
                                                            <button
                                                                onClick={(e) => handleDelete(e, video)}
                                                                className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white/70 hover:text-red-400 hover:bg-black/60 hover:border-red-400/50 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
                                                                aria-label="Delete report"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Info Area */}
                                                    <div className="space-y-4 relative z-10 px-1">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <h3 className="font-serif font-medium text-lg leading-snug text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-indigo-400 transition-all line-clamp-2 basis-3/4">
                                                                {isGenerating ? "Analyzing Sequence..." : (video.video_title || video.s3Key?.split('-').pop() || "Untitled Content Analysis")}
                                                            </h3>

                                                            {isGenerating ? (
                                                                <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl border bg-white/20 backdrop-blur-3xl basis-1/4 shrink-0 border-indigo-200/50 shadow-sm animate-pulse">
                                                                    <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin mb-1" />
                                                                    <span className="text-[9px] uppercase font-black tracking-[0.2em] text-indigo-500">Wait</span>
                                                                </div>
                                                            ) : (
                                                                <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border bg-white/20 backdrop-blur-3xl basis-1/4 shrink-0 transition-all duration-500 ${(video.hook_score || 0) > 80 ? 'border-emerald-300/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:border-emerald-400/80' : 'border-orange-300/50 shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] group-hover:border-orange-400/80'}`}>
                                                                    {/* Inner Glass Glow */}
                                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl pointer-events-none" />
                                                                    <div className="relative flex items-center gap-1 mb-0.5">
                                                                        <TrendingUp className={`w-3.5 h-3.5 ${(video.hook_score || 0) > 80 ? 'text-emerald-500' : 'text-orange-500'}`} />
                                                                        <span className={`text-[9px] uppercase font-black tracking-[0.2em] ${(video.hook_score || 0) > 80 ? 'text-emerald-700' : 'text-orange-700'}`}>Hook</span>
                                                                    </div>
                                                                    <span className={`text-2xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br ${(video.hook_score || 0) > 80 ? 'from-emerald-400 via-emerald-600 to-emerald-900' : 'from-amber-400 via-orange-500 to-orange-800'}`}>{video.hook_score || "?"}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100/50 pt-4">
                                                            <div className="flex items-center gap-1.5 opacity-80">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : "Unknown date"}
                                                            </div>
                                                            <div className={`flex items-center gap-1 font-bold uppercase text-[10px] tracking-widest ${isGenerating ? 'text-gray-400' : 'text-indigo-600 group-hover:text-indigo-500 transition-colors'}`}>
                                                                {isGenerating ? "Processing" : "View Report"} {!isGenerating && <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Upload Zone */}
                    <div className="lg:col-span-5 xl:col-span-5 pb-10 lg:pb-0 font-sans mt-0 flex flex-col h-full justify-center relative z-20">
                        <div className="relative bg-white/40 backdrop-blur-3xl rounded-[3rem] p-8 py-10 border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.08)] h-fit max-w-lg mx-auto w-full group overflow-hidden">
                            {/* Inner Glass Highlights */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70 pointer-events-none" />
                            {/* Animated Background flairs */}
                            <motion.div
                                animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none"
                            />
                            <motion.div
                                animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-400/10 rounded-full blur-[80px] pointer-events-none"
                            />

                            <div className="relative z-10 w-full text-center mb-6">
                                <div className="absolute top-0 right-0">
                                    <button
                                        onClick={handleReset}
                                        disabled={isAnalyzing}
                                        className="p-2 rounded-xl bg-white/20 border border-white/40 text-gray-400 hover:text-indigo-500 hover:bg-white/40 transition-all duration-300 group/reset disabled:opacity-50"
                                        title="Reset Form"
                                    >
                                        <RotateCcw className="w-4 h-4 group-hover/reset:rotate-[-45deg] transition-transform duration-500" />
                                    </button>
                                </div>
                                <h3 className="text-3xl font-serif font-medium text-gray-950 mb-3 tracking-tight">Initiate Sequence</h3>
                                <p className="text-gray-500 text-sm font-medium">Upload a video or import a reel/short to unpack its cultural DNA and engagement metrics.</p>
                            </div>

                            {/* Tabs Toggle with Framer Motion Sliding Pill */}
                            <div className="relative z-10 flex p-1.5 bg-gray-100/60 backdrop-blur-xl rounded-[1.25rem] mb-8 border border-white/40 shadow-inner w-full">
                                {["file", "instagram", "youtube"].map((type) => {
                                    const isActive = uploadType === type;
                                    const Icon = type === "file" ? UploadCloud : type === "instagram" ? Instagram : Youtube;
                                    const label = type === "file" ? "Upload File" : type === "instagram" ? "Instagram URL" : "YouTube URL";

                                    return (
                                        <button
                                            key={type}
                                            disabled={isAnalyzing}
                                            onClick={() => {
                                                setUploadType(type);
                                                setStatusMessage("");
                                            }}
                                            className={`relative w-1/3 h-[44px] flex-none flex flex-row items-center justify-center gap-1.5 px-1 rounded-xl text-[14px] font-medium transition-colors duration-300 disabled:opacity-50 z-10 ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {/* Sliding Active Background Pill */}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="uploadTabIndicator"
                                                    className="absolute inset-0 bg-white rounded-[1rem] shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-white/60 pointer-events-none"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                                />
                                            )}
                                            
                                            <span className="relative z-20 flex items-center justify-center gap-1.5 w-full">
                                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gray-900' : ''}`} />
                                              <span className="hidden sm:block truncate text-center max-w-full">{label}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {uploadType === "youtube" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative z-10 w-full"
                                >
                                    <div className="mb-8">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="text"
                                                value={youtubeUrl}
                                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                                disabled={isAnalyzing}
                                                placeholder="Paste YouTube Video URL..."
                                                className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 backdrop-blur-sm border-2 border-gray-200 hover:border-indigo-200 rounded-[2rem] focus:outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-gray-400 font-medium text-gray-800 disabled:opacity-50"
                                            />
                                        </div>
                                        <p className="mt-3 text-xs text-center text-gray-400 font-medium uppercase tracking-widest">
                                            Public YouTube Videos Only
                                        </p>
                                    </div>
                                    <div
                                        className={`relative z-10 w-full transition-opacity duration-300 flex justify-center ${(isAnalyzing || !youtubeUrl.trim()) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!isAnalyzing && youtubeUrl.trim()) handleAnalyze();
                                        }}
                                    >
                                        <CursorAwareButton variant="dark" className={`w-full !py-3 flex justify-center max-w-sm`}>
                                            <span className="flex items-center justify-center gap-2">
                                                {isAnalyzing ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Data Stream...</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4" /> Start Analysis</>
                                                )}
                                            </span>
                                        </CursorAwareButton>
                                    </div>
                                </motion.div>
                            ) : uploadType === "instagram" ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative z-10 w-full"
                                >
                                    <div className="mb-8">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="text"
                                                value={instagramUrl}
                                                onChange={(e) => setInstagramUrl(e.target.value)}
                                                disabled={isAnalyzing}
                                                placeholder="Paste Instagram Reel URL..."
                                                className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 backdrop-blur-sm border-2 border-gray-200 hover:border-indigo-200 rounded-[2rem] focus:outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-gray-400 font-medium text-gray-800 disabled:opacity-50"
                                            />
                                        </div>
                                        <p className="mt-3 text-xs text-center text-gray-400 font-medium uppercase tracking-widest">
                                            Public reels only
                                        </p>
                                    </div>
                                    <div
                                        className={`relative z-10 w-full transition-opacity duration-300 flex justify-center ${(isAnalyzing || !instagramUrl.trim()) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!isAnalyzing && instagramUrl.trim()) handleAnalyze();
                                        }}
                                    >
                                        <CursorAwareButton variant="dark" className={`w-full !py-3 flex justify-center max-w-sm`}>
                                            <span className="flex items-center justify-center gap-2">
                                                {isAnalyzing ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Data Stream...</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4" /> Start Analysis</>
                                                )}
                                            </span>
                                        </CursorAwareButton>
                                    </div>
                                </motion.div>
                            ) : (
                                <label
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`w-full relative flex flex-col items-center justify-center p-10 rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer group/dropzone
                                        ${isDragging ? 'bg-indigo-50/40 border-indigo-400 shadow-[inset_0_0_50px_rgba(79,70,229,0.2)] scale-[1.02]' : 'bg-white/10 backdrop-blur-3xl border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-[0_10px_40px_rgba(31,41,55,0.05),inset_0_0_20px_rgba(255,255,255,0.4)]'}
                                        ${file && !isAnalyzing ? 'border-indigo-300/80 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 shadow-[inset_0_0_40px_rgba(255,255,255,0.7)]' : ''}
                                        ${(!file && !isDragging) && 'border border-dashed'}
                                    `}
                                >
                                    {/* Inner Gloss */}
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                                    {file && !isAnalyzing && !isDragging && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent pointer-events-none" />
                                    )}

                                    {isAnalyzing && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200/50 z-20">
                                            <motion.div
                                                initial={{ width: "5%" }}
                                                animate={{ width: ["5%", "40%", "85%", "95%"] }} // Simulated progress
                                                transition={{ duration: 15, times: [0, 0.3, 0.8, 1], ease: "easeOut" }}
                                                className="h-full bg-gradient-to-r from-gray-900 via-gray-700 to-black shadow-[0_0_15px_rgba(17,24,39,0.5)]"
                                            />
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isAnalyzing}
                                    />

                                    <motion.div
                                        animate={isDragging && !isAnalyzing ? { y: [0, -10, 0] } : {}}
                                        transition={{ duration: 0.5, repeat: isDragging && !isAnalyzing ? Infinity : 0, ease: "easeInOut" }}
                                        className={`relative z-10 p-5 rounded-3xl mb-6 transition-all duration-500 
                                            ${isAnalyzing ? 'bg-gray-900/5 shadow-[inset_0_0_30px_rgba(17,24,39,0.05)] border border-gray-200/30 w-40 h-24 flex items-center justify-center backdrop-blur-sm' :
                                                file ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-[0_10px_40px_rgba(17,24,39,0.4),inset_0_0_20px_rgba(255,255,255,0.3)] border border-white/60' :
                                                    'bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.04),inset_0_0_15px_rgba(255,255,255,0.6)] text-gray-800 group-hover/dropzone:bg-white/90 group-hover/dropzone:text-indigo-600 group-hover/dropzone:-translate-y-2 group-hover/dropzone:shadow-[0_8px_30px_rgba(99,102,241,0.15),inset_0_0_15px_rgba(255,255,255,0.8)]'}`}
                                    >
                                        {isAnalyzing ? (
                                            <div className="flex items-center justify-center gap-1.5 h-full py-4">
                                                {[...Array(7)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 8, opacity: 0.3 }}
                                                        animate={{
                                                            height: [8, 35 + Math.random() * 20, 8],
                                                            opacity: [0.3, 1, 0.3]
                                                        }}
                                                        transition={{
                                                            duration: 1.2,
                                                            repeat: Infinity,
                                                            delay: i * 0.15,
                                                            ease: "easeInOut"
                                                        }}
                                                        className="w-1.5 rounded-full bg-gradient-to-t from-gray-900 to-gray-500 shadow-[0_0_10px_rgba(17,24,39,0.3)]"
                                                    />
                                                ))}
                                            </div>
                                        ) : file ? (
                                            <FileVideo className="w-10 h-10" />
                                        ) : (
                                            <UploadCloud className="w-10 h-10 group-hover/dropzone:scale-110 transition-transform duration-300" />
                                        )}

                                        {/* Inner icon gloss */}
                                        {file && !isAnalyzing && <div className="absolute inset-x-0 top-0 h-px bg-white/60 rounded-t-3xl" />}
                                    </motion.div>

                                    <h4 className={`relative z-10 font-serif font-medium mb-2 w-full text-center px-4 transition-all duration-500
                                        ${isAnalyzing ? 'text-gray-900 animate-pulse text-lg tracking-wide uppercase font-black' : file ? 'text-xl text-gray-900 line-clamp-1' : 'text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-black group-hover/dropzone:from-indigo-700 group-hover/dropzone:to-purple-800 line-clamp-1'}`}>
                                        {isAnalyzing ? "Transmitting Sequence..." : file ? file.name : "Drop your video here"}
                                    </h4>

                                    <p className={`relative z-10 font-bold text-[11px] text-center mb-8 uppercase tracking-widest transition-colors ${file && !isAnalyzing ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {file
                                            ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Engine Ready`
                                            : "MP4, MOV, WEBM // MAX 500MB"}
                                    </p>

                                    <div
                                        className={`relative z-10 w-full transition-opacity duration-300 flex justify-center ${(!file || isAnalyzing) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (file && !isAnalyzing) handleAnalyze();
                                        }}
                                    >
                                        <CursorAwareButton
                                            variant="dark"
                                            className={`w-full !py-3 flex justify-center max-w-sm`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {isAnalyzing ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing Data Stream...</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4" /> Start Analysis</>
                                                )}
                                            </span>
                                        </CursorAwareButton>
                                    </div>

                                    {!file && (
                                        <div className="relative z-10 mt-5 px-6 py-2.5 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-lg shadow-[0_4px_15px_rgba(17,24,39,0.05)] text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-black hover:bg-white/80 group-hover/dropzone:text-indigo-600 group-hover/dropzone:bg-white group-hover/dropzone:shadow-[0_8px_25px_rgba(99,102,241,0.15)] hover:-translate-y-0.5 transition-all duration-300 pointer-events-none group-hover/dropzone:border-indigo-300/60">
                                            Browse Local Files
                                        </div>
                                    )}
                                </label>
                            )}

                            {statusMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative z-10 mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-sm w-full transition-all duration-300 pointer-events-none 
                                        ${statusMessage.startsWith('Error') 
                                            ? 'bg-red-50/80 text-red-600 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                                            : 'bg-white/80 text-gray-800 border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]'}`}
                                >
                                    {!statusMessage.startsWith('Error') && (
                                        <div className="flex space-x-1 shrink-0">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    )}
                                    <p className="text-sm font-bold tracking-wide text-center sm:text-left">{statusMessage}</p>
                                </motion.div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Glassmorphic Delete Confirmation Modal */}
            {videoToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Dark Blurry Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={() => !isDeleting && setVideoToDelete(null)}
                    />

                    {/* Modal Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-sm bg-white/70 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.8)] overflow-hidden"
                    >
                        {/* Red Glass Flare inside modal */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-400/20 rounded-full blur-[40px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-red-50/80 border border-red-100 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>

                            <h3 className="text-xl font-serif font-medium text-gray-900 mb-2">
                                Delete Analysis?
                            </h3>
                            <p className="text-sm font-medium text-gray-500 mb-8 px-2 leading-relaxed">
                                Are you sure you want to permanently delete the report for <span className="text-gray-900 font-semibold">{videoToDelete.video_title || 'this video'}</span>? This cannot be undone.
                            </p>

                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setVideoToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 px-4 rounded-xl bg-white/50 border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 flex justify-center items-center py-3 px-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 border border-red-400 text-sm font-bold text-white shadow-[0_8px_20px_rgba(225,29,72,0.25)] hover:shadow-[0_10px_25px_rgba(225,29,72,0.4)] hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}