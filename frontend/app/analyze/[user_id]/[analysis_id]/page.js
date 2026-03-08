// "use client";

// import { useState, useEffect, use } from "react";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import {
//     Play, Sparkles, TrendingUp, Users, Target,
//     AlertTriangle, Image as ImageIcon, Globe, Zap,
//     ChevronLeft, Share2, ArrowRight, Loader2,
//     Map, Search, Flame, Youtube
// } from "lucide-react";
// import { CursorAwareButton } from "@/components/CursorAwareButton";
// import { Navbar } from "@/components/layout/navbar";

// const LiveAIPreview = ({ videoUrl }) => (
//     <div className="relative h-full w-full rounded-[2.5rem] bg-gray-900 overflow-hidden border border-white/10 shadow-2xl group/preview">
//         {/* Mirror Glass Effect */}
//         <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-20" />

//         {/* Simulated AI Overlays */}
//         <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
//             <div className="flex justify-between items-start">
//                 <div className="flex flex-col gap-2">
//                     <motion.div
//                         animate={{ opacity: [0.5, 1, 0.5] }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                         className="bg-emerald-500/20 border border-emerald-500/50 backdrop-blur-md px-2 py-1 rounded text-[8px] font-mono text-emerald-400"
//                     >
//                         DETECTION_RUNNING: STREAM_OK
//                     </motion.div>
//                 </div>
//                 <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
//             </div>

//             {/* Bottom Metadata */}
//             <div className="space-y-4 mb-12">
//                 <div className="flex gap-2 mb-4">
//                     {["FRAME: SEC-14", "FACE: JOY (98%)"].map((tag, i) => (
//                         <span
//                             key={tag}
//                             className="bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md px-2 py-1 rounded text-[7px] font-mono text-indigo-300 whitespace-nowrap"
//                         >
//                             {tag}
//                         </span>
//                     ))}
//                 </div>
//             </div>
//         </div>

//         {/* Video Player or Loading State */}
//         {videoUrl ? (
//             <video
//                 src={videoUrl}
//                 controls={true}
//                 className="absolute inset-0 w-full h-full object-contain z-10"
//             />
//         ) : (
//             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 border border-indigo-500/30 z-0">
//                 <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
//                 <span className="text-sm font-mono text-indigo-400 animate-pulse">Decrypting video stream...</span>
//             </div>
//         )}
//     </div>
// );

// export default function VideoAnalytics({ params }) {
//     const resolvedParams = use(params);
//     const userIdFromParams = resolvedParams.user_id;
//     const analysisIdFromParams = resolvedParams.analysis_id;

//     const [analysisWrapper, setAnalysisWrapper] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [videoUrl, setVideoUrl] = useState(null);

//     useEffect(() => {
//         if (!analysisWrapper?.s3Key) return;

//         const fetchVideoUrl = async () => {
//             try {
//                 const res = await fetch('/api/video', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ s3Key: analysisWrapper.s3Key })
//                 });
//                 const data = await res.json();
//                 if (data.presignedUrl) {
//                     setVideoUrl(data.presignedUrl);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch video URL:", error);
//             }
//         };

//         fetchVideoUrl();
//     }, [analysisWrapper?.s3Key]);

//     useEffect(() => {
//         const fetchAnalysis = async () => {
//             if (!userIdFromParams || !analysisIdFromParams) return;
//             try {
//                 const res = await fetch(`/api/analyses/${analysisIdFromParams}?userId=${userIdFromParams}`);
//                 const data = await res.json();
//                 if (data.analysis) {
//                     setAnalysisWrapper(data.analysis);
//                 }
//             } catch (error) {
//                 console.error("Failed to fetch analysis:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchAnalysis();
//     }, [userIdFromParams, analysisIdFromParams]);

//     if (isLoading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
//             </div>
//         );
//     }

//     if (!analysisWrapper) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
//                 <h2 className="text-2xl font-serif text-gray-800">Analysis Not Found</h2>
//                 <Link href={`/analyze/${userIdFromParams}`} className="text-indigo-600 hover:underline">
//                     Return to Dashboard
//                 </Link>
//             </div>
//         );
//     }

//     const aData = analysisWrapper?.analysisData || {};

//     const safeText = (val) => {
//         if (!val) return "";
//         if (typeof val === 'string' || typeof val === 'number') return val;
//         // Handle common DynamoDB unwrapped string formats if it skipped the document client somehow
//         if (val.S) return val.S;
//         if (typeof val === 'object') {
//             if (val.insight && typeof val.insight === 'string') return val.insight;
//             if (val.prediction && typeof val.prediction === 'string') return val.prediction;
//             return JSON.stringify(val);
//         }
//         return String(val);
//     };

//     const safeNum = (val) => {
//         if (typeof val === 'number') return val;
//         if (val?.N) return parseInt(val.N);
//         return parseInt(val) || 0;
//     };

//     const isYouTube = analysisWrapper.feature === 'youtube-analysis';
//     const ytEmbedUrl = safeText(analysisWrapper.ytEmbedUrl || aData.ytEmbedUrl);

//     // --- NEW SCHEMA EXTRACTION ---
//     const hookScoreObj = aData.hook_score || {};
//     // Handle potentially nested DDB maps if documentClient didn't unwrap completely
//     const rawHookMap = hookScoreObj.M ? hookScoreObj.M : hookScoreObj;
//     const hookScore = safeNum(rawHookMap.score || analysisWrapper?.hook_score || 0);
//     const hookAnalysis = safeText(rawHookMap.analysis);

//     const genHeatmapRaw = aData.generational_heatmap?.M || aData.generational_heatmap || {};
//     const genZ = genHeatmapRaw.gen_z?.M || genHeatmapRaw.gen_z || {};
//     const millennials = genHeatmapRaw.millennials?.M || genHeatmapRaw.millennials || {};
//     const boomers = genHeatmapRaw.boomers?.M || genHeatmapRaw.boomers || {};

//     const seoKitRaw = aData.seo_kit?.M || aData.seo_kit || {};

//     // Helper to unwrap DynamoDB Lists
//     const unwrapList = (listAttr) => {
//         if (!listAttr) return [];
//         if (Array.isArray(listAttr)) return listAttr;
//         if (listAttr.L && Array.isArray(listAttr.L)) {
//             return listAttr.L.map(item => item.S || item.N || item.M || item);
//         }
//         return [];
//     };

//     const seoKeywords = unwrapList(seoKitRaw.hashtags);
//     const seoTitles = unwrapList(seoKitRaw.titles);
//     const seoDescription = safeText(seoKitRaw.caption || "No caption available.");

//     const editAlerts = unwrapList(aData.edit_alerts).map(alert => alert.M ? alert.M : alert);
//     const coverFrames = unwrapList(aData.viral_cover_frames).map(frame => frame.M ? frame.M : frame);
//     const timestampHeatmap = unwrapList(aData.timestamp_heatmap).map(event => event.M ? event.M : event);

//     const expansionRaw = aData.bharat_expansion?.M || aData.bharat_expansion || {};
//     const targetRegions = unwrapList(expansionRaw.target_regions);
//     const dubbingLanguages = unwrapList(expansionRaw.dubbing_languages);
//     const expansionStrategy = safeText(expansionRaw.strategy);

//     const spinoffs = unwrapList(aData.viral_spinoffs).map(sp => sp.M ? sp.M : sp);

//     const videoTitle = safeText(aData.recommended_title || analysisWrapper?.video_title || analysisWrapper?.s3Key?.split('-').pop() || "Untitled Video");
//     const coverFrameImg = "https://images.unsplash.com/photo-1582376432754-b63ce6c64aa1?auto=format&fit=crop&q=80&w=400"; // Placeholder

//     return (
//         <main className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden pb-10 flex flex-col">
//             {/* Background Gradients */}
//             <div className="fixed top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none z-0">
//                 <div className="absolute top-0 left-0 right-0 h-[300px] opacity-20 blur-[60px]"
//                     style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
//                 <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140vw] h-[800px] opacity-[0.15] blur-[100px] rounded-full"
//                     style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>
//             </div>

