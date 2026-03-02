// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { signOut } from "aws-amplify/auth";
// import { LogOut, Loader2, Link as LinkIcon, Activity, Radar, User } from "lucide-react";
// import { useAuth } from "@/components/auth/AuthContext";

// export default function Dashboard() {
//     const router = useRouter();
//     const [file, setFile] = useState(null);
//     const [isAnalyzing, setIsAnalyzing] = useState(false);
//     const [statusMessage, setStatusMessage] = useState("");
//     const [hasData, setHasData] = useState(false); // Controls when to show the real cards vs skeletons
//     const { user } = useAuth();

//     const handleSignOut = async () => {
//         try {
//             await signOut();
//             router.push("/login");
//         } catch (error) {
//             console.error("Error signing out:", error);
//         }
//     };

//     const handleAnalyze = async (e) => {
//         e.preventDefault();

//         if (!file) return;

//         setIsAnalyzing(true);
//         setStatusMessage("");
//         setHasData(false);

//         try {
//             setStatusMessage('Requesting secure upload link...');

//             // 1. Get Pre-signed URL
//             const presignRes = await fetch('/api/upload', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     fileName: file.name,
//                     fileType: file.type || 'video/mp4'
//                 })
//             });

//             if (!presignRes.ok) throw new Error('Failed to get upload URL');
//             const { presignedUrl, jobId, s3Key } = await presignRes.json();

//             // 2. Upload file directly to S3
//             setStatusMessage('Uploading video directly to secure vault...');
//             const uploadRes = await fetch(presignedUrl, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': file.type || 'video/mp4' },
//                 body: file
//             });

//             if (!uploadRes.ok) throw new Error('Failed to upload file to vault');

//             setStatusMessage('Upload complete. Queueing for DNA extraction...');

//             // 3. Trigger SQS endpoint directly from Next.js API
//             const sqsRes = await fetch('/api/trigger-sqs', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     jobId,
//                     s3Key
//                 })
//             });

//             if (!sqsRes.ok) throw new Error('Failed to queue video analysis in SQS');

//             setStatusMessage('Video successfully uploaded to secure vault and queued for analysis!');
//             setFile(null);
//         } catch (error) {
//             console.error("Error during upload:", error);
//             setStatusMessage(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
//         } finally {
//             setIsAnalyzing(false);
//             // setHasData(true); // Uncomment to mock data load visually
//         }
//     };

//     return (
//         <main className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans relative overflow-hidden selection:bg-indigo-500/30">
//             {/* Subtle mesh gradients */}
//             <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
//             <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

//             {/* Navigation Bar */}
//             <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-white/5">
//                 <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                         <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
//                             <span className="text-white font-serif font-bold text-lg">S</span>
//                         </div>
//                         <span className="text-xl font-serif font-medium tracking-wide text-white">Social Lens</span>
//                     </div>

//                     <div className="flex items-center gap-4">
//                         {user && (
//                             <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
//                                 <User className="w-4 h-4" />
//                                 <span className="text-sm font-medium">{user.name || user.email || "Creator"}</span>
//                             </div>
//                         )}
//                         <button
//                             onClick={handleSignOut}
//                             className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-colors"
//                         >
//                             <LogOut className="w-4 h-4" />
//                             Sign Out
//                         </button>
//                     </div>
//                 </div>
//             </nav>

//             {/* Main Content */}
//             <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto relative z-10 flex flex-col items-center">

//                 {/* Hero Section */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="text-center w-full mb-16"
//                 >
//                     <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-4">
//                         Synthesize Content DNA
//                     </h1>
//                     <p className="text-lg text-gray-400 max-w-2xl mx-auto">
//                         Input your content link below to uncover deep cultural markers, audience sentiment, and retention hotspots.
//                     </p>
//                 </motion.div>

//                 {/* Input Section */}
//                 <motion.form
//                     onSubmit={handleAnalyze}
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.5, delay: 0.1 }}
//                     className="w-full max-w-3xl mb-24 relative"
//                 >
//                     <div className="relative group">
//                         {/* Glow effect behind input */}
//                         <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

