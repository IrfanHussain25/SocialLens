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
        <main className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[300px] opacity-20 blur-[60px]"
                    style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] opacity-[0.15] blur-[100px] rounded-full"
                    style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-6 pb-20 max-w-[1600px] mx-auto min-h-screen flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-stretch">

                    {/* LEFT COLUMN: Analyzed Videos */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full">
                        <div className="mb-8">
                            <h2 className="text-4xl font-serif font-medium text-gray-950 mb-2">Analyzed Videos</h2>
                            <p className="text-gray-500">Your recent content forensic reports</p>
                        </div>

                        {/* Video Grid */}
                        <div className="flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar">
                            {isLoadingVideos ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                                </div>
                            ) : videos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FileVideo className="w-12 h-12 mb-4 opacity-50" />
                                    <p>No analyzed videos yet. Upload one to get started!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {videos.map((video, idx) => (
                                        <Link href={`/analyze/${userIdFromParams || 'user'}/${video.jobId}`} key={video.jobId}>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative bg-white rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer overflow-hidden"
                                            >
                                                {/* Thumbnail Area */}
                                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                                    <img
                                                        src={video.thumbnail || "https://images.unsplash.com/photo-1582376432754-b63ce6c64aa1?auto=format&fit=crop&q=80&w=400"}
                                                        alt={video.video_title || "Video Thumbnail"}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                                                    {/* Play Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                                                            <Play className="w-5 h-5 text-white fill-white ml-1" />
                                                        </div>
                                                    </div>

                                                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono font-medium">
                                                        {video.status || "COMPLETED"}
                                                    </div>
                                                </div>

                                                {/* Info Area */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-serif font-medium text-lg text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-2">
                                                            {video.video_title || video.s3Key?.split('-').pop() || "Untitled Video"}
                                                        </h3>
                                                        <div className={`flex flex-shrink-0 items-center gap-1 px-2 py-1 rounded bg-gray-50 border ${(video.hook_score || 0) > 80 ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-orange-600 border-orange-100 bg-orange-50'}`}>
                                                            <TrendingUp className="w-3 h-3" />
                                                            <span className="text-xs font-bold">{video.hook_score || "?"}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : "Unknown date"}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-indigo-500">
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
                    <div className="lg:col-span-5 xl:col-span-4 h-full pb-10 lg:pb-0 font-sans mt-[30px]">
                        <div className="h-full bg-white rounded-[2.5rem] p-8 pb-12 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[680px]">
                            {/* Subtle background flair */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 w-full text-center mb-8">
                                <h3 className="text-2xl font-serif font-medium text-gray-900 mb-2">Analyze New Content</h3>
                                <p className="text-gray-500 text-sm">Upload a video to decrypt its cultural DNA</p>
                            </div>

                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`w-full relative flex flex-col items-center justify-center p-10 rounded-[2rem] bg-gray-50/50 border-2 border-dashed transition-all duration-500 overflow-hidden cursor-pointer
                                    ${isDragging ? 'border-indigo-400 bg-indigo-50/50 shadow-inner scale-[1.02]' : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'}
                                    ${file ? 'border-emerald-300 bg-emerald-50/30 border-solid' : ''}
                                `}
                            >
                                <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={isAnalyzing}
                                />

                                <div className={`p-4 rounded-full mb-4 transition-colors duration-500 ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-white shadow-sm text-indigo-400 group-hover:text-indigo-600'}`}>
                                    {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : file ? <FileVideo className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                                </div>

                                <h4 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1 w-full text-center px-4">
                                    {isAnalyzing ? "Uploading..." : file ? file.name : "Drag & Drop Video"}
                                </h4>

                                <p className="text-gray-400 text-xs text-center mb-6">
                                    {file
                                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready`
                                        : "Supports MP4, MOV, WebM up to 500MB"}
                                </p>

                                <div
                                    className={`w-full transition-opacity duration-300 ${(!file || isAnalyzing) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (file && !isAnalyzing) handleAnalyze();
                                    }}
                                >
                                    <CursorAwareButton
                                        variant="dark"
                                        className={`w-full !py-3 flex justify-center`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isAnalyzing ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                                            ) : (
                                                <><Sparkles className="w-4 h-4" /> Start Analysis</>
                                            )}
                                        </span>
                                    </CursorAwareButton>
                                </div>

                                {!file && (
                                    <div className="mt-4 px-6 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors pointer-events-none">
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