//             <Navbar />

//             <div className="relative z-10 pt-32 px-4 md:px-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
//                 {/* Header Navbar */}
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-gray-200/60 pb-6">
//                     <div>
//                         <Link href={`/analyze/${userIdFromParams}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-4 transition-colors">
//                             <ChevronLeft className="w-4 h-4" /> Back to Videos
//                         </Link>
//                         <div className="flex items-center gap-3 mb-2">
//                             <div className="px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-mono font-bold text-emerald-600 border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
//                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                                 Analysis Complete
//                             </div>
//                             <span className="text-xs text-gray-400 font-mono">ID: SL-{analysisIdFromParams?.substring(0, 8)}</span>
//                         </div>
//                         <h1 className="text-4xl font-serif font-medium text-gray-950">{videoTitle}</h1>
//                     </div>

//                     <div className="flex gap-4">
//                         <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-600 font-medium border border-gray-200 shadow-sm hover:shadow-md transition-all text-sm">
//                             <Share2 className="w-4 h-4" /> Share Report
//                         </button>
//                     </div>
//                 </div>

//                 {/* Main Split Layout */}
//                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

//                     {/* LEFT: Video Player (Live Format) */}
//                     <div className="lg:col-span-4 h-[50vh] lg:h-[calc(100vh-280px)] xl:h-[700px] relative pb-4 lg:pb-0 sticky top-32">
//                         <div className="absolute -top-4 -left-4 font-mono text-[9px] font-bold text-orange-500/60 uppercase tracking-widest bg-orange-50/50 px-3 py-1 rounded-full border border-orange-100/50 z-20 shadow-sm backdrop-blur-md">
//                             Source Video
//                         </div>
//                         {isYouTube && ytEmbedUrl ? (
//                             <iframe src={ytEmbedUrl} allowFullScreen className="w-full aspect-video rounded-xl shadow-lg border border-white/10" />
//                         ) : (
//                             <LiveAIPreview videoUrl={videoUrl} />
//                         )}
//                     </div>

//                     {/* RIGHT: Bento Grid */}
//                     <div className="lg:col-span-8 h-full flex flex-col">
//                         {isYouTube ? (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
//                                 {/* The Verdict */}
//                                 <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-gray-900 to-indigo-900 p-8 rounded-[2rem] shadow-2xl flex items-center justify-between border border-white/10">
//                                     <div>
//                                         <span className="text-orange-400 font-mono text-sm tracking-widest uppercase mb-2 block">The Verdict</span>
//                                         <h2 className="text-3xl font-serif text-white font-medium mb-4">{videoTitle}</h2>
//                                         <p className="text-indigo-100/80 text-sm max-w-xl">{hookAnalysis}</p>
//                                     </div>
//                                     <div className="relative w-32 h-32 flex-shrink-0 flex flex-col items-center justify-center">
//                                         <svg viewBox="0 0 36 36" className="w-full h-full text-indigo-500/30 absolute inset-0">
//                                             <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
//                                             <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${hookScore}, 100`} />
//                                         </svg>
//                                         <div className="z-10 flex flex-col items-center justify-center pt-2">
//                                             <span className="text-3xl font-bold text-white relative z-10 leading-none">{hookScore}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Retention Heatmap */}
//                                 <div className="bg-white p-6 justify-start rounded-[2rem] border border-gray-100 shadow-sm">
//                                     <div className="flex items-center gap-2 text-rose-950 font-serif font-semibold text-lg mb-6">
//                                         <Flame className="w-5 h-5 text-rose-500" /> Retention Heatmap
//                                     </div>
//                                     <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
//                                         {timestampHeatmap.length > 0 ? timestampHeatmap.map((item, i) => (
//                                             <div key={i} className="flex gap-4 items-center bg-gray-50 p-3 rounded-xl">
//                                                 <div className="px-2 py-1 bg-rose-100 text-rose-700 font-bold font-mono text-[10px] rounded shrink-0">
//                                                     {safeText(item.timestamp)}
//                                                 </div>
//                                                 <div className="text-sm text-gray-700 flex-1 line-clamp-2">{safeText(item.event)}</div>
//                                                 <div className="text-rose-500 font-bold font-mono text-sm">{safeNum(item.importance_score)}</div>
//                                             </div>
//                                         )) : <span className="text-gray-400 italic text-sm">No retention data</span>}
//                                     </div>
//                                 </div>

//                                 {/* Generational Heatmap */}
//                                 <div className="bg-white p-6 justify-start rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
//                                     <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg mb-6">
//                                         <Users className="w-5 h-5 text-indigo-600" /> Generational Resonance
//                                     </div>
//                                     <div className="space-y-4 flex-1">
//                                         {[
//                                             { label: "Gen Z", data: genZ, color: "bg-indigo-100 text-indigo-700" },
//                                             { label: "Millennials", data: millennials, color: "bg-orange-100 text-orange-700" },
//                                             { label: "Boomers", data: boomers, color: "bg-emerald-100 text-emerald-700" }
//                                         ].map(gen => (
//                                             <div key={gen.label} className="flex flex-col gap-1 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
//                                                 <div className="flex justify-between items-end text-sm">
//                                                     <span className="font-semibold text-gray-800">{gen.label}</span>
//                                                     <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${gen.color}`}>
//                                                         {safeText(gen.data.prediction) || "N/A"}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-xs text-gray-500 leading-relaxed">
//                                                     {safeText(gen.data.insight) || "No insight available."}
//                                                 </p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* SEO & Distribution Kit */}
//                                 <div className="bg-white p-6 justify-start rounded-[2rem] border border-gray-100 shadow-sm md:col-span-2">
//                                     <div className="flex items-center gap-2 text-amber-950 font-serif font-semibold text-lg mb-6">
//                                         <Search className="w-5 h-5 text-amber-500" /> SEO & Distribution Kit
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                                         <div>
//                                             <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">Optimal Titles</span>
//                                             <ul className="space-y-2">
//                                                 {seoTitles.map((title, i) => (
//                                                     <li key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">"{safeText(title)}"</li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                         <div>
//                                             <div className="mb-6">
//                                                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">YouTube Description</span>
//                                                 <p className="text-sm text-gray-600 italic">"{seoDescription}"</p>
//                                             </div>
//                                             <div>
//                                                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-3">Hashtags</span>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {seoKeywords.length > 0 ? seoKeywords.map((kw, i) => {
//                                                         const keyword = safeText(kw);
//                                                         return (
//                                                             <span key={i} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium border border-amber-100 text-xs shadow-sm">
//                                                                 {keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '')}`}
//                                                             </span>
//                                                         )
//                                                     }) : <span className="text-gray-400 italic">No keywords extracted</span>}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Bharat Expansion Strategy */}
//                                 <div className="bg-gradient-to-br from-orange-50 to-indigo-50 p-6 rounded-[2rem] border border-orange-100 shadow-sm md:col-span-2 relative overflow-hidden">
//                                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-300 blur-[80px] opacity-20 rounded-full"></div>
//                                     <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-300 blur-[80px] opacity-20 rounded-full"></div>

//                                     <div className="relative z-10 flex items-center justify-between mb-6">
//                                         <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg">
//                                             <Map className="w-5 h-5 text-indigo-500" /> Bharat Expansion Strategy
//                                         </div>
//                                     </div>

