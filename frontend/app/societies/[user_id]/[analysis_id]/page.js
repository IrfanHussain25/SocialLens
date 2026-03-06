"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles, ChevronLeft, Loader2,
    FileText, CheckCircle, XCircle, AlertTriangle, TrendingUp, MessageSquare, CornerDownRight, BrainCircuit
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

const MediaPreview = ({ postType, mediaUrl, textContent }) => {
    return (
        <div className="relative w-full h-full bg-gray-900 border border-white/10 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Mirror Glass Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20" />

            {/* Simulated AI Overlays */}
            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-indigo-500/20 border border-indigo-500/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-indigo-400"
                        >
                            AGENT_SIM: ONLINE
                        </motion.div>
                    </div>
                    <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
            </div>

            {/* Dynamic Content Rendering */}
            {postType?.toLowerCase() === 'text' ? (
                <div className="relative z-10 p-6 md:p-8 w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">
                    <FileText className="w-8 h-8 text-white/40 mb-4 shrink-0" />
                    <p className="text-white md:text-lg font-serif leading-relaxed text-center break-words w-full px-4 line-clamp-6">
                        {textContent || "No text available."}
                    </p>
                </div>
            ) : postType?.toLowerCase() === 'photo' || postType?.toLowerCase() === 'image' ? (
                mediaUrl ? (
                    <img
                        src={mediaUrl}
                        alt="Analyzed Image"
                        className="absolute inset-0 w-full h-full object-cover z-10 opacity-80"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center border border-indigo-500/30 w-full h-full z-0 p-6">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    </div>
                )
            ) : (
                mediaUrl ? (
                    <video
                        src={mediaUrl}
                        controls={true}
                        autoPlay={true}
                        muted={true}
                        loop={true}
                        className="absolute inset-0 w-full h-full object-contain z-10 opacity-80 bg-black"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center border border-indigo-500/30 w-full h-full z-0 p-6">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                    </div>
                )
            )}
        </div>
    );
};

