"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
    UploadCloud, FileVideo, Play, Clock,
    ArrowRight, Sparkles, TrendingUp, Loader2
} from "lucide-react";
import { CursorAwareButton } from "@/components/CursorAwareButton";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/auth/AuthContext";

export default function AnalyzeDashboard({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;

    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [videos, setVideos] = useState([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAnalyses = async () => {
            if (!userIdFromParams) return;
            setIsLoadingVideos(true);
            try {
                const res = await fetch(`/api/analyses?userId=${userIdFromParams}`);
                const data = await res.json();
                if (data.analyses) {
                    setVideos(data.analyses);
                }
            } catch (error) {
                console.error("Failed to fetch analyses:", error);
            } finally {
                setIsLoadingVideos(false);
            }
        };

        fetchAnalyses();
    }, [userIdFromParams]);

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
        if (!file || isAnalyzing) return;

        setIsAnalyzing(true);
        setStatusMessage("");

        try {
            setStatusMessage('Requesting secure upload link...');

            // Extract a reliable user ID from AWS Amplify's user object
            const currentUserId = user?.userId || user?.username || "anonymous_user";
            const currentFeature = "analysis";

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

            setStatusMessage('Video successfully uploaded and queued for analysis!');
            setFile(null);
        } catch (error) {
            console.error("Error during upload:", error);
            setStatusMessage(`Error: ${error.message || "An unexpected error occurred."}`);
        } finally {
            setIsAnalyzing(false);
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
                                Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Genetics</span>
                            </h2>
                            <p className="text-lg text-gray-500 font-medium">Your historical content forensic reports & vitality scores.</p>
                        </div>

                        {/* Video Grid */}
                        <div className="overflow-y-auto pr-4 pb-4 custom-scrollbar flex-1 min-h-0">
                            {isLoadingVideos ? (
                                <div className="flex flex-col items-center justify-center p-32 h-full">
                                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Waking up Neural Engines...</p>
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-20 h-full relative group">
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
                                    <div className="relative z-10 w-24 h-24 rounded-full bg-indigo-50/80 border border-indigo-100 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(79,70,229,0.1)] group-hover:scale-110 transition-transform duration-700">
                                        <FileVideo className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">No content mapped yet</h3>
                                    <p className="text-gray-500 max-w-sm text-center">Your neural forensic history will appear here. Feed the engine a video to start the analysis.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {videos.map((video, idx) => (
                                        <Link href={`/analyze/${userIdFromParams || 'user'}/${video.jobId}`} key={video.jobId}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
                                                className="group relative bg-white rounded-[2rem] p-4 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] transition-all duration-500 cursor-pointer overflow-hidden"
                                            >
                                                {/* Gradient Border on Hover */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                                {/* Thumbnail Area */}
                                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-5 bg-gray-100/50 relative z-10 border border-white/50 shadow-inner">
                                                    <video
                                                        src={video.videoUrl ? `${video.videoUrl}#t=0.1` : ''}
                                                        preload="metadata"
                                                        muted={true}
                                                        playsInline={true}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent opacity-60" />

                                                    {/* Play Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] group-hover:scale-110 transition-transform duration-500">
                                                            <Play className="w-6 h-6 text-white fill-white ml-1 shadow-sm" />
                                                        </div>
                                                    </div>

                                                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-indigo-500/50 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.6)] text-[10px] font-bold uppercase tracking-widest z-20">
                                                        {video.status || "COMPLETED"}
                                                    </div>
                                                </div>

                                                {/* Info Area */}
                                                <div className="space-y-4 relative z-10 px-1">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h3 className="font-serif font-medium text-lg leading-snug text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-indigo-400 transition-all line-clamp-2 basis-3/4">
                                                            {video.video_title || video.s3Key?.split('-').pop() || "Untitled Content Analysis"}
                                                        </h3>
                                                        <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border backdrop-blur-xl basis-1/4 shrink-0 transition-all duration-500 ${(video.hook_score || 0) > 80 ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/50 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:border-emerald-400' : 'bg-gradient-to-b from-orange-50 to-orange-100/50 border-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.2)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] group-hover:border-orange-400'}`}>
                                                            <div className="flex items-center gap-1 mb-0.5">
                                                                <TrendingUp className={`w-3.5 h-3.5 ${(video.hook_score || 0) > 80 ? 'text-emerald-500' : 'text-orange-500'}`} />
                                                                <span className={`text-[9px] uppercase font-black tracking-[0.2em] ${(video.hook_score || 0) > 80 ? 'text-emerald-700' : 'text-orange-700'}`}>Hook</span>
                                                            </div>
                                                            <span className={`text-2xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br ${(video.hook_score || 0) > 80 ? 'from-emerald-400 via-emerald-600 to-emerald-900' : 'from-amber-400 via-orange-500 to-orange-800'}`}>{video.hook_score || "?"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs font-medium text-gray-500 border-t border-gray-100/50 pt-4">
                                                        <div className="flex items-center gap-1.5 opacity-80">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : "Unknown date"}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-indigo-600 font-bold uppercase text-[10px] tracking-widest group-hover:text-indigo-500 transition-colors">
                                                            View Report <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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

                    {/* RIGHT COLUMN: Upload Zone */}
                    <div className="lg:col-span-5 xl:col-span-5 pb-10 lg:pb-0 font-sans mt-0 flex flex-col h-full justify-center relative z-20">
                        <div className="bg-white rounded-[3rem] p-8 py-10 border border-white shadow-[0_20px_60px_rgba(0,0,0,0.05)] h-fit max-w-lg mx-auto w-full group overflow-hidden">
                            {/* Animated Background flairs */}
                            <motion.div
                                animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none"
                            />
                            <motion.div
                                animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-400/10 rounded-full blur-[80px] pointer-events-none"
                            />

                            <div className="relative z-10 w-full text-center mb-10">
                                <h3 className="text-3xl font-serif font-medium text-gray-950 mb-3 tracking-tight">Initiate Sequence</h3>
                                <p className="text-gray-500 text-sm font-medium">Upload a video to unpack its cultural DNA and engagement metrics.</p>
                            </div>


                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full relative flex flex-col items-center justify-center p-10 rounded-[2rem] bg-gray-50/50 backdrop-blur-sm transition-all duration-500 overflow-hidden cursor-pointer group/dropzone
                                    ${isDragging ? 'bg-indigo-50/80 shadow-[inset_0_0_50px_rgba(79,70,229,0.1)] scale-[1.02]' : 'hover:bg-gray-50 hover:shadow-[0_10px_30px_rgba(79,70,229,0.05)]'}
                                    ${file && !isAnalyzing ? 'bg-emerald-50/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}
                                `}
                            >
                                {/* Dynamic Borders */}
                                {!file && !isAnalyzing && (
                                    <div className={`absolute inset-0 rounded-[2rem] border-2 border-dashed pointer-events-none transition-colors duration-500 ${isDragging ? 'border-indigo-400' : 'border-gray-200 group-hover/dropzone:border-indigo-300'}`} />
                                )}
                                {file && !isAnalyzing && !isDragging && (
                                    <div className="absolute inset-0 rounded-[2rem] border-2 border-solid border-emerald-300 pointer-events-none" />
                                )}

                                {/* Progress Bar Overlay when Uploading */}
                                {isAnalyzing && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-100/50">
                                        <motion.div
                                            initial={{ width: "5%" }}
                                            animate={{ width: ["5%", "40%", "85%", "95%"] }} // Simulated progress
                                            transition={{ duration: 15, times: [0, 0.3, 0.8, 1], ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
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
                                    animate={isDragging ? { y: [0, -10, 0] } : {}}
                                    transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0, ease: "easeInOut" }}
                                    className={`relative z-10 p-5 rounded-2xl mb-5 transition-all duration-500 shadow-sm ${file ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white text-indigo-400 group-hover/dropzone:text-indigo-600 group-hover/dropzone:-translate-y-1 group-hover/dropzone:shadow-md border border-gray-100'}`}
                                >
                                    {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : file ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8 group-hover/dropzone:scale-110 transition-transform duration-300" />}
                                </motion.div>

                                <h4 className="relative z-10 text-xl font-serif font-medium text-gray-900 mb-2 line-clamp-1 w-full text-center px-4">
                                    {isAnalyzing ? "Transmitting to Secure Vault..." : file ? file.name : "Drop your thesis here"}
                                </h4>

                                <p className="relative z-10 text-gray-400 font-medium text-xs text-center mb-8 uppercase tracking-widest">
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
                                    <div className="relative z-10 mt-4 px-6 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors pointer-events-none bg-white/50 backdrop-blur-sm">
                                        Browse Files
                                    </div>
                                )}
                            </label>

                            {statusMessage && (
                                <div className={`relative z-10 w-full mt-6 text-center text-sm font-medium p-4 rounded-xl ${statusMessage.startsWith('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                    {statusMessage}
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}