//                         <div className="relative flex items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden">
//                             <div className="pl-4 pr-2 text-gray-500 min-w-12 flex justify-center">
//                                 <LinkIcon className="w-5 h-5" />
//                             </div>

//                             <div className="flex-1 flex items-center px-2 py-2">
//                                 <label className="flex-1 cursor-pointer flex items-center justify-between border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-colors">
//                                     <span className="text-gray-400 text-sm md:text-base truncate">
//                                         {file ? file.name : "Select an MP4 video file to upload directly to S3..."}
//                                     </span>
//                                     <input
//                                         type="file"
//                                         accept="video/mp4"
//                                         onChange={(e) => {
//                                             if (e.target.files && e.target.files.length > 0) {
//                                                 setFile(e.target.files[0]);
//                                             }
//                                         }}
//                                         required
//                                         className="hidden"
//                                         disabled={isAnalyzing}
//                                     />
//                                     <div className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
//                                         Browse File
//                                     </div>
//                                 </label>
//                             </div>

//                             <button
//                                 type="submit"
//                                 disabled={isAnalyzing || !file}
//                                 className="ml-2 flex flex-shrink-0 items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white text-black rounded-xl font-medium text-sm md:text-base transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {isAnalyzing ? (
//                                     <>
//                                         <Loader2 className="w-5 h-5 animate-spin" />
//                                         Uploading...
//                                     </>
//                                 ) : (
//                                     "Direct Upload"
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                     {statusMessage && (
//                         <div className={`absolute -bottom-10 left-0 right-0 text-center text-sm font-medium ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
//                             {statusMessage}
//                         </div>
//                     )}
//                 </motion.form>

//                 {/* Results / Skeletons Grid */}
//                 <div className="w-full grid md:grid-cols-2 gap-8">
//                     {/* Retention Risk Heatmap Card */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.2 }}
//                         className="bg-[#111111] border border-white/5 rounded-3xl p-8 min-h-[350px] flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
//                     >
//                         <div className="flex items-center gap-3 mb-8 opacity-70">
//                             <Activity className="w-5 h-5 text-orange-400" />
//                             <h3 className="text-lg font-serif font-medium text-gray-200">Retention Risk Heatmap</h3>
//                         </div>

//                         {!hasData ? (
//                             <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
//                                 {/* Skeletons */}
//                                 <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
//                                 <div className="h-4 w-[85%] bg-white/5 rounded-full animate-pulse delay-75" />
//                                 <div className="h-4 w-[60%] bg-white/5 rounded-full animate-pulse delay-150" />
//                                 <div className="h-8 w-[30%] bg-orange-500/10 rounded-full animate-pulse mt-4" />
//                             </div>
//                         ) : (
//                             <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
//                                 Data Rendered Here
//                             </div>
//                         )}

//                         <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
//                     </motion.div>

//                     {/* Societal Audit Card */}
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.3 }}
//                         className="bg-[#111111] border border-white/5 rounded-3xl p-8 min-h-[350px] flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
//                     >
//                         <div className="flex items-center gap-3 mb-8 opacity-70">
//                             <Radar className="w-5 h-5 text-indigo-400" />
//                             <h3 className="text-lg font-serif font-medium text-gray-200">Societal Audit</h3>
//                         </div>

//                         {!hasData ? (
//                             <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
//                                 {/* Skeletons */}
//                                 <div className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
//                                 <div className="grid grid-cols-2 gap-3">
//                                     <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
//                                     <div className="h-12 bg-white/5 rounded-xl animate-pulse delay-75" />
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
//                                 Data Rendered Here
//                             </div>
//                         )}

//                         <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
//                     </motion.div>
//                 </div>

//             </div>
//         </main>
//     );
// }














"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { LogOut, Loader2, Link as LinkIcon, Activity, Radar, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";