//                                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
//                                         <div className="md:col-span-2">
//                                             <span className="text-xs font-semibold text-indigo-600/60 uppercase tracking-widest block mb-2">The Strategy</span>
//                                             <p className="text-sm text-indigo-900/80 leading-relaxed bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/40">
//                                                 {expansionStrategy || "No overarching strategy provided."}
//                                             </p>
//                                         </div>
//                                         <div className="space-y-6">
//                                             <div>
//                                                 <span className="text-xs font-semibold text-indigo-600/60 uppercase tracking-widest block mb-2">Target Regions</span>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {targetRegions.length > 0 ? targetRegions.map(region => (
//                                                         <span key={safeText(region)} className="px-3 py-1 bg-white border border-indigo-200 rounded-md text-xs font-medium text-indigo-700 shadow-sm">
//                                                             {safeText(region)}
//                                                         </span>
//                                                     )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <span className="text-xs font-semibold text-indigo-600/60 uppercase tracking-widest block mb-2">Dubbing Languages</span>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {dubbingLanguages.length > 0 ? dubbingLanguages.map(lang => (
//                                                         <span key={safeText(lang)} className="px-3 py-1 bg-orange-100 border border-orange-200 rounded-md text-xs font-medium text-orange-700 shadow-sm">
//                                                             {safeText(lang)}
//                                                         </span>
//                                                     )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Viral Spinoffs Grid (3 columns inside) */}
//                                 {spinoffs.length > 0 && (
//                                     <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
//                                         <div className="flex items-center gap-2 text-gray-900 font-serif font-semibold text-lg mb-6">
//                                             <Youtube className="w-5 h-5 text-red-500" /> Viral Spinoff Formulas
//                                         </div>
//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                             {spinoffs.map((spinoff, idx) => (
//                                                 <div key={idx} className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col gap-4">
//                                                     <h3 className="text-indigo-600 font-serif font-medium text-lg border-b border-gray-200 pb-3">
//                                                         {safeText(spinoff.theme)}
//                                                     </h3>
//                                                     <div className="space-y-4 flex-1">
//                                                         <div className="flex gap-3">
//                                                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold font-mono">1</div>
//                                                             <div>
//                                                                 <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Hook</span>
//                                                                 <p className="text-gray-700 text-sm leading-snug">{safeText(spinoff.step_1_hook)}</p>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex gap-3">
//                                                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold font-mono">2</div>
//                                                             <div>
//                                                                 <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Value</span>
//                                                                 <p className="text-gray-700 text-sm leading-snug">{safeText(spinoff.step_2_value)}</p>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex gap-3">
//                                                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold font-mono">3</div>
//                                                             <div>
//                                                                 <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Twist</span>
//                                                                 <p className="text-gray-700 text-sm leading-snug">{safeText(spinoff.step_3_twist)}</p>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex gap-3">
//                                                             <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold font-mono">4</div>
//                                                             <div>
//                                                                 <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">CTA</span>
//                                                                 <p className="text-gray-700 text-sm leading-snug">{safeText(spinoff.step_4_cta)}</p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

//                                 {/* Hook Score */}
//                                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-indigo-100 transition-colors">
//                                     <div className="flex items-start justify-between mb-4">
//                                         <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg">
//                                             <TrendingUp className="w-5 h-5 text-indigo-500" /> Hook Score
//                                         </div>
//                                         <div className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 font-mono text-[10px] uppercase font-bold tracking-wider">Top 10%</div>
//                                     </div>

//                                     <div className="flex items-center justify-center relative mb-4 h-24">
//                                         <svg viewBox="0 0 100 50" className="w-full h-full max-h-[100px] text-gray-100 overflow-visible">
//                                             <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
//                                             <motion.path
//                                                 d="M 10 50 A 40 40 0 0 1 90 50"
//                                                 fill="none"
//                                                 stroke="url(#hookGradient)"
//                                                 strokeWidth="12"
//                                                 strokeLinecap="round"
//                                                 strokeDasharray="125.6"
//                                                 initial={{ strokeDashoffset: 125.6 }}
//                                                 animate={{ strokeDashoffset: 125.6 - (125.6 * (hookScore / 100)) }}
//                                                 transition={{ duration: 1.5, ease: "easeOut" }}
//                                             />
//                                             <defs>
//                                                 <linearGradient id="hookGradient" x1="0" y1="0" x2="1" y2="0">
//                                                     <stop offset="0%" stopColor="#f97316" />
//                                                     <stop offset="50%" stopColor="#6366f1" />
//                                                     <stop offset="100%" stopColor="#10b981" />
//                                                 </linearGradient>
//                                             </defs>
//                                         </svg>
//                                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
//                                             <span className="text-4xl font-bold font-serif text-gray-900">{hookScore}</span>
//                                             <span className="text-xl text-gray-400">/100</span>
//                                         </div>
//                                     </div>
//                                     <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-50 mt-auto">
//                                         <p className="text-sm text-indigo-900/80 italic">{hookAnalysis || "Initial hook effectively captures attention."}</p>
//                                     </div>
//                                 </div>

//                                 {/* Generational Heatmap */}
//                                 <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:bg-indigo-50 transition-colors">
//                                     <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg mb-6">
//                                         <Users className="w-5 h-5 text-indigo-600" /> Generational Resonance
//                                     </div>
//                                     <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[200px]">
//                                         {[
//                                             { label: "Gen Z", data: genZ, color: "text-indigo-600 border-indigo-200 bg-indigo-100" },
//                                             { label: "Millennials", data: millennials, color: "text-orange-600 border-orange-200 bg-orange-100" },
//                                             { label: "Boomers", data: boomers, color: "text-emerald-600 border-emerald-200 bg-emerald-100" }
//                                         ].map(gen => (
//                                             <div key={gen.label} className="flex flex-col gap-1 pb-3 border-b border-indigo-100/50 last:border-0 last:pb-0">
//                                                 <div className="flex justify-between items-end text-sm">
//                                                     <span className="font-semibold text-gray-800">{gen.label}</span>
//                                                     <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${gen.color}`}>
//                                                         {safeText(gen.data.prediction) || "N/A"}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-xs text-indigo-950/60 leading-relaxed">
//                                                     {safeText(gen.data.insight) || "No insight available."}
//                                                 </p>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* SEO Kit */}
//                                 <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-indigo-100 transition-colors">
//                                     <div className="flex items-center gap-2 text-indigo-950 font-serif font-semibold text-lg mb-4">
//                                         <Target className="w-5 h-5 text-orange-500" /> SEO & Tags Kit
//                                     </div>
//                                     <div className="space-y-4 text-sm text-gray-600 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">

//                                         {seoTitles.length > 0 && (
//                                             <div className="space-y-2">
//                                                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">A/B Titles</span>
//                                                 <ul className="list-disc pl-4 space-y-1 text-gray-700">
//                                                     {seoTitles.map((title, idx) => (
//                                                         <li key={idx}>"{safeText(title)}"</li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         )}

//                                         <div className="space-y-2">
//                                             <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Keywords</span>
//                                             <div className="flex flex-wrap gap-2">
//                                                 {seoKeywords.length > 0 ? seoKeywords.map(kw => {
//                                                     const keyword = safeText(kw);
//                                                     return (
//                                                         <span key={keyword} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-100">
//                                                             {keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '')}`}
//                                                         </span>
//                                                     )
//                                                 }) : <span className="text-gray-400 italic">No keywords extracted</span>}
//                                             </div>
//                                         </div>

//                                         <div className="space-y-2">
//                                             <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Optimized Caption</span>
//                                             <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
//                                                 "{seoDescription}"
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Heatmap & Alerts Combo */}
//                                 <div className="bg-[#FFF5F5] p-6 rounded-[2rem] border border-rose-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow">
//                                     <div className="flex items-center gap-2 text-rose-950 font-serif font-semibold text-lg mb-4">
//                                         <AlertTriangle className="w-5 h-5 text-rose-500" /> Retention & Edits
//                                     </div>

//                                     <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
//                                         {/* Edit Alerts */}
//                                         {editAlerts.length > 0 && (
//                                             <div className="space-y-2">
//                                                 <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Warnings</span>
//                                                 {editAlerts.map((alert, i) => (
//                                                     <div key={`alert-${i}`} className="flex gap-3 bg-white p-3 rounded-xl border border-rose-50">
//                                                         <div className="px-2 py-1 h-fit bg-rose-100 text-rose-600 rounded text-[10px] font-mono font-bold tracking-widest mt-0.5 whitespace-nowrap">
//                                                             {safeText(alert.timestamp) || "0:00"}
//                                                         </div>
//                                                         <p className="text-sm text-rose-900/80">{safeText(alert.feedback)}</p>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}

