"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Play, Sparkles, TrendingUp, Users, Target,
    AlertTriangle, Image as ImageIcon, Globe, Zap,
    ChevronLeft, Share2, ArrowRight, Loader2
} from "lucide-react";
import { CursorAwareButton } from "@/components/CursorAwareButton";
import { Navbar } from "@/components/layout/navbar";

const LiveAIPreview = ({ videoUrl }) => (
    <div className="relative h-full w-full rounded-[2.5rem] bg-gray-900 overflow-hidden border border-white/10 shadow-2xl group/preview">
        {/* Mirror Glass Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20" />

        {/* Simulated AI Overlays */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-emerald-400"
                    >
                        DETECTION_RUNNING: STREAM_OK
                    </motion.div>
                </div>
                <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>

            {/* Bottom Metadata */}
            <div className="space-y-4 mb-12">
                <div className="flex gap-2 mb-4">
                    {["FRAME: SEC-14", "FACE: JOY (98%)"].map((tag, i) => (
                        <span
                            key={tag}
                            className="bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md px-2 py-1 rounded text-[7px] font-mono text-indigo-300 whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Video Player or Loading State */}
        {videoUrl ? (
            <video
                src={videoUrl}
                controls={true}
                className="absolute inset-0 w-full h-full object-contain z-10"
            />
        ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 border border-indigo-500/30 z-0">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <span className="text-sm font-mono text-indigo-400 animate-pulse">Decrypting video stream...</span>
            </div>
        )}
    </div>
);

export default function VideoAnalytics({ params }) {
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;
    const analysisIdFromParams = resolvedParams.analysis_id;

    const [analysisWrapper, setAnalysisWrapper] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        if (!analysisWrapper?.s3Key) return;

        const fetchVideoUrl = async () => {
            try {
                const res = await fetch('/api/video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ s3Key: analysisWrapper.s3Key })
                });
                const data = await res.json();
                if (data.presignedUrl) {
                    setVideoUrl(data.presignedUrl);
                }
            } catch (error) {
                console.error("Failed to fetch video URL:", error);
            }
        };

        fetchVideoUrl();
    }, [analysisWrapper?.s3Key]);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!userIdFromParams || !analysisIdFromParams) return;
            try {
                const res = await fetch(`/api/analyses/${analysisIdFromParams}?userId=${userIdFromParams}`);
                const data = await res.json();
                if (data.analysis) {
                    setAnalysisWrapper(data.analysis);
                }
            } catch (error) {
                console.error("Failed to fetch analysis:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [userIdFromParams, analysisIdFromParams]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!analysisWrapper) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
                <h2 className="text-2xl font-serif text-gray-800">Analysis Not Found</h2>
                <Link href={`/analyze/${userIdFromParams}`} className="text-indigo-600 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    const aData = analysisWrapper?.analysisData || {};

    const safeText = (val) => {
        if (!val) return "";
        if (typeof val === 'string' || typeof val === 'number') return val;
        // Handle common DynamoDB unwrapped string formats if it skipped the document client somehow
        if (val.S) return val.S;
        if (typeof val === 'object') {
            if (val.insight && typeof val.insight === 'string') return val.insight;
            if (val.prediction && typeof val.prediction === 'string') return val.prediction;
            return JSON.stringify(val);
        }
        return String(val);
    };

    const safeNum = (val) => {
        if (typeof val === 'number') return val;
        if (val?.N) return parseInt(val.N);
        return parseInt(val) || 0;
    };

    // --- NEW SCHEMA EXTRACTION ---
    const hookScoreObj = aData.hook_score || {};
    // Handle potentially nested DDB maps if documentClient didn't unwrap completely
    const rawHookMap = hookScoreObj.M ? hookScoreObj.M : hookScoreObj;
    const hookScore = safeNum(rawHookMap.score || analysisWrapper?.hook_score || 0);
    const hookAnalysis = safeText(rawHookMap.analysis);

    const genHeatmapRaw = aData.generational_heatmap?.M || aData.generational_heatmap || {};
    const genZ = genHeatmapRaw.gen_z?.M || genHeatmapRaw.gen_z || {};
    const millennials = genHeatmapRaw.millennials?.M || genHeatmapRaw.millennials || {};
    const boomers = genHeatmapRaw.boomers?.M || genHeatmapRaw.boomers || {};

    const seoKitRaw = aData.seo_kit?.M || aData.seo_kit || {};

    // Helper to unwrap DynamoDB Lists
    const unwrapList = (listAttr) => {
        if (!listAttr) return [];
        if (Array.isArray(listAttr)) return listAttr;
        if (listAttr.L && Array.isArray(listAttr.L)) {
            return listAttr.L.map(item => item.S || item.N || item.M || item);
        }
        return [];
    };

    const seoKeywords = unwrapList(seoKitRaw.hashtags);
    const seoTitles = unwrapList(seoKitRaw.titles);
    const seoDescription = safeText(seoKitRaw.caption || "No caption available.");

    const editAlerts = unwrapList(aData.edit_alerts).map(alert => alert.M ? alert.M : alert);
    const coverFrames = unwrapList(aData.viral_cover_frames).map(frame => frame.M ? frame.M : frame);
    const timestampHeatmap = unwrapList(aData.timestamp_heatmap).map(event => event.M ? event.M : event);

    const expansionRaw = aData.bharat_expansion?.M || aData.bharat_expansion || {};
    const targetRegions = unwrapList(expansionRaw.target_regions);
    const dubbingLanguages = unwrapList(expansionRaw.dubbing_languages);
    const expansionStrategy = safeText(expansionRaw.strategy);

    const spinoffs = unwrapList(aData.viral_spinoffs).map(sp => sp.M ? sp.M : sp);

    const videoTitle = safeText(aData.recommended_title || analysisWrapper?.video_title || analysisWrapper?.s3Key?.split('-').pop() || "Untitled Video");
    const coverFrameImg = "https://images.unsplash.com/photo-1582376432754-b63ce6c64aa1?auto=format&fit=crop&q=80&w=400"; // Placeholder

    return (
        <main className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden pb-10 flex flex-col">
            {/* Background Gradients */}
            <div className="fixed top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[300px] opacity-20 blur-[60px]"
                    style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] opacity-[0.15] blur-[100px] rounded-full"
                    style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-4 md:px-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-gray-200/60 pb-6">
                    <div>
                        <Link href={`/analyze/${userIdFromParams}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Videos
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-mono font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Analysis Complete
                            </div>
                            <span className="text-xs text-gray-400 font-mono">ID: SL-{analysisIdFromParams?.substring(0, 8)}</span>
                        </div>
                        <h1 className="text-4xl font-serif font-medium text-gray-950">{videoTitle}</h1>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-600 font-medium border border-gray-200 shadow-sm hover:shadow-md transition-all text-sm">
                            <Share2 className="w-4 h-4" /> Share Report
                        </button>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

                    {/* LEFT: Video Player (Live Format) */}
                    <div className="lg:col-span-4 h-[50vh] lg:h-[calc(100vh-280px)] xl:h-[700px] relative pb-4 lg:pb-0 sticky top-32">
                        <div className="absolute -top-4 -left-4 font-mono text-[9px] font-bold text-orange-500/60 uppercase tracking-widest bg-orange-50/50 px-3 py-1 rounded-full border border-orange-100/50 z-20 shadow-sm backdrop-blur-md">
                            Source Video
                        </div>
                        <LiveAIPreview videoUrl={videoUrl} />
                    </div>

                    {/* RIGHT: Bento Grid */}
                    <div className="lg:col-span-8 h-full flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

                            {/* Hook Score */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-indigo-100 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg">
                                        <TrendingUp className="w-5 h-5 text-indigo-500" /> Hook Score
                                    </div>
                                    <div className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-wider">Top 10%</div>
                                </div>

                                <div className="flex items-center justify-center relative mb-4 h-24">
                                    <svg viewBox="0 0 100 50" className="w-full h-full max-h-[100px] text-gray-100 overflow-visible">
                                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                                        <motion.path
                                            d="M 10 50 A 40 40 0 0 1 90 50"
                                            fill="none"
                                            stroke="url(#hookGradient)"
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                            strokeDasharray="125.6"
                                            initial={{ strokeDashoffset: 125.6 }}
                                            animate={{ strokeDashoffset: 125.6 - (125.6 * (hookScore / 100)) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="hookGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#f97316" />
                                                <stop offset="50%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
                                        <span className="text-4xl font-bold font-serif text-gray-900">{hookScore}</span>
                                        <span className="text-xl text-gray-400">/100</span>
                                    </div>
                                </div>
                                <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-50 mt-auto">
                                    <p className="text-sm text-indigo-900/80 italic">{hookAnalysis || "Initial hook effectively captures attention."}</p>
                                </div>
                            </div>

                            {/* Generational Heatmap */}
                            <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:bg-indigo-50 transition-colors">
                                <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg mb-6">
                                    <Users className="w-5 h-5 text-indigo-600" /> Generational Resonance
                                </div>
                                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[200px]">
                                    {[
                                        { label: "Gen Z", data: genZ, color: "text-indigo-600 border-indigo-200 bg-indigo-100" },
                                        { label: "Millennials", data: millennials, color: "text-orange-600 border-orange-200 bg-orange-100" },
                                        { label: "Boomers", data: boomers, color: "text-emerald-600 border-emerald-200 bg-emerald-100" }
                                    ].map(gen => (
                                        <div key={gen.label} className="flex flex-col gap-1 pb-3 border-b border-indigo-100/50 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-end text-sm">
                                                <span className="font-semibold text-gray-800">{gen.label}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${gen.color}`}>
                                                    {safeText(gen.data.prediction) || "N/A"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-indigo-950/60 leading-relaxed">
                                                {safeText(gen.data.insight) || "No insight available."}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SEO Kit */}
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-100 transition-colors">
                                <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg mb-4">
                                    <Target className="w-5 h-5 text-orange-500" /> SEO & Tags Kit
                                </div>
                                <div className="space-y-4 text-sm text-gray-600 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">

                                    {seoTitles.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">A/B Titles</span>
                                            <ul className="list-disc pl-4 space-y-1 text-gray-700">
                                                {seoTitles.map((title, idx) => (
                                                    <li key={idx}>"{safeText(title)}"</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Keywords</span>
                                        <div className="flex flex-wrap gap-2">
                                            {seoKeywords.length > 0 ? seoKeywords.map(kw => {
                                                const keyword = safeText(kw);
                                                return (
                                                    <span key={keyword} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-100">
                                                        {keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '')}`}
                                                    </span>
                                                )
                                            }) : <span className="text-gray-400 italic">No keywords extracted</span>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Optimized Caption</span>
                                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                                            "{seoDescription}"
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap & Alerts Combo */}
                            <div className="bg-[#FFF5F5] p-6 rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-2 text-rose-950 font-serif font-semibold text-lg mb-4">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" /> Retention & Edits
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {/* Edit Alerts */}
                                    {editAlerts.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Warnings</span>
                                            {editAlerts.map((alert, i) => (
                                                <div key={`alert-${i}`} className="flex gap-3 bg-white p-3 rounded-xl border border-rose-50">
                                                    <div className="px-2 py-1 h-fit bg-rose-100 text-rose-600 rounded text-[10px] font-mono font-bold tracking-widest mt-0.5 whitespace-nowrap">
                                                        {safeText(alert.timestamp) || "0:00"}
                                                    </div>
                                                    <p className="text-sm text-rose-900/80">{safeText(alert.feedback)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Intensity Heatmap */}
                                    {timestampHeatmap.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Intensity Spikes</span>
                                            {timestampHeatmap.map((spike, i) => (
                                                <div key={`spike-${i}`} className="flex gap-3 bg-white p-3 rounded-xl border border-rose-50 items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="px-2 py-1 h-fit bg-orange-100 text-orange-600 rounded text-[10px] font-mono font-bold tracking-widest whitespace-nowrap">
                                                            {safeText(spike.timestamp)}
                                                        </div>
                                                        <p className="text-sm text-gray-700 line-clamp-1">{safeText(spike.event)}</p>
                                                    </div>
                                                    <div className="font-mono font-bold text-orange-500 text-sm">{safeNum(spike.importance_score)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {editAlerts.length === 0 && timestampHeatmap.length === 0 && (
                                        <div className="text-gray-400 italic bg-white p-3 rounded-xl border border-rose-50 text-sm">No timeline data available.</div>
                                    )}
                                </div>
                            </div>

                            {/* Expansion Strategy */}
                            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-emerald-950 font-serif font-semibold text-lg">
                                        <Globe className="w-5 h-5 text-emerald-500" /> Bharat Expansion Strategy
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">The Strategy</span>
                                        <p className="text-sm text-emerald-900/80 leading-relaxed bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                            {expansionStrategy || "No overarching strategy provided."}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">Target Regions</span>
                                            <div className="flex flex-wrap gap-2">
                                                {targetRegions.length > 0 ? targetRegions.map(region => (
                                                    <span key={safeText(region)} className="px-3 py-1 bg-white border border-emerald-200 rounded-md text-xs font-medium text-emerald-700 shadow-sm">
                                                        {safeText(region)}
                                                    </span>
                                                )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">Dubbing Required</span>
                                            <div className="flex flex-wrap gap-2">
                                                {dubbingLanguages.length > 0 ? dubbingLanguages.map(lang => (
                                                    <span key={safeText(lang)} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-medium text-indigo-700 shadow-sm">
                                                        {safeText(lang)}
                                                    </span>
                                                )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Viral Spinoffs (Full Width) */}
                            {spinoffs.length > 0 && (
                                <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-8 rounded-[2rem] border border-indigo-500/30 shadow-2xl md:col-span-2 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/4" />

                                    <div className="flex items-center gap-2 text-white font-serif font-semibold text-2xl mb-6 relative z-10">
                                        <Zap className="w-6 h-6 text-orange-400" /> Viral Spinoff Scripts
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                        {spinoffs.map((spinoff, idx) => (
                                            <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col gap-3 hover:bg-white/15 transition-colors">
                                                <h3 className="text-orange-300 font-serif font-medium text-lg border-b border-white/10 pb-2">
                                                    {safeText(spinoff.theme)}
                                                </h3>
                                                <div className="space-y-3 flex-1">
                                                    <div>
                                                        <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">0-3s (Hook)</span>
                                                        <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_1_hook)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">3-15s (Value)</span>
                                                        <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_2_value)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">15-25s (Twist)</span>
                                                        <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_3_twist)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">25-30s (CTA)</span>
                                                        <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_4_cta)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