export default function Dashboard() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [hasData, setHasData] = useState(false); 
    const { user } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();

        if (!file) return;

        setIsAnalyzing(true);
        setStatusMessage("");
        setHasData(false);

        try {
            setStatusMessage('Requesting secure upload link...');

            // Extract a reliable user ID from AWS Amplify's user object
            // Adjust "userId" to "username" or "id" depending on your exact Amplify auth schema
            const currentUserId = user?.userId || user?.username || "anonymous_user";
            const currentFeature = "analysis";

            // 1. Get Pre-signed URL (Now passing userId and feature)
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
            
            // Extract the returned values, including the newly returned userId and feature
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

            // 3. Trigger SQS endpoint (Now passing userId and feature alongside jobId and s3Key)
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

            setStatusMessage('Video successfully uploaded to secure vault and queued for analysis!');
            setFile(null);
        } catch (error) {
            console.error("Error during upload:", error);
            setStatusMessage(`Error: ${error.message || "An unexpected error occurred. Please try again."}`);
        } finally {
            setIsAnalyzing(false);
            // setHasData(true); 
        }
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans relative overflow-hidden selection:bg-indigo-500/30">
            {/* Subtle mesh gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Bar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0A]/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-serif font-bold text-lg">S</span>
                        </div>
                        <span className="text-xl font-serif font-medium tracking-wide text-white">Social Lens</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">{user.name || user.email || "Creator"}</span>
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto relative z-10 flex flex-col items-center">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center w-full mb-16"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-4">
                        Synthesize Content DNA
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Input your content link below to uncover deep cultural markers, audience sentiment, and retention hotspots.
                    </p>
                </motion.div>

                {/* Input Section */}
                <motion.form
                    onSubmit={handleAnalyze}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-3xl mb-24 relative"
                >
                    <div className="relative group">
                        {/* Glow effect behind input */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                        <div className="relative flex items-center bg-[#141414] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden">
                            <div className="pl-4 pr-2 text-gray-500 min-w-12 flex justify-center">
                                <LinkIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 flex items-center px-2 py-2">
                                <label className="flex-1 cursor-pointer flex items-center justify-between border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-colors">
                                    <span className="text-gray-400 text-sm md:text-base truncate">
                                        {file ? file.name : "Select an MP4 video file to upload directly to S3..."}
                                    </span>
                                    <input
                                        type="file"
                                        accept="video/mp4"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setFile(e.target.files[0]);
                                            }
                                        }}
                                        required
                                        className="hidden"
                                        disabled={isAnalyzing}
                                    />
                                    <div className="bg-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300">
                                        Browse File
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isAnalyzing || !file}
                                className="ml-2 flex flex-shrink-0 items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 bg-white text-black rounded-xl font-medium text-sm md:text-base transition-all hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Direct Upload"
                                )}
                            </button>
                        </div>
                    </div>
                    {statusMessage && (
                        <div className={`absolute -bottom-10 left-0 right-0 text-center text-sm font-medium ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                            {statusMessage}
                        </div>
                    )}
                </motion.form>

                {/* Results / Skeletons Grid */}
                <div className="w-full grid md:grid-cols-2 gap-8">
                    {/* Retention Risk Heatmap Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-[#111111] border border-white/5 rounded-3xl p-8 min-h-[350px] flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-8 opacity-70">
                            <Activity className="w-5 h-5 text-orange-400" />
                            <h3 className="text-lg font-serif font-medium text-gray-200">Retention Risk Heatmap</h3>
                        </div>

                        {!hasData ? (
                            <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
                                {/* Skeletons */}
                                <div className="h-4 w-full bg-white/5 rounded-full animate-pulse" />
                                <div className="h-4 w-[85%] bg-white/5 rounded-full animate-pulse delay-75" />
                                <div className="h-4 w-[60%] bg-white/5 rounded-full animate-pulse delay-150" />
                                <div className="h-8 w-[30%] bg-orange-500/10 rounded-full animate-pulse mt-4" />
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                Data Rendered Here
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
                    </motion.div>

                    {/* Societal Audit Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-[#111111] border border-white/5 rounded-3xl p-8 min-h-[350px] flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-8 opacity-70">
                            <Radar className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-serif font-medium text-gray-200">Societal Audit</h3>
                        </div>

                        {!hasData ? (
                            <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
                                {/* Skeletons */}
                                <div className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                                    <div className="h-12 bg-white/5 rounded-xl animate-pulse delay-75" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                                Data Rendered Here
                            </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                </div>

            </div>
        </main>
    );
}