//                                         {/* Intensity Heatmap */}
//                                         {timestampHeatmap.length > 0 && (
//                                             <div className="space-y-2 pt-2">
//                                                 <span className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Intensity Spikes</span>
//                                                 {timestampHeatmap.map((spike, i) => (
//                                                     <div key={`spike-${i}`} className="flex gap-3 bg-white p-3 rounded-xl border border-rose-50 items-center justify-between">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="px-2 py-1 h-fit bg-orange-100 text-orange-600 rounded text-[10px] font-mono font-bold tracking-widest whitespace-nowrap">
//                                                                 {safeText(spike.timestamp)}
//                                                             </div>
//                                                             <p className="text-sm text-gray-700 line-clamp-1">{safeText(spike.event)}</p>
//                                                         </div>
//                                                         <div className="font-mono font-bold text-orange-500 text-sm">{safeNum(spike.importance_score)}</div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}

//                                         {editAlerts.length === 0 && timestampHeatmap.length === 0 && (
//                                             <div className="text-gray-400 italic bg-white p-3 rounded-xl border border-rose-50 text-sm">No timeline data available.</div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Expansion Strategy */}
//                                 <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:col-span-2">
//                                     <div className="flex items-center justify-between mb-4">
//                                         <div className="flex items-center gap-2 text-emerald-950 font-serif font-semibold text-lg">
//                                             <Globe className="w-5 h-5 text-emerald-500" /> Bharat Expansion Strategy
//                                         </div>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                         <div className="md:col-span-2">
//                                             <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">The Strategy</span>
//                                             <p className="text-sm text-emerald-900/80 leading-relaxed bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
//                                                 {expansionStrategy || "No overarching strategy provided."}
//                                             </p>
//                                         </div>
//                                         <div className="space-y-4">
//                                             <div>
//                                                 <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">Target Regions</span>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {targetRegions.length > 0 ? targetRegions.map(region => (
//                                                         <span key={safeText(region)} className="px-3 py-1 bg-white border border-emerald-200 rounded-md text-xs font-medium text-emerald-700 shadow-sm">
//                                                             {safeText(region)}
//                                                         </span>
//                                                     )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <span className="text-xs font-semibold text-emerald-600/60 uppercase tracking-widest block mb-2">Dubbing Required</span>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {dubbingLanguages.length > 0 ? dubbingLanguages.map(lang => (
//                                                         <span key={safeText(lang)} className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-xs font-medium text-indigo-700 shadow-sm">
//                                                             {safeText(lang)}
//                                                         </span>
//                                                     )) : <span className="text-xs text-gray-400 italic">Unspecified</span>}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Viral Spinoffs (Full Width) */}
//                                 {spinoffs.length > 0 && (
//                                     <div className="bg-gradient-to-br from-indigo-900 to-gray-900 p-8 rounded-[2rem] border border-indigo-500/30 shadow-2xl md:col-span-2 relative overflow-hidden">
//                                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/4" />

//                                         <div className="flex items-center gap-2 text-white font-serif font-semibold text-2xl mb-6 relative z-10">
//                                             <Zap className="w-6 h-6 text-orange-400" /> Viral Spinoff Scripts
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
//                                             {spinoffs.map((spinoff, idx) => (
//                                                 <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col gap-3 hover:bg-white/15 transition-colors">
//                                                     <h3 className="text-orange-300 font-serif font-medium text-lg border-b border-white/10 pb-2">
//                                                         {safeText(spinoff.theme)}
//                                                     </h3>
//                                                     <div className="space-y-3 flex-1">
//                                                         <div>
//                                                             <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">0-3s (Hook)</span>
//                                                             <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_1_hook)}</p>
//                                                         </div>
//                                                         <div>
//                                                             <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">3-15s (Value)</span>
//                                                             <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_2_value)}</p>
//                                                         </div>
//                                                         <div>
//                                                             <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">15-25s (Twist)</span>
//                                                             <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_3_twist)}</p>
//                                                         </div>
//                                                         <div>
//                                                             <span className="text-[10px] text-indigo-300 font-mono font-bold uppercase block mb-1">25-30s (CTA)</span>
//                                                             <p className="text-white/80 text-sm leading-snug">{safeText(spinoff.step_4_cta)}</p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                             </div>
//                         )}
//                     </div>

//                 </div>
//             </div>
//         </main>
//     );
// }













"use client";

import { useState, useEffect, use, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Play, Sparkles, TrendingUp, Users, Target,
    AlertTriangle, Image as ImageIcon, Globe, Zap, Clock, Activity, Coffee,
    ChevronLeft, ChevronRight, Share2, ArrowRight, ArrowLeft, Loader2, PlayCircle,
    Copy, CheckCircle, MapPin, Volume2, Check
} from "lucide-react";
import { CursorAwareButton } from "@/components/CursorAwareButton";
import { Navbar } from "@/components/layout/navbar";

const LiveAIPreview = ({ videoUrl, seekTime }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && seekTime !== null) {
            videoRef.current.currentTime = seekTime;
            // Pause video at exact timestamp instead of auto-playing
            videoRef.current.pause();
        }
    }, [seekTime]);

    return (
        <div className="relative h-full w-full rounded-[2.5rem] bg-white/40 backdrop-blur-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)] group/preview border border-white/60">
            
            {/* Soft Inner Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/20 pointer-events-none z-0" />

            {/* Video Element */}
            {videoUrl ? (
                <div className="absolute inset-0 z-10 p-3 overflow-hidden flex items-center justify-center">
                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-black/5 shadow-inner border border-black/5">
                        <video
                            ref={videoRef}
                            src={`${videoUrl}#t=0.1`}
                            controls={true}
                            autoPlay={true}
                            loop={true}
                            muted={true}
                            className="w-full h-full object-contain"
                            style={{ outline: 'none' }}
                        />
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-0 rounded-[2.5rem]">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <span className="text-sm font-serif font-medium text-indigo-900 animate-pulse">Preparing video preview...</span>
                </div>
            )}
        </div>
    );
};


