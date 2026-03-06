"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Aperture, AudioLines, Zap, Users, Library, Heart, Shield, Globe } from "lucide-react";
import { CursorAwareButton } from "../components/CursorAwareButton";
import { CTASection, Footer } from "../components/layout/footer";
import { useAuth } from "@/components/auth/AuthContext";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

const Sparkline = ({ points, color, delay = 0 }) => {
  const pathData = `M ${points.map((p, i) => `${i * 30},${100 - p}`).join(' L ')}`;
  return (
    <div className="w-full h-16 opacity-40 overflow-visible">
      <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

const StickyDNASection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Opacity transforms for cross-fading content
  const visualOpacity = useTransform(scrollYProgress, [0, 0.4, 0.5], [1, 1, 0]);
  const audioOpacity = useTransform(scrollYProgress, [0.5, 0.6, 1], [0, 1, 1]);

  // Scale and Movement transforms
  const visualScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.9]);
  const audioScale = useTransform(scrollYProgress, [0.6, 1], [0.9, 1]);

  // Optimized Layered Glow transforms
  const visualGlowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const audioGlowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return (
    <section ref={containerRef} className="relative h-[300vh] antialiased">
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden transform-gpu will-change-transform">
        {/* Optimized Layered Background Glows (GPU Accelerated) */}
        <motion.div
          className="absolute inset-0 blur-[90px] pointer-events-none transform-gpu will-change-[opacity] backface-visibility-hidden"
          style={{
            opacity: visualGlowOpacity,
            background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.2) 0%, transparent 70%)'
          }}
        />
        <motion.div
          className="absolute inset-0 blur-[90px] pointer-events-none transform-gpu will-change-[opacity] backface-visibility-hidden"
          style={{
            opacity: audioGlowOpacity,
            background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
          }}
        />

        <div className="max-w-7xl mx-auto px-6 w-full relative h-[600px]">
          {/* Visual DNA Content */}
          <motion.div
            style={{ opacity: visualOpacity, scale: visualScale }}
            className="absolute inset-0 grid md:grid-cols-2 gap-24 items-center pointer-events-none data-[active=true]:pointer-events-auto"
            data-active={visualOpacity.get() > 0.5}
          >
            <div className="relative group">
              {/* Neural Scanner Module */}
              <div className="absolute inset-x-0 -top-20 flex justify-center opacity-30">
                <span className="text-[10px] font-mono font-bold text-indigo-400 tracking-[0.3em] uppercase">Neural Analysis Zone // Visual</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-[100px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />

              <div
                className="relative aspect-square rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden group/module"
              >
                {/* Inner Shadow & Glass Depth */}
                <div className="absolute inset-0 shadow-[inner_0_0_60px_rgba(255,255,255,0.2)] pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50" />

                {/* Scanner UI Elements */}
                <div className="absolute inset-10 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-20 border-t-2 border-indigo-400/40 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                  <div className="h-[80%] w-[1px] bg-gradient-to-b from-transparent via-indigo-400/50 to-transparent absolute left-1/2 -translate-x-1/2 animate-pulse" />
                </div>

                {/* Core Visual Icon */}
                <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-white/5 rounded-full backdrop-blur-3xl border border-white/20 shadow-inner group-hover/module:scale-110 transition-transform duration-700">
                  <Aperture className="w-16 h-16 text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" strokeWidth={1} />
                </div>

                {/* Floating Metadata Tags */}
                <div className="absolute top-8 left-8 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                  <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-1">SCAN: 4K/60</p>
                  <div className="w-12 h-1 bg-indigo-500/30 rounded-full overflow-hidden">
                    <motion.div animate={{ x: [-48, 48] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-full h-full bg-indigo-400" />
                  </div>
                </div>
                <div className="absolute bottom-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg text-right">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">DEPTH: AI-MAX</p>
                  <p className="font-mono text-[10px] text-white">98.2% TRUE</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              {/* Technical Sub-Heading */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest border border-indigo-500/20">Neural_Sync: Active</span>
                <div className="h-[1px] w-12 bg-indigo-200" />
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest">Signal_Strength: 0.98</span>
              </motion.div>

              <h2 className="text-6xl md:text-7xl font-serif font-medium text-gray-950 mb-8 tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-950 to-gray-500">Visual DNA</span>
              </h2>

              <p className="text-2xl text-gray-600 mb-16 leading-relaxed font-sans tracking-tight">
                Our models break down video content into granular visual markers, identifying everything from cultural accents to color psychology.
              </p>

              <div className="space-y-10">
                {[
                  { id: "VIS-01", label: "Neural Frame Analysis", desc: "Frame-by-frame object & depth mapping" },
                  { id: "VIS-02", label: "Cultural Detection", desc: "Indian cultural symbol & gesture recognition" },
                  { id: "VIS-03", label: "Aesthetic Scoring", desc: "Cinematic quality & color theory validation" }
                ].map((item, i) => (
                  <div key={i} className="group/item">
                    <div className="flex items-start gap-6 mb-3">
                      <span className="font-mono text-sm font-bold text-indigo-400 mt-1">[{item.id}]</span>
                      <div>
                        <h4 className="text-2xl text-gray-900 font-bold tracking-tight mb-1">{item.label}</h4>
                        <p className="text-lg text-gray-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    {/* Micro Progress Bar */}
                    <div className="ml-20 h-[2px] w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                        className="h-full bg-indigo-500/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Audio DNA Content */}
          <motion.div
            style={{ opacity: audioOpacity, scale: audioScale }}
            className="absolute inset-0 grid md:grid-cols-2 gap-24 items-center pointer-events-none data-[active=true]:pointer-events-auto"
            data-active={audioOpacity.get() > 0.5}
          >
            <div className="order-2 md:order-1 flex flex-col justify-center">
              {/* Technical Sub-Heading */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-6"
              >
                <span className="px-2 py-0.5 rounded bg-orange-500/10 text-[10px] font-mono font-bold text-orange-500 uppercase tracking-widest border border-orange-500/20">Spectrum_Logic: Active</span>
                <div className="h-[1px] w-12 bg-orange-200" />
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-widest">Clarity_Index: 0.92</span>
              </motion.div>

              <h2 className="text-6xl md:text-7xl font-serif font-medium text-gray-950 mb-8 tracking-tighter">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-950 to-gray-500">Audio DNA</span>
              </h2>

              <p className="text-2xl text-gray-600 mb-16 leading-relaxed font-sans tracking-tight">
                Understanding voice in Bharat requires more than just transcription. We detect the soul behind the sound.
              </p>

              <div className="space-y-10">
                {[
                  { id: "AUD-01", label: "Linguistic Switching", desc: "Hinglish & regional code-switching detection" },
                  { id: "AUD-02", label: "Cultural Soundscapes", desc: "Traditional music & regional accent recognition" },
                  { id: "AUD-03", label: "Prosody Analysis", desc: "Emotional tone & emotional resonance mapping" }
                ].map((item, i) => (
                  <div key={i} className="group/item">
                    <div className="flex items-start gap-6 mb-3">
                      <span className="font-mono text-sm font-bold text-orange-400 mt-1">[{item.id}]</span>
                      <div>
                        <h4 className="text-2xl text-gray-900 font-bold tracking-tight mb-1">{item.label}</h4>
                        <p className="text-lg text-gray-500 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    {/* Micro Progress Bar */}
                    <div className="ml-20 h-[2px] w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: i * 0.2 }}
                        className="h-full bg-orange-400/40"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group order-1 md:order-2">
              {/* Spectral Analysis Module */}
              <div className="absolute inset-x-0 -top-20 flex justify-center opacity-30 text-right">
                <span className="text-[10px] font-mono font-bold text-orange-400 tracking-[0.3em] uppercase">Spectral Processing // Audio</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-bl from-orange-400/20 to-rose-400/10 blur-[100px] opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />

              <div
                className="relative aspect-square rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden group/audio"
              >
                {/* Inner Depth */}
                <div className="absolute inset-0 shadow-[inner_0_0_60px_rgba(255,255,100,0.05)] pointer-events-none" />

                {/* Animated Frequency Bars Background */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 px-12 opacity-20">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', '60%', '20%'] }}
                      transition={{ repeat: Infinity, duration: 1.5 + i * 0.1, ease: "easeInOut" }}
                      className="w-full bg-orange-400/50 rounded-full"
                    />
                  ))}
                </div>

                {/* Core Audio Icon */}
                <div className="relative z-10 w-32 h-32 flex items-center justify-center bg-white/5 rounded-[2.5rem] backdrop-blur-3xl border border-white/20 shadow-inner group-hover/audio:rotate-3 transition-transform duration-700">
                  <AudioLines className="w-16 h-16 text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]" strokeWidth={1} />
                </div>

                {/* Technical Tags */}
                <div className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg text-right">
                  <p className="text-[8px] font-bold text-orange-400 uppercase tracking-widest mb-1">FREQ: 192kHz</p>
                  <div className="flex gap-1 justify-end">
                    {[...Array(4)].map((_, i) => (
                      <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, delay: i * 0.2 }} className="w-1 h-1 rounded-full bg-orange-400" />
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-8 left-8 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-lg">
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">BIT: 32-FLOAT</p>
                  <p className="font-mono text-[10px] text-white tracking-widest">Hinglish: OK</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const ParticleEngine = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const isVisible = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    // Intersection Observer to stop animation when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (isVisible.current) {
          animate(); // Restart animation when it comes back into view
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      },
      { threshold: 0.1 }
    );

    if (canvas) observer.observe(canvas);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.density = (Math.random() * 30) + 1;
      }
      draw() {
        ctx.fillStyle = "rgba(79, 70, 229, 0.4)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
      update() {
        let dx = mouseRef.current.x - this.x;
        let dy = mouseRef.current.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 150;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
          this.x -= directionX;
          this.y -= directionY;
        } else {
          this.x += this.speedX;
          this.y += this.speedY;
        }

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!isVisible.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    resize();
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (canvas) observer.unobserve(canvas);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />;
};

export default function Home() {
  const footerRevealRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { scrollYProgress: footerRevealProgress } = useScroll({
    target: footerRevealRef,
    offset: ["start end", "end end"]
  });

  return (
    <main className="min-h-screen selection:bg-indigo-100 selection:text-indigo-900 font-sans relative">
      <style jsx global>{`
        body { background-color: white !important; }
        .grain {
          background-image: url("https://grainy-gradients.vercel.app/noise.svg");
          filter: contrast(150%) brightness(1000%);
        }
      `}</style>

      {/* GLOBAL FILM GRAIN LAYER */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] grain mix-blend-overlay" />

      {/* 
        THE ENVELOPE DIV
      */}
      <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">

        {/* SECTION 1: Hero Section */}
        <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-32 pb-32 overflow-hidden">

          <div className="absolute top-0 inset-x-0 h-[1000px] overflow-hidden pointer-events-none z-0">
            {/* Horizontal Orange/Saffron Band at the VERY top */}
            <div className="absolute top-0 left-0 right-0 h-[400px] opacity-40 blur-[80px]"
              style={{ background: 'linear-gradient(to bottom, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>

            {/* Massive Blue/Lavender Semicircle Glow centered at top */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[160vw] h-[1000px] opacity-35 blur-[120px] rounded-full"
              style={{ background: 'radial-gradient(50% 50% at 50% 0%, #D4C3FF 0%, rgba(212,195,255,0) 100%)' }}></div>

            {/* Focused Orange Center Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[350px] opacity-50 blur-[90px]"
              style={{ background: 'radial-gradient(50% 50% at 50% 0%, #FF9933 0%, rgba(255,153,51,0) 100%)' }}></div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUpVariant}
            className="max-w-4xl mx-auto flex flex-col items-center relative z-10"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-gray-950 mb-8 leading-[1.1] font-medium">
              AI for Content, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-orange-400">built for Creators.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-600 font-sans max-w-2xl mb-12 leading-relaxed">
              From engagement prediction to societal sentiment analysis — understand audience response at every level.
            </p>
            <Link href={isAuthenticated && user ? `/analyze/${user.userId || user.username}` : "/login"}>
              <CursorAwareButton variant="dark" className="group">
                <span className="flex items-center gap-3">
                  Analyze Content
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </CursorAwareButton>
            </Link>
          </motion.div>
        </section>

        {/* SECTION 2: Sticky Scroll Features (Refactored) */}
        <StickyDNASection />


        {/* SECTION 3: Our Vision for Bharat (Enhanced Design) */}
        <section className="py-40 px-6 bg-white relative overflow-hidden">
          {/* Background Grid Accent */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 0)', backgroundSize: '40px 40px' }} />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUpVariant}
                >
                  <div className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4">[VISION_STATEMENT_01]</div>
                  <h2 className="text-4xl md:text-6xl font-serif font-medium text-gray-950 mb-8 tracking-tighter leading-[1.1]">
                    Empowering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-orange-500">Pulse of Bharat</span> through Neural Intelligence
                  </h2>
                  <p className="text-xl text-gray-600 mb-16 leading-relaxed max-w-xl font-sans font-medium opacity-80">
                    Social Lens is architecting the foundational intelligence for India's digital renaissance. We are building state-of-the-art neural infrastructure to empower 100M+ creators with deep cultural nuances and semantic understanding.
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 gap-8">
                  {/* Hyper-Local Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2.5rem] bg-indigo-50/30 border border-indigo-100/50 backdrop-blur-sm relative group"
                  >
                    <div className="absolute top-4 right-6 text-[9px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Status: Deployed</div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-indigo-50">
                      <Globe className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-950 mb-3">Hyper-Local</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">Models trained on 22+ Indian languages and cultural contexts.</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-indigo-100/50 text-[8px] font-bold text-indigo-600 uppercase">Hinglish</span>
                      <span className="px-2 py-1 rounded bg-indigo-100/50 text-[8px] font-bold text-indigo-600 uppercase">Regional</span>
                    </div>
                  </motion.div>

                  {/* Creator Privacy Card */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 backdrop-blur-sm relative group"
                  >
                    <div className="absolute top-4 right-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest font-mono">Shield: E2EE</div>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                      <Shield className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-950 mb-3">Creator Privacy</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">End-to-end encryption for all your analyzed media assets.</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-gray-100 text-[8px] font-bold text-gray-500 uppercase">ISO:27001</span>
                      <span className="px-2 py-1 rounded bg-gray-100 text-[8px] font-bold text-gray-500 uppercase">SOC2</span>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="relative flex justify-center items-center py-20 lg:py-0">
                {/* Pulse of Bharat Visual */}
                <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
                  {/* Concentric Ripples */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-indigo-500/20"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 1.3,
                        ease: "easeOut"
                      }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ))}

                  {/* Main Hub */}
                  <div className="relative z-10 w-64 h-64 rounded-[4rem] bg-indigo-600/5 backdrop-blur-xl border border-indigo-100 shadow-3xl flex items-center justify-center group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-20"
                    >
                      <Heart className="w-24 h-24 text-indigo-600 drop-shadow-[0_0_15px_rgba(79,70,229,0.4)]" strokeWidth={1.5} />
                    </motion.div>
                    {/* Floating Nodes Visual */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-indigo-400" />
                      <div className="absolute bottom-20 right-10 w-3 h-3 rounded-full bg-indigo-500" />
                      <div className="absolute top-1/2 right-4 w-1.5 h-1.5 rounded-full bg-indigo-300" />
                    </div>
                  </div>

                  {/* Creators Served Badge - Fixed Floating Stat */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/50 z-30 max-w-[180px]"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</span>
                    </div>
                    <p className="text-4xl font-bold text-gray-950 tracking-tighter mb-1">1M+</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Creators Served</p>
                  </motion.div>

                  {/* Second Stat Badge */}
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    className="absolute -top-6 -right-6 bg-indigo-600 p-6 rounded-[2rem] shadow-2xl z-30 min-w-[140px]"
                  >
                    <p className="text-lg font-bold text-white/70 uppercase tracking-widest mb-1 text-center">Nodes</p>
                    <p className="text-3xl font-bold text-white tracking-tighter text-center">22+</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 4: The Societal Audit (Pro Analytics Redesign) */}
        <section className="py-40 px-6 bg-gray-50/20 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="text-center mb-24 relative"
            >
              {/* Technical Metadata & Status */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] opacity-60">[AUDIT_MODULE_ACTIVE_04]</div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Live Neural Feed</span>
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl font-serif font-medium text-gray-950 tracking-tighter leading-[1.1]">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Societal Audit</span>
              </h2>

              <p className="text-xl text-gray-500 mt-8 max-w-2xl mx-auto font-mono text-[10px] font-bold uppercase tracking-widest opacity-60">
                // System_Status: Synchronized_Demographics.v2 //
              </p>
            </motion.div>

            {/* BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">

              {/* Gen Z - Span 7 (Large Action Card) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="md:col-span-7 row-span-2 group relative rounded-[3rem] bg-white border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden p-12 flex flex-col justify-between hover:shadow-[0_40px_100px_rgba(79,70,229,0.08)] transition-all duration-700 hover:border-indigo-100"
              >
                {/* Heatmap Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <motion.div
                      whileHover={{ rotate: -10 }}
                      className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-200"
                    >
                      <Zap className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100 uppercase tracking-widest shadow-sm">Live Analysis</span>
                        <span className="px-3 py-1.5 rounded-full bg-white text-[10px] font-bold text-gray-400 border border-gray-100 uppercase tracking-widest shadow-sm">ID: SL-GZ-24</span>
                      </div>
                      <div className="text-[10px] font-mono text-indigo-400 font-bold animate-pulse tracking-tight">DATA FEED: ACTIVE</div>
                    </div>
                  </div>

                  <h3 className="text-5xl font-serif font-medium text-gray-950 mb-3 tracking-tight">Gen Z</h3>
                  <p className="text-indigo-600 font-medium text-xl mb-10">Target: Viral Peak • Age 12-27</p>

                  <p className="text-gray-600 text-2xl leading-relaxed max-w-lg mb-12">
                    Dominating the digital-first economy through <span className="text-gray-950 font-medium underline decoration-indigo-200 decoration-4 underline-offset-8">rapid paced visual metaphors</span> and high Hinglish fluidity.
                  </p>

                  <Sparkline points={[20, 50, 20, 65, 35, 75, 45, 85, 55, 95]} color="#4F46E5" />
                </div>

                <div className="relative z-10 grid grid-cols-3 gap-10">
                  {[
                    { label: "Viral Index", val: "94.8", unit: "%" },
                    { label: "Trend Decay", val: "4.2", unit: "hrs" },
                    { label: "Sentiment", val: "High", unit: "" }
                  ].map((stat, i) => (
                    <div key={i} className="group/stat">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2 group-hover/stat:text-indigo-500 transition-colors">{stat.label}</p>
                      <p className="text-3xl font-serif font-bold text-gray-950">{stat.val}<span className="text-sm font-sans text-gray-400 ml-1">{stat.unit}</span></p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Millennials - Span 5 (Tall Analytical Card) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-5 row-span-2 group relative rounded-[3rem] bg-white border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden p-12 flex flex-col justify-between hover:shadow-[0_40px_100px_rgba(245,158,11,0.08)] transition-all duration-700 hover:border-orange-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 rounded-2xl bg-orange-400 flex items-center justify-center shadow-xl shadow-orange-100"
                    >
                      <Users className="w-8 h-8 text-white" />
                    </motion.div>
                    <span className="px-3 py-1.5 rounded-full bg-orange-50 text-[10px] font-bold text-orange-600 border border-orange-100 uppercase tracking-widest">Affinity: 88.2%</span>
                  </div>

                  <h3 className="text-4xl font-serif font-medium text-gray-950 mb-2">Millennials</h3>
                  <p className="text-orange-500 font-medium text-lg mb-8 italic">Age 28-43</p>

                  <p className="text-gray-600 text-xl leading-relaxed mb-10">
                    Propelled by <span className="text-gray-950 font-medium">contextual depth</span> and values-driven storytelling across Hinglish and Regional dialects.
                  </p>

                  <Sparkline points={[30, 40, 35, 50, 45, 55, 50, 65, 60, 75]} color="#F59E0B" delay={0.4} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cultural Resonance</p>
                    <p className="text-2xl font-serif font-bold text-gray-950">High Fidelity</p>
                  </div>
                  <div className="w-full h-1.5 bg-orange-50 rounded-full overflow-hidden border border-orange-100/50">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "82%" }}
                      transition={{ duration: 2, delay: 0.8 }}
                      className="h-full bg-orange-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Boomers - Span 12 (Wide Data Card) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="md:col-span-12 row-span-1 group relative rounded-[3rem] bg-white border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden px-12 py-10 flex flex-col md:flex-row items-center justify-between hover:shadow-[0_40px_100px_rgba(16,185,129,0.08)] transition-all duration-700 hover:border-emerald-100"
              >
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                <div className="relative z-10 flex items-center gap-10 mb-8 md:mb-0">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-100 group-hover:rotate-6 transition-transform">
                    <Library className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-medium text-gray-950">Boomers</h3>
                    <p className="text-emerald-600 font-medium text-lg">Age 60-78</p>
                  </div>
                </div>

                <div className="relative z-10 flex-1 md:px-16 max-w-3xl text-center md:text-left">
                  <p className="text-gray-600 text-2xl font-serif leading-relaxed italic">
                    "Precision through <span className="text-gray-950 font-medium not-italic">informative structure</span> and cultural sanctity."
                  </p>
                </div>

                <div className="relative z-10 flex gap-12 items-center">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2">Clarity Index</p>
                    <p className="text-4xl font-bold text-gray-950">98<span className="text-lg text-gray-400 font-sans ml-0.5">.2</span></p>
                  </div>
                  <div className="h-12 w-[1px] bg-gray-100" />
                  <Sparkline points={[10, 20, 15, 25, 20, 30, 25, 30, 30, 40]} color="#10B981" delay={0.6} />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION 5: CTA Section */}
        <CTASection />
      </div>

      <div ref={footerRevealRef} className="h-[600px] pointer-events-none" />
      <Footer scrollProgress={footerRevealProgress} />
    </main>
  );
}