const ThreadComment = ({ node, allNodes, depth = 0, parentPersona = null, isLastChild = false }) => {
    const replies = allNodes.filter(n => n.reply_to === node.username);

    const gen = node.generation?.toLowerCase() || '';
    let colorTheme = { bg: 'bg-white', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-gray-50 text-gray-700 border-gray-200', indicator: 'bg-gray-300' };

    if (gen.includes('alpha')) {
        colorTheme = { bg: 'bg-white', border: 'border-purple-100', text: 'text-gray-900', badge: 'bg-purple-50 text-purple-700 border-purple-200', indicator: 'bg-purple-400' };
    } else if (gen.includes('z')) {
        colorTheme = { bg: 'bg-white', border: 'border-blue-100', text: 'text-gray-900', badge: 'bg-blue-50 text-blue-700 border-blue-200', indicator: 'bg-blue-400' };
    } else if (gen.includes('millennial')) {
        colorTheme = { bg: 'bg-white', border: 'border-emerald-100', text: 'text-gray-900', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', indicator: 'bg-emerald-400' };
    } else if (gen.includes('boomer')) {
        colorTheme = { bg: 'bg-white', border: 'border-orange-100', text: 'text-gray-900', badge: 'bg-orange-50 text-orange-700 border-orange-200', indicator: 'bg-orange-400' };
    }

    return (
        <div className={`relative flex flex-col ${depth > 0 ? 'mt-4' : 'mt-8'}`}>
            <div className="flex w-full">
                {/* Indentation with SVG Curve for replies */}
                {depth > 0 && (
                    <div className="w-8 md:w-16 shrink-0 relative flex justify-center overflow-hidden">
                        {/* L-shaped curved connection */}
                        <div className="absolute left-1/2 md:left-1/2 top-0 bottom-1/2 w-1/2 border-l-2 border-b-2 border-gray-200 rounded-bl-3xl transform -translate-x-1/2 translate-y-6"></div>
                        {/* Vertical connection if not last child */}
                        {!isLastChild && <div className="absolute left-1/2 top-0 bottom-[-32px] border-l-2 border-gray-200 transform -translate-x-1/2"></div>}
                    </div>
                )}

                {/* Comment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex-1 relative p-5 md:p-6 rounded-2xl md:rounded-[2rem] border ${colorTheme.border} ${colorTheme.bg} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                >
                    {/* Generation Indicator line on left */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colorTheme.indicator}`} />

                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2 pl-2">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 text-base">@{node.username}</span>
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border ${colorTheme.badge}`}>
                                {node.generation}
                            </span>
                        </div>
                    </div>

                    {parentPersona && depth > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 mb-2 bg-indigo-50 border border-indigo-100/50 w-fit px-2.5 py-1 rounded-full uppercase tracking-widest ml-2">
                            <CornerDownRight className="w-3 h-3" />
                            Replying to @{parentPersona}
                        </div>
                    )}

                    <p className="text-gray-800 text-[15px] leading-relaxed relative pl-2">
                        {node.comment}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-400 pl-2">
                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" /> Reply
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Nested Replies Container */}
            {replies.length > 0 && (
                <div className="relative">
                    <div className="w-full relative">
                        {replies.map((r, i) => (
                            <ThreadComment
                                key={r.username}
                                node={r}
                                allNodes={allNodes}
                                depth={depth + 1}
                                parentPersona={node.username}
                                isLastChild={i === replies.length - 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SocietyAnalytics({ params }) {
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;
    const analysisIdFromParams = resolvedParams.analysis_id;

    const [auditData, setAuditData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!userIdFromParams || !analysisIdFromParams) return;
            try {
                const res = await fetch(`/api/societies/${analysisIdFromParams}?userId=${userIdFromParams}`);
                const data = await res.json();
                if (data.audit) {
                    setAuditData(data.audit);
                }
            } catch (error) {
                console.error("Failed to fetch society audit:", error);
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

    if (!auditData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
                <h2 className="text-2xl font-serif text-gray-800">Societal Audit Not Found</h2>
                <Link href={`/societies/${userIdFromParams}`} className="text-indigo-600 hover:underline">
                    Return to Societies Dashboard
                </Link>
            </div>
        );
    }

    const safeText = (val) => {
        if (!val) return "";
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (val.S) return val.S;
        if (typeof val === 'object') {
            if (val.comment && typeof val.comment === 'string') return val.comment;
            if (val.sentiment && typeof val.sentiment === 'string') return val.sentiment;
            if (val.S) return val.S;
            return JSON.stringify(val);
        }
        return String(val);
    };

    // --- NEW NODE GRAPH DATA EXTRACTION ---
    const aData = auditData.auditData?.M ? auditData.auditData.M : (auditData.auditData || auditData);

    // Parse simulation thread
    let thread = [];
    const simThreadRaw = aData.thread?.L || aData.thread;

    if (simThreadRaw && Array.isArray(simThreadRaw)) {
        thread = simThreadRaw.map((item, id) => {
            const m = item.M || item;
            return {
                username: safeText(m.username) || `agent_${id}`,
                generation: safeText(m.generation),
                comment: safeText(m.comment),
                reply_to: safeText(m.reply_to)
            };
        });
    }

    // Root comments replying to the original post directly
    const rootComments = thread.filter(t => t.reply_to === 'post' || !t.reply_to || t.reply_to.trim() === '');

    // Handle Final Verdict & Virality
    const finalVerdictRaw = aData.final_verdict?.M || aData.final_verdict || {};
    const finalVerdictDecision = safeText(finalVerdictRaw.decision || "");
    const finalVerdictReasoning = safeText(finalVerdictRaw.reason || "");

    // Parse Deep Analysis (Support `analysis` or legacy `deep_analysis`)
    const deepAnalysis = safeText(aData.analysis || aData.deep_analysis);

    const viralityScoreRaw = aData.virality_score?.N || aData.virality_score;
    const viralityScore = viralityScoreRaw ? parseInt(viralityScoreRaw, 10) : "?";

    // Derived Display Variables
    const postType = auditData.postType || "Unknown";
    const topicTitle = safeText(auditData.topic || auditData.topic_summary || `Analysis ID: ${analysisIdFromParams.substring(0, 6)}`);

    return (
        <main className="min-h-screen bg-[#F0F2F5] font-sans relative overflow-x-hidden pb-20 flex flex-col">
            {/* Background Map Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Background Gradients */}
            <div className="fixed top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[500px] opacity-40 blur-[120px]"
                    style={{ background: 'linear-gradient(to bottom, #818CF8 0%, rgba(129,140,248,0) 100%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-4 md:px-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col lg:items-center">

                {/* Header Section */}
                <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-6 relative z-20 mx-auto">
                    <div>
                        <Link href={`/societies/${userIdFromParams}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-3 py-1 rounded-full bg-indigo-50 text-[10px] font-mono font-bold text-indigo-600 border border-indigo-100 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Interactive Thread Summary
                            </div>
                            <span className="px-2 py-0.5 rounded bg-gray-100/80 backdrop-blur-md text-[10px] font-mono font-bold text-gray-500 uppercase border border-gray-200">
                                {postType}
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-serif font-medium text-gray-950 line-clamp-2">{topicTitle}</h1>
                    </div>
                </div>

                {/* TASK 1: Context Hub (Top Section) */}
                <div className="w-full max-w-5xl mb-16 relative z-20 mx-auto">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <BrainCircuit className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h2 className="text-3xl font-serif font-medium text-gray-900 tracking-tight">AI Analysis</h2>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed relative z-10 font-medium">
                            {deepAnalysis || "Detailed analysis is currently processing or unavailable for this post."}
                        </p>
                    </div>
                </div>

                {/* TASK 2: Multi-Agent Simulation Thread (Middle Section) */}
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 mb-20 relative z-20">
                    <div className="flex flex-col items-center justify-center text-center">
                        <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-indigo-500 mb-2">Simulated Thread</h2>
                        <h3 className="text-3xl font-serif font-medium text-gray-900">Live Agent Interactions</h3>
                    </div>

                    {/* Center Post Bubble */}
                    <div className="w-full bg-black rounded-[3rem] shadow-2xl p-2 relative overflow-hidden group/post z-20 self-center max-w-2xl border border-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 opacity-20" />
                        <div className="w-full aspect-square md:aspect-video rounded-[2.5rem] overflow-hidden bg-gray-900 border border-white/10 relative">
                            <MediaPreview postType={postType} mediaUrl={auditData.mediaUrl} textContent={auditData.textContent || auditData.content} />
                        </div>
                    </div>

                    {/* Thread Container */}
                    <div className="w-full bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-6 md:p-10 lg:p-12 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] mt-4">
                        <h3 className="font-bold text-gray-900 text-xl border-b border-gray-200/60 pb-4 mb-2 flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-indigo-500" /> Responses
                            <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{thread.length}</span>
                        </h3>

                        {rootComments.length > 0 ? (
                            rootComments.map((root, index) => (
                                <ThreadComment
                                    key={root.username}
                                    node={root}
                                    allNodes={thread}
                                    isLastChild={index === rootComments.length - 1}
                                />
                            ))
                        ) : (
                            <div className="text-center py-16 text-gray-400 font-medium">No agents participated in this discussion.</div>
                        )}
                    </div>
                </div>

                {/* TASK 3: THE VERDICT & VIRALITY BANNER */}
                <div className="w-full max-w-5xl px-4 md:px-0 relative z-20 mt-12 mb-20 mx-auto">
                    {finalVerdictDecision && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`p-8 md:p-10 lg:p-12 rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-10 items-center justify-between
                                ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO')
                                    ? 'bg-gradient-to-br from-emerald-50/95 to-emerald-100/95 border-emerald-300 backdrop-blur-3xl'
                                    : finalVerdictDecision.includes('NO')
                                        ? 'bg-gradient-to-br from-rose-50/95 to-rose-100/95 border-rose-300 backdrop-blur-3xl'
                                        : 'bg-gradient-to-br from-amber-50/95 to-amber-100/95 border-amber-300 backdrop-blur-3xl'
                                }`}
                        >
                            {/* Decorative background glow */}
                            <div className={`absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-30 pointer-events-none 
                                ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'bg-emerald-500' :
                                    finalVerdictDecision.includes('NO') ? 'bg-rose-500' : 'bg-amber-500'
                                }`} />

                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 relative z-10 flex-1 w-full">
                                <div className={`flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-4 shadow-2xl
                                    ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'bg-emerald-100 border-white text-emerald-600 shadow-emerald-500/30' :
                                        finalVerdictDecision.includes('NO') ? 'bg-rose-100 border-white text-rose-600 shadow-rose-500/30' : 'bg-amber-100 border-white text-amber-600 shadow-amber-500/30'
                                    }`}>
                                    {finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? (
                                        <CheckCircle className="w-12 h-12 md:w-16 md:h-16" />
                                    ) : finalVerdictDecision.includes('NO') ? (
                                        <XCircle className="w-12 h-12 md:w-16 md:h-16" />
                                    ) : (
                                        <AlertTriangle className="w-12 h-12 md:w-16 md:h-16" />
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left">
                                    <h2 className={`font-serif font-black text-5xl md:text-6xl tracking-tight mb-4 flex items-center justify-center md:justify-start gap-4
                                        ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'text-emerald-800' :
                                            finalVerdictDecision.includes('NO') ? 'text-rose-800' :
                                                'text-amber-800'
                                        }`}>
                                        {finalVerdictDecision}
                                    </h2>
                                    <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-2xl
                                        ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'text-emerald-950/80' :
                                            finalVerdictDecision.includes('NO') ? 'text-rose-950/80' :
                                                'text-amber-950/80'
                                        }`}>
                                        "{finalVerdictReasoning}"
                                    </p>
                                </div>
                            </div>

                            {/* Virality Meter */}
                            <div className="w-full lg:w-80 bg-white/50 backdrop-blur-xl p-8 flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative z-10 shrink-0">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Predicted Virality</span>
                                </div>
                                <div className="relative flex items-center justify-center -mt-2">
                                    {/* Pulse effect behind score */}
                                    <div className="absolute inset-0 bg-indigo-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                    <span className="text-7xl lg:text-[5.5rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-900 relative z-10 tracking-tighter">
                                        {viralityScore}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200/50 rounded-full h-2.5 mt-6 overflow-hidden shadow-inner">
                                    <div className="bg-gradient-to-r from-indigo-400 via-purple-500 to-indigo-600 h-full rounded-full" style={{ width: `${viralityScore === '?' ? 0 : viralityScore}%` }}></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

            </div>
        </main>
    );
}