export default function VideoAnalytics({ params }) {
    const resolvedParams = use(params);
    const userIdFromParams = resolvedParams.user_id;
    const analysisIdFromParams = resolvedParams.analysis_id;

    const [analysisWrapper, setAnalysisWrapper] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('insights');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    const [seekTime, setSeekTime] = useState(null);
    const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
    const ytRef = useRef(null);

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

    const aData = analysisWrapper?.analysisData || {};
    const isYouTube = analysisWrapper?.feature === 'youtube-analysis';

    useEffect(() => {
        if (isYouTube && ytRef.current && seekTime !== null) {
            ytRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'seekTo',
                args: [seekTime, true]
            }), '*');
        }
    }, [seekTime, isYouTube]);

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

    // Helper to safely convert different string timestamp formats ("1:05", "15s") to pure seconds
    const timestampToSeconds = (ts) => {
        if (!ts) return 0;
        const str = String(ts).trim().toLowerCase();
        
        // Handle "1:05" or "01:24" format
        if (str.includes(':')) {
            const parts = str.split(':');
            let secs = 0;
            if (parts.length === 2) {
                secs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else if (parts.length === 3) {
                secs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
            return isNaN(secs) ? 0 : secs;
        }
        
        // Handle "15s" or "120s" format
        if (str.endsWith('s')) {
            const num = parseInt(str.replace('s', ''));
            return isNaN(num) ? 0 : num;
        }

        // Just a number string "45"
        const finalNum = parseInt(str);
        return isNaN(finalNum) ? 0 : finalNum;
    };

    // Helper to safely convert pure seconds back to "1:05" format
    const secondsToTimestamp = (s) => {
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    const ytEmbedUrlRaw = safeText(analysisWrapper.ytEmbedUrl || aData.ytEmbedUrl);
    const ytEmbedUrl = ytEmbedUrlRaw ? (ytEmbedUrlRaw.includes('?') ? `${ytEmbedUrlRaw}&enablejsapi=1` : `${ytEmbedUrlRaw}?enablejsapi=1`) : '';

    const videoTitle = safeText(aData.recommended_title || analysisWrapper?.video_title || analysisWrapper?.s3Key?.split('-').pop() || "Untitled Video");

    // Calculate total duration for timeline scaling
    const allTimestampsArr = [
        ...editAlerts.map(a => timestampToSeconds(safeText(a.timestamp))),
        ...timestampHeatmap.map(s => timestampToSeconds(safeText(s.timestamp)))
    ];
    const maxTimestampFound = allTimestampsArr.length > 0 ? Math.max(...allTimestampsArr) : 0;
    const totalDuration = safeNum(analysisWrapper?.videoMetadata?.duration) || (maxTimestampFound > 0 ? maxTimestampFound + 5 : 60);

    return (
        <main className="min-h-screen bg-[#FDFDFF] font-sans relative overflow-x-hidden pb-10 flex flex-col">
            {/* Background Gradients — More vibrant for glass effect */}
            <div className="fixed top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 right-0 h-[500px] opacity-25 blur-[100px]"
                    style={{ background: 'linear-gradient(to bottom, #FFD5B0 0%, rgba(255,213,176,0) 100%)' }}></div>
                <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[160vw] h-[1000px] opacity-[0.25] blur-[120px] rounded-full"
                    style={{ background: 'radial-gradient(50% 50% at 50% 0%, #E2D9FF 0%, rgba(226,217,255,0) 100%)' }}></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full" />
            </div>

            <Navbar />

            <div className="relative z-10 pt-32 px-4 md:px-8 max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
                {/* Header Navbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-gray-200/60 pb-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={`/analyze/${userIdFromParams}`} 
                            className="inline-flex items-center justify-center w-12 h-12 rounded-[1rem] bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition-all group shrink-0"
                            aria-label="Go back to videos"
                        >
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        
                        <h1 className="text-3xl md:text-4xl font-serif font-medium text-gray-950 line-clamp-1">{videoTitle}</h1>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">

                    {/* LEFT: Video Player (Live Format) */}
                    <div className="lg:col-span-4 h-[50vh] lg:h-[calc(100vh-280px)] xl:h-[750px] relative pb-4 lg:pb-0 sticky top-32">
                        {isYouTube && ytEmbedUrl ? (
                            <div className="relative h-full w-full rounded-[2.5rem] bg-gray-900 overflow-hidden shadow-2xl border border-white/10 group/preview transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />
                                <iframe 
                                    ref={ytRef}
                                    src={ytEmbedUrl} 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen 
                                    className="absolute inset-0 w-full h-full border-none z-0" 
                                />
                                {/* Gloss effect overlay */}
                                <div className="absolute inset-x-0 top-0 h-px bg-white/20 rounded-t-[2.5rem] z-20" />
                            </div>
                        ) : (
                            <LiveAIPreview videoUrl={videoUrl} seekTime={seekTime} />
                        )}
                    </div>

                    {/* RIGHT: Tabbed Dashboard */}
                    <div className="lg:col-span-8 h-full flex flex-col pb-12">
                        
                        {/* Tab Navigation — Crystalline Redesign with Sliding Indicator */}
                        <div className="flex gap-1.5 mb-8 bg-white/30 backdrop-blur-2xl p-1.5 rounded-[1.25rem] w-fit border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] relative">
                            {[
                                { id: 'insights', label: 'Insights', icon: Activity },
                                { id: 'timeline', label: 'Timeline', icon: Clock },
                                { id: 'strategy', label: 'Strategy', icon: Target },
                                { id: 'scripts', label: 'Scripts', icon: Sparkles },
                            ].map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative px-5 py-2.5 rounded-[1rem] text-[13px] font-bold flex items-center gap-2.5 transition-all duration-300 group outline-none ${
                                            isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabBackground"
                                                className="absolute inset-0 bg-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-white rounded-[1rem] z-0"
                                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                            />
                                        )}
                                        <Icon className={`w-4 h-4 relative z-10 transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`} />
                                        <span className="relative z-10 capitalize tracking-tight">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1">
                            
                        {/* Tabs Content Area */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {/* TAB: INSIGHTS */}
                            {activeTab === 'insights' && (
                                <div className="flex flex-col gap-8">
                                    {/* Hook Score — Floating Refined Design */}
                                    <div className="px-2 py-4 flex flex-col md:flex-row gap-8 items-center relative group-hook overflow-hidden">
                                        {/* Background Dynamic Glow - Subtler for floating look */}
                                        <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[120px] opacity-10 pointer-events-none transition-colors duration-1000 ${
                                            hookScore >= 85 ? 'bg-emerald-500' : 
                                            hookScore >= 70 ? 'bg-orange-500' : 
                                            hookScore >= 40 ? 'bg-indigo-500' : 'bg-slate-400'
                                        }`} />

                                        {(() => {
                                            const theme = hookScore >= 85 ? { label: "Viral Legend", color: "text-emerald-600", bg: "bg-emerald-50/80", ring: "#10B981", glow: "rgba(16, 185, 129, 0.4)", icon: <Sparkles className="w-4 h-4" /> }
                                                        : hookScore >= 70 ? { label: "High Impact", color: "text-orange-600", bg: "bg-orange-50/80", ring: "#F59E0B", glow: "rgba(245, 158, 11, 0.4)", icon: <TrendingUp className="w-4 h-4" /> }
                                                        : hookScore >= 40 ? { label: "Standard Growth", color: "text-indigo-600", bg: "bg-indigo-50/80", ring: "#6366F1", glow: "rgba(99, 102, 241, 0.4)", icon: <Zap className="w-4 h-4" /> }
                                                        : { label: "Early Stage", color: "text-slate-500", bg: "bg-slate-50/80", ring: "#94A3B8", glow: "rgba(148, 163, 184, 0.4)", icon: <Activity className="w-4 h-4" /> };
                                            
                                            return (
                                                <>
                                                    {/* Left: Score Gauge */}
                                                    <div className="flex-shrink-0 relative w-32 h-32 flex items-center justify-center">
                                                        {/* Optimized Ring */}
                                                        <svg className="absolute inset-0 w-full h-full -rotate-90 scale-105" viewBox="0 0 100 100">
                                                            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="7" />
                                                            <motion.circle
                                                                cx="50"
                                                                cy="50"
                                                                r="44"
                                                                fill="none"
                                                                stroke={theme.ring}
                                                                strokeWidth="7"
                                                                strokeLinecap="round"
                                                                strokeDasharray="276"
                                                                initial={{ strokeDashoffset: 276 }}
                                                                animate={{ strokeDashoffset: 276 - (276 * (hookScore / 100)) }}
                                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                                style={{ 
                                                                    filter: `drop-shadow(0 0 8px ${theme.glow})`,
                                                                    transition: 'stroke 1s ease-in-out'
                                                                }}
                                                            />
                                                        </svg>
                                                        
                                                        <div className="flex flex-col items-center justify-center select-none">
                                                            <span className="text-[2.25rem] font-black text-[#1A1A24] leading-none tracking-tighter transition-colors duration-1000">
                                                                {hookScore}
                                                            </span>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <div className={`w-1 h-1 rounded-full animate-pulse ${theme.bg.replace('/80', '')} ${theme.color.replace('text-', 'bg-')}`} />
                                                                <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">Active</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Right: Info & Predictive Insight */}
                                                    <div className="flex-1 flex flex-col justify-center gap-3 relative z-10">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center ${theme.color}`}>
                                                                    <TrendingUp className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-[#1A1A24] font-serif font-bold text-xl">Hook Score</h3>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Audience Retention Metric</p>
                                                                </div>
                                                            </div>
                                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-white/60 shadow-sm font-bold text-[9px] uppercase tracking-widest ${theme.color} ${theme.bg}`}>
                                                                {theme.icon}
                                                                {theme.label}
                                                            </div>
                                                        </div>

                                                        {/* Refined Integrated Insight */}
                                                        <div className="relative pl-6 py-1 group/insight">
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${theme.color.replace('text-', 'bg-')} opacity-20`} />
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <Sparkles className={`w-3 h-3 ${theme.color} opacity-60`} />
                                                                <span className={`text-[9px] font-black uppercase tracking-widest ${theme.color} opacity-60`}>Predictive Insight</span>
                                                            </div>
                                                            <p className="text-[14px] font-medium text-gray-600 leading-relaxed italic">
                                                                "{hookAnalysis || "The narrative structure creates an immediate emotional connection, driving high initial retention levels."}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Generational Resonance — Full Width Horizontal Grid */}
                                    <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] flex flex-col relative">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-full bg-[#EFF5FC]/80 flex items-center justify-center text-[#2176FF] shadow-sm border border-white/50">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <span className="text-[#1A1A24] font-serif font-bold text-2xl">Generational Resonance</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { 
                                                    label: "Gen Z", 
                                                    data: genZ, 
                                                    icon: <Sparkles className="w-4 h-4 text-[#28276D]" />,
                                                    theme: "bg-[#9695FF]", 
                                                    bgStr: "bg-[#F8F9FE]/60 border-white/40",
                                                    text: "text-[#28276D]",
                                                    badge: "bg-[#E3E4FF]/80 text-[#4F46E5] border-[#D1D5FF]/50",
                                                    score: safeText(genZ.prediction)?.toLowerCase().includes('high') ? 'w-[92%]' : safeText(genZ.prediction)?.toLowerCase().includes('moderate') ? 'w-[60%]' : 'w-[35%]'
                                                },
                                                { 
                                                    label: "Millennials", 
                                                    data: millennials, 
                                                    icon: <Coffee className="w-4 h-4 text-[#7C3A00]" />,
                                                    theme: "bg-[#FFAA66]", 
                                                    bgStr: "bg-[#FFF9F4]/60 border-white/40",
                                                    text: "text-[#7C3A00]",
                                                    badge: "bg-[#FFE8D1]/80 text-[#C15800] border-[#FFD9B9]/50",
                                                    score: safeText(millennials.prediction)?.toLowerCase().includes('high') ? 'w-[85%]' : safeText(millennials.prediction)?.toLowerCase().includes('moderate') ? 'w-[55%]' : 'w-[30%]'
                                                },
                                                { 
                                                    label: "Boomers", 
                                                    data: boomers, 
                                                    icon: <Globe className="w-4 h-4 text-[#005138]" />,
                                                    theme: "bg-[#33D39E]", 
                                                    bgStr: "bg-[#F3FCF8]/60 border-white/40",
                                                    text: "text-[#005138]",
                                                    badge: "bg-[#D6F5E3]/80 text-[#008A4D] border-[#BBEBCE]/50",
                                                    score: safeText(boomers.prediction)?.toLowerCase().includes('high') ? 'w-[75%]' : safeText(boomers.prediction)?.toLowerCase().includes('moderate') ? 'w-[45%]' : 'w-[20%]'
                                                }
                                            ].map(gen => (
                                                <div key={gen.label} className={`relative p-5 rounded-2xl border transition-all duration-300 group ${gen.bgStr} hover:shadow-md backdrop-blur-sm`}>
                                                    <div className={`absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl ${gen.theme}`} />
                                                    <div className="pl-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-lg bg-white/60 ${gen.theme.replace('bg-', 'text-')} shadow-sm`}>
                                                                    {gen.icon}
                                                                </div>
                                                                <span className={`font-bold text-[16px] ${gen.text}`}>{gen.label}</span>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${gen.badge}`}>
                                                                {safeText(gen.data.prediction) || "N/A"}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="mb-4">
                                                            <div className="flex justify-between items-center mb-1.5">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resonance level</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                                                                <motion.div 
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: gen.score.replace('w-[', '').replace('%]', '') + '%' }}
                                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                                    className={`h-full ${gen.theme} opacity-80`} 
                                                                />
                                                            </div>
                                                        </div>

                                                        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
                                                            {safeText(gen.data.insight) || "No insight available."}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: TIMELINE — Redesigned with Visual Timeline & Glassmorphism */}
                            {activeTab === 'timeline' && (
                                <div className="space-y-6">
                                    <div className="w-full rounded-[2.5rem] overflow-hidden border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-white/30 backdrop-blur-xl">
                                        
                                        {/* Hero Header */}
                                        <div className="relative px-8 pt-6 pb-8 overflow-hidden rounded-t-[2.5rem]" style={{ background: 'linear-gradient(135deg, rgba(255,241,242,0.4) 0%, rgba(255,251,235,0.4) 100%)' }}>
                                            
                                            
                                            <div className="flex items-start justify-between relative z-10">
                                                <div>
                                                    
                                                    <h2 className="text-[#1A1A24] font-serif font-bold text-3xl">Retention & Edits</h2>
                                                    <p className="text-gray-500 text-sm mt-1">AI-detected spikes and optimization warnings mapped across your video.</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-rose-100 shadow-sm flex items-center justify-center text-rose-500">
                                                            <Activity className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-[0.2em]">Timeline Analysis</span>
                                                    </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-8 space-y-10">
                                            
                                            {/* Visual Timeline Bar */}
                                            <div className="relative pt-6 pb-12 px-2">
                                                <div className="h-2 w-full bg-gray-100/80 rounded-full relative overflow-visible border border-gray-200/50">
                                                    {/* Progress fill (covers full video length now) */}
                                                    <div className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-rose-400 to-amber-400 rounded-full opacity-30" />
                                                    
                                                    {/* Markers for Alerts */}
                                                    {editAlerts.map((alert, i) => {
                                                        const pos = (timestampToSeconds(safeText(alert.timestamp)) / totalDuration) * 100;
                                                        return (
                                                            <div 
                                                                key={`dot-alert-${i}`}
                                                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2 group/marker cursor-pointer z-20"
                                                                style={{ left: `${Math.min(pos, 100)}%` }}
                                                                onClick={() => {
                                                                    setSeekTime(timestampToSeconds(safeText(alert.timestamp)));
                                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                }}
                                                            >
                                                                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm hover:scale-150 transition-transform duration-300" />
                                                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1A1A24] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                                                    {safeText(alert.timestamp)} Warning
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#1A1A24]" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Markers for Spikes */}
                                                    {timestampHeatmap.map((spike, i) => {
                                                        const pos = (timestampToSeconds(safeText(spike.timestamp)) / totalDuration) * 100;
                                                        return (
                                                            <div 
                                                                key={`dot-spike-${i}`}
                                                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 -translate-x-1/2 group/marker cursor-pointer z-10"
                                                                style={{ left: `${Math.min(pos, 100)}%` }}
                                                                onClick={() => {
                                                                    setSeekTime(timestampToSeconds(safeText(spike.timestamp)));
                                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                }}
                                                            >
                                                                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white shadow-sm hover:scale-150 transition-transform duration-300" />
                                                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1A1A24] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                                                                    {safeText(spike.timestamp)} Spike
                                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#1A1A24]" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex justify-between mt-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest pl-1 pr-1">
                                                    <span>Start</span>
                                                    <span>{secondsToTimestamp(totalDuration / 2)}</span>
                                                    <span>End ({secondsToTimestamp(totalDuration)})</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                                                {/* Edit Alerts Panel */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                                                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block">Optimization Warnings</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {editAlerts.map((alert, i) => (
                                                            <div key={`alert-${i}`} className="flex gap-4 p-4 rounded-2xl border border-white/60 bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all group">
                                                                <button 
                                                                    onClick={() => {
                                                                        setSeekTime(timestampToSeconds(safeText(alert.timestamp)));
                                                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                    }}
                                                                    className="relative w-16 h-8 rounded-lg bg-rose-100/80 border border-rose-200 text-rose-700 font-mono font-bold text-xs tracking-wider flex items-center justify-center shrink-0 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                                                                >
                                                                    <span className="group-hover:-translate-y-8 transition-transform duration-300 absolute inset-0 flex items-center justify-center">{safeText(alert.timestamp) || "0:00"}</span>
                                                                    <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-300 absolute inset-0 flex items-center justify-center bg-rose-500 text-white">
                                                                        <PlayCircle className="w-4 h-4" />
                                                                    </div>
                                                                </button>
                                                                <p className="text-[14px] text-gray-700 leading-relaxed pt-0.5">{safeText(alert.feedback)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Intensity Spikes Panel */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <Zap className="w-4 h-4 text-amber-500" />
                                                        <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest block">Viral Intensity Spikes</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {timestampHeatmap.map((spike, i) => (
                                                            <div key={`spike-${i}`} className="flex gap-4 p-4 rounded-2xl border border-white/60 bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-all group items-center justify-between">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSeekTime(timestampToSeconds(safeText(spike.timestamp)));
                                                                            window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                        }}
                                                                        className="relative w-16 h-8 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-700 font-mono font-bold text-xs tracking-wider flex items-center justify-center shrink-0 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                                                                    >
                                                                        <span className="group-hover:-translate-y-8 transition-transform duration-300 absolute inset-0 flex items-center justify-center">{safeText(spike.timestamp)}</span>
                                                                        <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-300 absolute inset-0 flex items-center justify-center bg-amber-500 text-white">
                                                                            <PlayCircle className="w-4 h-4" />
                                                                        </div>
                                                                    </button>
                                                                    <p className="text-[14px] font-medium text-gray-800 line-clamp-2 italic">"{safeText(spike.event)}"</p>
                                                                </div>
                                                                <div className="flex flex-col items-center">
                                                                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 mb-1">
                                                                        <span className="text-amber-600 text-[12px] font-black">{safeNum(spike.importance_score)}</span>
                                                                    </div>
                                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Impact</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: STRATEGY */}
                            {activeTab === 'strategy' && (
                                <div className="flex flex-col gap-6">
                                    {/* Expansion Strategy — Glassmorphism */}
                                    <div className="w-full rounded-[2rem] overflow-hidden border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-white/30 backdrop-blur-xl">

                                        {/* Hero Header — Translucent */}
                                        <div className="relative px-6 pt-5 pb-6 overflow-hidden rounded-t-[2rem]" style={{ background: 'linear-gradient(135deg, rgba(199, 255, 230, 0.4) 0%, rgba(255,255,255,0.2) 100%)' }}>
                                            {/* India tricolor accent bar */}
                                            
                                            {/* Soft radial glow */}
                                            <div className="absolute inset-0 opacity-30 pointer-events-none"
                                                style={{ background: 'radial-gradient(ellipse at 90% 50%, rgba(255, 255, 255, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 10% 50%, rgba(255, 204, 204, 0.12) 0%, transparent 60%)' }} />

                                            <div className="flex items-start justify-between relative z-10">
                                                <div>
                                                    
                                                    <h2 className="text-[#1A1A24] font-serif font-bold text-3xl">Bharat Expansion</h2>
                                                    <p className="text-gray-500 text-sm mt-1">AI-generated multi-regional rollout strategy</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-emerald-600">
                                                            <Globe className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Growth Playbook</span>
                                                    </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="bg-white p-6 space-y-5">

                                            {/* Strategy Masterplan — Redesigned as Checklist */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Expansion Masterplan</span>
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Step-by-Step</span>
                                                </div>
                                                <div className="space-y-3">
                                                    {expansionStrategy ? expansionStrategy.split('. ').map((step, idx) => step.trim() && (
                                                        <div key={idx} className="relative group/step bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/60 hover:bg-white/40 transition-all">
                                                            <div className="flex gap-4">
                                                                <div className="mt-1">
                                                                    <CheckCircle className="w-5 h-5 text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                                <p className="text-[14px] text-gray-700 font-medium leading-relaxed">
                                                                    {step.endsWith('.') ? step : `${step}.`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-center text-gray-400 text-sm">
                                                            Detailed strategy steps will appear here.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Regions & Languages side by side */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                {/* Target Regions */}
                                                <div className="bg-orange-50/60 rounded-2xl p-5 border border-orange-100/80">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <MapPin className="w-4 h-4 text-orange-500" />
                                                        <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest">Primary Hubs</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {targetRegions.length > 0 ? targetRegions.map(region => (
                                                            <span key={safeText(region)} className="px-3 py-1.5 bg-white border border-orange-200/50 rounded-xl text-[13px] font-bold text-orange-900 shadow-sm hover:scale-105 transition-transform cursor-default">
                                                                {safeText(region)}
                                                            </span>
                                                        )) : <span className="text-sm text-gray-400 italic">Unspecified</span>}
                                                    </div>
                                                </div>

                                                {/* Dubbing Languages */}
                                                <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100/80">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Volume2 className="w-4 h-4 text-emerald-600" />
                                                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Dubbing Tracks</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {dubbingLanguages.length > 0 ? dubbingLanguages.map(lang => (
                                                            <span key={safeText(lang)} className="px-3 py-1.5 bg-white border border-emerald-200/50 rounded-xl text-[13px] font-bold text-emerald-900 shadow-sm hover:scale-105 transition-transform cursor-default">
                                                                🌐 {safeText(lang)}
                                                            </span>
                                                        )) : <span className="text-sm text-gray-400 italic">Unspecified</span>}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* SEO Tags Kit — Glassmorphism */}
                                    <div className="w-full rounded-[2rem] overflow-hidden border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-white/30 backdrop-blur-xl">

                                        {/* Hero Header — Translucent */}
                                        <div className="relative px-6 pt-5 pb-6 overflow-hidden rounded-t-[2rem]" style={{ background: 'linear-gradient(135deg, rgba(255, 223, 194, 0.4) 0%, rgba(255, 234, 214, 0.2) 100%)' }}>
                                            {/* Gradient accent bar */}
                                            
                                            {/* Soft background glow */}
                                            <div className="absolute inset-0 opacity-20 pointer-events-none"
                                                style={{ background: 'radial-gradient(ellipse at 85% 40%, #fff5edff 0%, transparent 60%), radial-gradient(ellipse at 10% 60%, #ffc69aff 0%, transparent 55%)' }} />

                                            <div className="flex items-start justify-between relative z-10">
                                                <div>
                                                    
                                                    <h2 className="text-[#1A1A24] font-serif font-bold text-3xl">SEO & Tags Kit</h2>
                                                    <p className="text-gray-500 text-sm mt-1">AI-crafted titles, hashtags & captions for maximum discovery</p>
                                                </div>
                                                <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-orange-500">
                                                            <Target className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Search Optimisation</span>
                                                    </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="bg-white p-6 space-y-5">

                                            {/* A/B Testing Title Variants */}
                                            {seoTitles.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Variant Discovery</span>
                                                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">A/B Testing</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {seoTitles.map((title, idx) => (
                                                            <div key={idx} className="group/variant relative p-5 rounded-2xl border border-white/60 bg-white/20 hover:bg-white/40 transition-all overflow-hidden">
                                                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-400 opacity-40 group-hover:bg-indigo-600 group-hover:opacity-100 transition-all" />
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">V-{idx+1}</span>
                                                                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Click Probability</span>
                                                                        </div>
                                                                        <p className="text-[15px] text-gray-800 font-bold leading-tight">"{safeText(title)}"</p>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => handleCopy(title, `title-${idx}`)}
                                                                        className="p-2 h-9 w-9 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                                    >
                                                                        {copiedId === `title-${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                                {/* Potential Bar */}
                                                                <div className="mt-4 flex items-center gap-3">
                                                                    <div className="flex-1 h-1 bg-gray-200/50 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 delay-300`} 
                                                                            style={{ width: `${95 - (idx * 15)}%`, opacity: 0.6 }} 
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase">{95 - (idx * 15)}%</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Keywords / Tags Cloud */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Dynamic Hashtag Cloud</span>
                                                    <button 
                                                        onClick={() => handleCopy(seoKeywords.map(kw => safeText(kw).startsWith('#') ? safeText(kw) : `#${safeText(kw).replace(/\s+/g, '')}`).join(' '), 'all-tags')}
                                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                                                    >
                                                        {copiedId === 'all-tags' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                        {copiedId === 'all-tags' ? 'Copied' : 'Copy All'}
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {seoKeywords.length > 0 ? seoKeywords.map((kw, tidx) => {
                                                        const keyword = safeText(kw);
                                                        const tag = keyword.startsWith('#') ? keyword : `#${keyword.replace(/\s+/g, '')}`;
                                                        return (
                                                            <span 
                                                                key={keyword} 
                                                                onClick={() => handleCopy(tag, `tag-${tidx}`)}
                                                                className={`bg-white/40 backdrop-blur-sm px-4 py-1.5 rounded-xl font-bold border transition-all cursor-pointer shadow-sm active:scale-95 text-[12px] ${copiedId === `tag-${tidx}` ? 'border-emerald-300 text-emerald-600' : 'text-gray-700 border-white/60 hover:border-indigo-300 hover:text-indigo-600'}`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        );
                                                    }) : <span className="text-gray-400 italic text-sm">No keywords extracted</span>}
                                                </div>
                                            </div>

                                            {/* Optimized Caption Box */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Optimized Captions</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-emerald-500 uppercase">Balanced Reading</span>
                                                        <span className="text-[10px] font-bold text-gray-300">{seoDescription.length} Chars</span>
                                                    </div>
                                                </div>
                                                <div className="relative bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/60 group/caption">
                                                    <div className="absolute left-0 top-6 bottom-6 w-1 rounded-full bg-indigo-500 opacity-60 group-hover:opacity-100 transition-all" />
                                                    <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed pl-4">
                                                        "{seoDescription}"
                                                    </p>
                                                    <button 
                                                        onClick={() => handleCopy(seoDescription, 'caption')}
                                                        className="absolute right-4 top-4 p-2 bg-white/80 border border-white/60 rounded-lg text-gray-400 hover:text-indigo-600 transition-all opacity-0 group-hover/caption:opacity-100 flex items-center justify-center h-8 w-8"
                                                    >
                                                        {copiedId === 'caption' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SCRIPTS — Redesigned with Hero & Copy Buttons */}
                            {activeTab === 'scripts' && spinoffs.length > 0 && (
                                <div className="space-y-6">
                                    <div className="w-full rounded-[2.5rem] overflow-hidden border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] bg-white/30 backdrop-blur-xl">
                                        
                                        {/* Hero Header */}
                                        <div className="relative px-8 pt-6 pb-4 overflow-hidden rounded-t-[2.5rem]" style={{ background: 'linear-gradient(135deg, rgba(238,242,255,0.4) 0%, rgba(245,243,255,0.4) 100%)' }}>
                                            
                                            
                                            <div className="flex items-start justify-between relative z-10">
                                                <div>
                                                   
                                                    <h2 className="text-[#1A1A24] font-serif font-bold text-3xl">AI Script Blueprints</h2>
                                                    <p className="text-gray-500 text-sm mt-1">Ready-to-use narrative frameworks optimized for maximum engagement.</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                     <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 shadow-sm flex items-center justify-center text-indigo-500">
                                                            <Sparkles className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Viral Engine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main Carousel Container */}
                                        <div className="px-8 py-2 relative min-h-fit flex flex-col justify-center">
                                            
                                            {/* Navigation Arrows */}
                                            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30">
                                                <button 
                                                    onClick={() => setCurrentScriptIndex(prev => Math.max(0, prev - 1))}
                                                    disabled={currentScriptIndex === 0}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all pointer-events-auto shadow-md ${currentScriptIndex === 0 ? 'bg-gray-50/50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white/80 text-indigo-600 border-white hover:bg-white hover:scale-110 active:scale-95'}`}
                                                >
                                                    <ChevronLeft className="w-6 h-6" />
                                                </button>
                                                <button 
                                                    onClick={() => setCurrentScriptIndex(prev => Math.min(spinoffs.length - 1, prev + 1))}
                                                    disabled={currentScriptIndex === spinoffs.length - 1}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all pointer-events-auto shadow-md ${currentScriptIndex === spinoffs.length - 1 ? 'bg-gray-50/50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white/80 text-indigo-600 border-white hover:bg-white hover:scale-110 active:scale-95'}`}
                                                >
                                                    <ChevronRight className="w-6 h-6" />
                                                </button>
                                            </div>

                                            <div className="relative overflow-hidden w-full max-w-4xl mx-auto py-2">
                                                <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={currentScriptIndex}
                                                            initial={{ x: 40, opacity: 0 }}
                                                            animate={{ x: 0, opacity: 1 }}
                                                            exit={{ x: -40, opacity: 0 }}
                                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                                            className="w-full"
                                                        >
                                                        {/* Script Card */}
                                                        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl overflow-hidden relative group/scard">
                                                            {/* Accent Bar */}
                                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-500 via-black-500 to-black-500" />
                                                            
                                                            <div className="p-7 space-y-6">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded uppercase">Concept {currentScriptIndex + 1}</span>
                                                                        <span className="text-[11px] font-bold text-indigo-600/60 uppercase tracking-widest">{safeText(spinoffs[currentScriptIndex]?.theme)}</span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const s = spinoffs[currentScriptIndex];
                                                                            const text = `HOOK: ${s.step_1_hook}\nVALUE: ${s.step_2_value}\nTWIST: ${s.step_3_twist}\nCTA: ${s.step_4_cta}`;
                                                                            handleCopy(text, `full-script-${currentScriptIndex}`);
                                                                        }}
                                                                        className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm"
                                                                    >
                                                                        {copiedId === `full-script-${currentScriptIndex}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                                        {copiedId === `full-script-${currentScriptIndex}` ? 'Copied Full Script' : 'Copy Full Script'}
                                                                    </button>
                                                                </div>

                                                                {/* Segmented Regions */}
                                                                <div className="space-y-6">
                                                                    {[
                                                                        { type: 'hook', icon: <Zap className="w-3.5 h-3.5" />, title: '0-3s Hook', color: 'text-amber-600 bg-amber-50', text: safeText(spinoffs[currentScriptIndex]?.step_1_hook) },
                                                                        { type: 'value', icon: <Sparkles className="w-3.5 h-3.5" />, title: '3-15s Core Value', color: 'text-emerald-600 bg-emerald-50', text: safeText(spinoffs[currentScriptIndex]?.step_2_value) },
                                                                        { type: 'twist', icon: <TrendingUp className="w-3.5 h-3.5" />, title: '15-25s The Twist', color: 'text-indigo-600 bg-indigo-50', text: safeText(spinoffs[currentScriptIndex]?.step_3_twist) },
                                                                        { type: 'cta', icon: <Target className="w-3.5 h-3.5" />, title: '25-30s Call to Action', color: 'text-rose-600 bg-rose-50', text: safeText(spinoffs[currentScriptIndex]?.step_4_cta) }
                                                                    ].map((seg, sidx) => (
                                                                        <div key={seg.type} className="group/seg relative">
                                                                            <div className="flex items-center justify-between mb-2 px-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={`p-1 rounded-md ${seg.color}`}>
                                                                                        {seg.icon}
                                                                                    </div>
                                                                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">{seg.title}</span>
                                                                                </div>
                                                                                <button 
                                                                                    onClick={() => handleCopy(seg.text, `seg-${currentScriptIndex}-${sidx}`)}
                                                                                    className="opacity-0 group-hover/seg:opacity-100 p-1 text-gray-300 hover:text-indigo-400 transition-all flex items-center justify-center"
                                                                                >
                                                                                    {copiedId === `seg-${currentScriptIndex}-${sidx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                                                </button>
                                                                            </div>
                                                                            <p className="text-[16px] text-gray-800 font-medium leading-relaxed pl-1">
                                                                                {seg.text}
                                                                            </p>
                                                                            {sidx < 3 && <div className="mt-4 border-b border-gray-100/50 border-dashed" />}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>

                                            {/* Progress Indicators */}
                                            <div className="flex justify-center gap-3 mt-4">
                                                {spinoffs.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentScriptIndex(idx)}
                                                        className={`h-2 transition-all duration-300 rounded-full ${idx === currentScriptIndex ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    
                                </div>
                            )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
    );
}
