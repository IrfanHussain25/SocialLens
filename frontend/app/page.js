"use client";

import { motion } from "framer-motion";
import { ArrowRight, Aperture, AudioLines, Zap, Users, Library, Activity, Cloud, Database } from "lucide-react";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden font-sans">

      {/* SECTION 1: Hero Section (The Indic Entry) */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-6 pt-32 pb-24">
        {/* Exact Sarvam replica background gradient */}
        <div className="absolute top-0 inset-x-0 h-[800px] overflow-hidden pointer-events-none flex justify-center z-0">
          {/* Base wide purple glow */}
          <div className="absolute top-[-10%] w-[150vw] max-w-[2500px] h-[800px] opacity-80 blur-[60px]"
            style={{ background: 'radial-gradient(50% 100% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>

          {/* Intense Saffron/Orange Core at top */}
          <div className="absolute top-[-5%] w-[100vw] max-w-[1500px] h-[500px] opacity-90 blur-[80px]"
            style={{ background: 'radial-gradient(50% 100% at 50% 0%, #FFB472 0%, rgba(255,180,114,0) 100%)' }}></div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUpVariant}
          className="max-w-4xl mx-auto flex flex-col items-center relative z-10"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-gray-950 mb-8 leading-[1.1]">
            AI for Content, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-orange-400">built for Creators.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 font-sans max-w-2xl mb-12 leading-relaxed">
            From engagement prediction to societal sentiment analysis — understand audience response at every level.
          </p>
          <button className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-gray-950 text-white rounded-full font-medium text-lg overflow-hidden transition-all shadow-xl hover:shadow-2xl">
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A54A6] via-[#A8A1E2] to-[#E5B56D] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Button Content */}
            <span className="relative z-10 flex items-center gap-3">
              Analyze Content
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </section>

      {/* SECTION 2: Feature Alternating Blocks (The DNA Vectors) */}
      <section className="py-32 px-6 max-w-6xl mx-auto space-y-40">
        {/* Visual DNA Block */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="grid md:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          {/* Visual Card (Left) */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 to-purple-300 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 rounded-full" />
            <div className="relative aspect-square rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 to-purple-50/50" />
              <Aperture className="w-32 h-32 text-indigo-500 drop-shadow-sm z-10 transition-transform duration-700 group-hover:scale-105" strokeWidth={1} />
            </div>
          </div>
          {/* Content (Right) */}
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-8">Visual DNA</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-1 border border-indigo-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>
                <p className="text-xl text-gray-700">Frame-by-frame object analysis</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-1 border border-indigo-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>
                <p className="text-xl text-gray-700">Indian cultural symbol detection</p>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Audio DNA Block */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUpVariant}
          className="grid md:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          {/* Content (Left) */}
          <div className="order-2 md:order-1">
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900 mb-8">Audio DNA</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-1 border border-orange-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                </div>
                <p className="text-xl text-gray-700">Hinglish code-switching detection</p>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-1 border border-orange-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                </div>
                <p className="text-xl text-gray-700">Regional music & accent recognition</p>
              </li>
            </ul>
          </div>
          {/* Audio Card (Right) */}
          <div className="relative group order-1 md:order-2">
            <div className="absolute inset-0 bg-gradient-to-bl from-orange-300 to-rose-300 blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 rounded-full" />
            <div className="relative aspect-square rounded-[2.5rem] bg-white/40 backdrop-blur-md border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/50 to-rose-50/50" />
              <AudioLines className="w-32 h-32 text-orange-400 drop-shadow-sm z-10 transition-transform duration-700 group-hover:scale-105" strokeWidth={1} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 3: The Societal Audit (Three-Column Model Grid) */}
      <section className="py-40 px-6 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-gray-900">The Societal Audit</h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Gen Z Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="group relative h-[400px] rounded-3xl p-10 flex flex-col bg-white overflow-hidden border border-gray-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-8 border border-indigo-100/50">
                  <Zap className="w-6 h-6 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-serif font-medium text-gray-900 mb-2">Gen Z</h3>
                <p className="text-indigo-600 font-medium mb-auto">12-27</p>
                <div className="pt-8 mt-8 border-t border-indigo-50/80">
                  <p className="text-gray-600 text-lg leading-relaxed">Focuses on viral trend-relevance and high-energy pacing.</p>
                </div>
              </div>
            </motion.div>

            {/* Millennials Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="group relative h-[400px] rounded-3xl p-10 flex flex-col bg-white overflow-hidden border border-gray-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-8 border border-orange-100/50">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-3xl font-serif font-medium text-gray-900 mb-2">Millennials</h3>
                <p className="text-orange-500 font-medium mb-auto">28-43</p>
                <div className="pt-8 mt-8 border-t border-orange-50/80">
                  <p className="text-gray-600 text-lg leading-relaxed">Focuses on authenticity and deep cultural connection.</p>
                </div>
              </div>
            </motion.div>

            {/* Boomers Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="group relative h-[400px] rounded-3xl p-10 flex flex-col bg-white overflow-hidden border border-gray-100 shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 border border-emerald-100/50">
                  <Library className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-3xl font-serif font-medium text-gray-900 mb-2">Boomers</h3>
                <p className="text-emerald-600 font-medium mb-auto">60-78</p>
                <div className="pt-8 mt-8 border-t border-emerald-50/80">
                  <p className="text-gray-600 text-lg leading-relaxed">Focuses on clarity and traditional sensitivity.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Infrastructure (The Scale Section) */}
      <section className="bg-[#111827] py-40 px-6 relative overflow-hidden">
        {/* Decorative dark background glows */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white mb-6">Scale Without Limits</h2>
            <p className="text-xl text-gray-400 font-sans max-w-2xl mx-auto">
              Built on AWS for 1 Million+ concurrent creators.
            </p>
          </motion.div>

          <div className="relative flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 py-10">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative group hover:bg-white/10 transition-colors">
                <Cloud className="w-10 h-10 text-gray-300 drop-shadow-md" />
              </div>
              <p className="text-gray-300 font-medium tracking-wide">API Gateway</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-32 h-32 rounded-[2rem] bg-indigo-500/10 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)] relative group hover:bg-indigo-500/20 transition-colors">
                <Activity className="w-12 h-12 text-indigo-400 drop-shadow-lg" />
              </div>
              <p className="text-white font-medium tracking-wide text-lg">AWS Lambda</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative group hover:bg-white/10 transition-colors">
                <Database className="w-10 h-10 text-gray-300 drop-shadow-md" />
              </div>
              <p className="text-gray-300 font-medium tracking-wide">Amazon Bedrock</p>
            </motion.div>
          </div>
        </div>
      </section>

    </main>
  );
}
