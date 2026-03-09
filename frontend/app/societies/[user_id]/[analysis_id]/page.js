"use client";

import { useState, useEffect, use, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Sparkles, ChevronLeft, Loader2,
    FileText, CheckCircle, XCircle, AlertTriangle, TrendingUp, MessageSquare, CornerDownRight, BrainCircuit,
    Quote, User, BadgeCheck, Heart, Repeat2, Share2, MoreHorizontal
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

const MediaPreview = ({ postType, mediaUrl, textContent }) => {
    return (
        <div className="relative h-full w-full max-w-[400px] mx-auto aspect-[9/16] rounded-[2.5rem] bg-white/40 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)] group/preview border border-white/60">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/20 pointer-events-none z-0" />

            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        
                    </div>
                    
                </div>
            </div>

            <div className="absolute inset-0 z-10 p-3 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white shadow-inner border border-white/40">
                    {postType?.toLowerCase() === 'text' ? (
                        <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col p-10 bg-white relative">
                            
                            
                            <div className="flex items-center gap-3 mb-10 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 text-sm">SocialLens Agent</span>
                                        <BadgeCheck className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verified Post Source</span>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col flex-1 justify-center">
                                <Quote className="w-6 h-6 text-black/10 mb-2 rotate-180" />
                                <p className="text-slate-800 text-sm md:text-base font-serif font-medium leading-[1.6] italic tracking-tight">
                                    {textContent || "No text available."}
                                </p>
                                <div className="flex justify-end">
                                    <Quote className="w-6 h-6 text-black/10 mb-2" />
                                </div>
                            </div>

                            <div className="mt-auto border-t border-slate-50 pt-6 flex justify-between items-center opacity-40">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Archived Simulation Context</span>
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                            </div>
                        </div>
                    ) : postType?.toLowerCase() === 'photo' || postType?.toLowerCase() === 'image' ? (
                        mediaUrl ? (
                            <img
                                src={mediaUrl}
                                alt="Analyzed Image"
                                className="w-full h-full object-cover opacity-90"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 text-indigo-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
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
                                className="w-full h-full object-contain bg-white"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full h-full bg-slate-50 text-indigo-400">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

const ThreadComment = ({ node, allNodes, depth = 0, parentPersona = null, isLastChild = false }) => {
    const replies = allNodes.filter(n => n.reply_to === node.username);

    const gen = node.generation?.toLowerCase() || '';
    let colorTheme = { 
        bg: 'bg-white', 
        border: 'border-slate-100', 
        text: 'text-slate-900', 
        badge: 'bg-slate-50 text-slate-600 border-slate-200', 
        accent: 'bg-slate-400',
        avatar: 'bg-slate-100 text-slate-500',
        glow: 'group-hover/comment:shadow-[0_0_20px_rgba(148,163,184,0.1)]'
    };

    if (gen.includes('alpha')) {
        colorTheme = { 
            bg: 'bg-white', 
            border: 'border-purple-100', 
            text: 'text-slate-900', 
            badge: 'bg-purple-50 text-purple-600 border-purple-200', 
            accent: 'bg-purple-500',
            avatar: 'bg-purple-100 text-purple-600',
            glow: 'group-hover/comment:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
        };
    } else if (gen.includes('z')) {
        colorTheme = { 
            bg: 'bg-white', 
            border: 'border-blue-100', 
            text: 'text-slate-900', 
            badge: 'bg-blue-50 text-blue-600 border-blue-200', 
            accent: 'bg-blue-500',
            avatar: 'bg-blue-100 text-blue-600',
            glow: 'group-hover/comment:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
        };
    } else if (gen.includes('millennial')) {
        colorTheme = { 
            bg: 'bg-white', 
            border: 'border-emerald-100', 
            text: 'text-slate-900', 
            badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', 
            accent: 'bg-emerald-500',
            avatar: 'bg-emerald-100 text-emerald-600',
            glow: 'group-hover/comment:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
        };
    } else if (gen.includes('boomer')) {
        colorTheme = { 
            bg: 'bg-white', 
            border: 'border-amber-100', 
            text: 'text-slate-900', 
            badge: 'bg-amber-50 text-amber-600 border-amber-200', 
            accent: 'bg-amber-500',
            avatar: 'bg-amber-100 text-amber-600',
            glow: 'group-hover/comment:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
        };
    }

    return (
        <div className={`relative flex flex-col ${depth > 0 ? 'mt-2' : 'mt-6'}`}>
            <div className="flex w-full group/row">
                {depth > 0 && (
                    <div className="w-8 md:w-14 shrink-0 relative flex justify-center">
                        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-1/2 w-[20px] border-l-2 border-b-2 border-slate-200/80 rounded-bl-[15px] translate-y-6"></div>
                        {!isLastChild && <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-[-15px] border-l-2 border-slate-200/50"></div>}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.98, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: depth * 0.05 }}
                    className={`flex-1 relative p-4 md:p-5 rounded-[2rem] border ${colorTheme.border} bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)] transition-all duration-300 group/comment ${colorTheme.glow}`}
                >
                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-transform duration-300 group-hover/comment:scale-y-110 ${colorTheme.accent} opacity-40`} />

                    <div className="flex flex-col gap-3.5 pl-1.5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${colorTheme.avatar} flex items-center justify-center font-bold text-base shadow-sm border border-white/50 shrink-0`}>
                                    {node.username?.charAt(0).toUpperCase() || '?'}
                                </div>
                                
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-slate-900 text-sm">@{node.username}</span>
                                        <BadgeCheck className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/5" />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase font-black border tracking-wider h-fit ${colorTheme.badge}`}>
                                            {node.generation}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">• agent_sim</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>

                        {parentPersona && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500/80 bg-indigo-50/50 w-fit px-2.5 py-1 rounded-full uppercase tracking-[0.12em] border border-indigo-100/30">
                                <CornerDownRight className="w-3 h-3" />
                                Replying to <span className="text-indigo-600">@{parentPersona}</span>
                            </div>
                        )}

                        <p className="text-slate-700 text-sm md:text-[15px] font-medium leading-[1.55]">
                            {node.comment}
                        </p>
                        
                    </div>
                </motion.div>
            </div>

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

    const [auditData, setAuditData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const leftColRef = useRef(null);
    const [rightColHeight, setRightColHeight] = useState('auto');

    useEffect(() => {
        const target = leftColRef.current;
        if (!target) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === target) {
                    setRightColHeight(`${entry.contentRect.height}px`);
                }
            }
        });

        observer.observe(target);
        return () => observer.disconnect();
    }, [auditData]);

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

    const aData = auditData.auditData?.M ? auditData.auditData.M : (auditData.auditData || auditData);

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

    const rootComments = thread.filter(t => t.reply_to === 'post' || !t.reply_to || t.reply_to.trim() === '');

    const finalVerdictRaw = aData.final_verdict?.M || aData.final_verdict || {};
    const finalVerdictDecision = safeText(finalVerdictRaw.decision || "");
    const finalVerdictReasoning = safeText(finalVerdictRaw.reason || "");

    const deepAnalysis = safeText(aData.analysis || aData.deep_analysis);

    const viralityScoreRaw = aData.virality_score?.N || aData.virality_score;
    const viralityScore = viralityScoreRaw ? parseInt(viralityScoreRaw, 10) : "?";

    const postType = auditData.postType || "Unknown";
    const topicTitle = safeText(auditData.topic || auditData.topic_summary || `Analysis ID: ${analysisIdFromParams.substring(0, 6)}`);

    return (
        <main className="min-h-screen bg-[#F8FAFC] font-sans relative overflow-x-hidden pb-20 flex flex-col">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
                style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="fixed top-0 inset-x-0 h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[800px] opacity-30 blur-[140px]"
                    style={{ background: 'radial-gradient(circle at 50% 0%, #818CF8 0%, rgba(129,140,248,0) 70%)' }}></div>
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-4 md:px-8 max-w-[1500px] mx-auto w-full flex-1 flex flex-col">

                <div className="mb-10 pl-2">
                    <div className="flex items-center gap-6">
                        <Link 
                            href={`/societies/${userIdFromParams}`} 
                            className="w-12 h-12 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl transition-all active:scale-95 group shadow-[0_4px_12px_rgba(0,0,0,0.02)] shrink-0"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-4">
                                <h1 className="text-4xl lg:text-5xl font-serif font-medium text-gray-950 tracking-tight">{topicTitle}</h1>
                                <span className="px-3 py-1 rounded-full bg-indigo-50/50 backdrop-blur-md text-[10px] font-mono font-bold text-indigo-600 uppercase border border-indigo-100/50 tracking-wider h-fit mt-1">
                                    {postType}
                                </span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-0.5">Societal Impact Audit Report</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1 min-h-0 items-start">
                    
                    <div ref={leftColRef} className="lg:col-span-4 flex flex-col space-y-8 h-fit lg:pt-0">
                        <div className="w-full relative z-10 h-fit">
                            <MediaPreview postType={postType} mediaUrl={auditData.mediaUrl} textContent={auditData.textContent || auditData.content} />
                        </div>

                        <div className="bg-white/40 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60 relative overflow-hidden h-fit max-w-[400px] mx-auto w-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-60" />
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-white/60 rounded-xl border border-white/80 shadow-sm text-indigo-500">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-serif font-bold text-gray-900 tracking-tight">Narrative Analysis</h2>
                                    
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed font-medium italic pl-4 border-l-2 border-indigo-500/30">
                                {deepAnalysis || "Detailed analysis is currently processing or unavailable for this post."}
                            </p>
                        </div>
                    </div>

                    <div 
                        className="lg:col-span-8 flex flex-col space-y-6 overflow-hidden min-h-0" 
                        style={{ height: rightColHeight !== 'auto' ? rightColHeight : 'auto' }}
                    >
                        
                        {finalVerdictDecision && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-4 md:p-6 rounded-[2.5rem] border shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative overflow-hidden flex flex-col sm:flex-row gap-6 items-center h-fit shrink-0
                                    ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO')
                                        ? 'bg-emerald-50/20 border-emerald-200/60'
                                        : finalVerdictDecision.includes('NO')
                                            ? 'bg-rose-50/20 border-rose-200/60'
                                            : 'bg-amber-50/20 border-amber-200/60'
                                    }`}
                            >
                                <div className="absolute inset-0 backdrop-blur-3xl bg-white/30" />
                                
                                <div className="relative z-10 flex flex-1 items-center gap-6">
                                    <div className={`p-3.5 rounded-2xl border border-white shadow-lg shrink-0
                                        ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'bg-emerald-100 text-emerald-600' :
                                            finalVerdictDecision.includes('NO') ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? (
                                            <CheckCircle className="w-8 h-8" />
                                        ) : finalVerdictDecision.includes('NO') ? (
                                            <XCircle className="w-8 h-8" />
                                        ) : (
                                            <AlertTriangle className="w-8 h-8" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className={`font-serif font-black text-2xl md:text-3xl tracking-tight leading-none mb-1.5
                                            ${finalVerdictDecision.includes('POST') && !finalVerdictDecision.includes('NO') ? 'text-emerald-800' :
                                                finalVerdictDecision.includes('NO') ? 'text-rose-800' : 'text-amber-800'
                                            }`}>
                                            {finalVerdictDecision}
                                        </h2>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] leading-relaxed max-w-lg">
                                            {finalVerdictReasoning}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-10 bg-white/70 backdrop-blur-2xl p-4 px-6 rounded-2xl border border-white/80 shadow-sm shrink-0 flex flex-col items-center justify-center min-w-[110px]">
                                    <div className="flex items-center gap-1.5 mb-1 opacity-60">
                                        <TrendingUp className="w-3 h-3 text-indigo-500" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Viral Score</span>
                                    </div>
                                    <span className="text-3xl font-black text-[#1A1A24] tracking-tighter">
                                        {viralityScore}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div className="bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[3rem] flex-1 min-h-0 flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="p-8 px-10 border-b border-white/40 flex items-center justify-between shrink-0 bg-white/20">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white flex items-center justify-center shadow-md">
                                        <MessageSquare className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-xl tracking-tight">What Societies Think</h3>
                                       
                                    </div>
                                </div>
                                
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-4 space-y-6">
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
                                    <div className="text-center py-24 text-gray-400 font-medium italic text-lg">Initializing agent simulation workspace...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
