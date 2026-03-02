"use client";

import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { CursorAwareButton } from "../CursorAwareButton";

export function CTASection() {
    return (
        <section className="px-6 py-40 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#C7D2FE] border border-white/5 min-h-[600px] flex flex-col items-center justify-center text-center p-12 group shadow-2xl">
                    
                    {/* The Radiating Globe Pattern */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden translate-y-1/2">
                        {[...Array(6)].map((_, i) => (
                            <div 
                                key={i}
                                className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full border border-white/20"
                                style={{ 
                                    width: `${(i + 1) * 20}%`, 
                                    aspectRatio: '1/1',
                                    transform: `translateX(-50%) translateY(${(i) * 10}px)`
                                }}
                            />
                        ))}
                    </div>

                    {/* Top Glow Overlay */}
                    <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-8 shadow-xl"
                        >
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor">
                                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                            </svg>
                        </motion.div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-medium text-white mb-10 max-w-4xl leading-[1.1] tracking-[-0.03em]">
                            Build the future of India's AI <br/> with Social Lens.
                        </h2>
                        
                        <button className="px-10 py-4 rounded-full bg-white/20 backdrop-blur-2xl border border-white/30 text-white font-sans font-semibold text-lg hover:bg-white/30 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 group">
                            <span className="flex items-center gap-2">
                                Get Started Now
                                <motion.span 
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 5 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    →
                                </motion.span>
                            </span>
                        </button>
                    </div>

                    {/* Bottom Arched Glow */}
                    <div className="absolute bottom-0 inset-x-0 h-32 bg-white/20 blur-[60px] translate-y-1/2 rounded-full pointer-events-none" />
                </div>
            </div>
        </section>
    );
}

export function Footer({ scrollProgress }) {
    // Transform scroll progress into expansion values
    const glowScale = useTransform(scrollProgress, [0, 1], [0.8, 1.2]);
    const glowOpacity = useTransform(scrollProgress, [0, 1], [0, 0.4]);

    const sections = [
        {
            title: "PRODUCTS",
            links: ["Content Analyzer", "Demographic Insights", "Trend Tracker", "API Access"]
        },
        {
            title: "API",
            links: ["Documentation", "System Status", "Pricing", "Support"]
        },
        {
            title: "COMPANY",
            links: ["About Us", "Careers", "Contact", "Privacy Policy"]
        },
        {
            title: "SOCIALS",
            links: ["LinkedIn", "X (Twitter)", "YouTube", "Discord"]
        }
    ];

    return (
        <footer className="fixed bottom-0 left-0 w-full h-[600px] z-0 bg-white pt-20 pb-32 overflow-hidden">
            {/* Bottom Page Gradient Glow - Animated Expansion */}
            <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[300px] pointer-events-none transform-gpu backface-visibility-hidden"
                style={{ 
                    scale: glowScale,
                    opacity: glowOpacity
                }}
            >
                <div className="absolute bottom-[-150px] left-0 w-full h-[300px] blur-[120px]" 
                    style={{ background: 'linear-gradient(90deg, #4F46E5 0%, #F59E0B 50%, #10B981 100%)' }} />
            </motion.div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
                    {/* Logo & Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="text-3xl font-bold tracking-tight text-gray-950 mb-4 block">
                            Social Lens
                        </Link>
                        <p className="text-gray-500 max-w-xs text-sm leading-relaxed mb-8">
                            Empowering Indian creators with multimodal AI insights. Bharat-First content analysis at scale.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-12 h-8 border border-gray-200 rounded flex items-center justify-center grayscale opacity-50 font-bold text-[10px]">ISO:27001</div>
                            <div className="w-12 h-8 border border-gray-200 rounded flex items-center justify-center grayscale opacity-50 font-bold text-[10px]">SOC 2 TYPE 1</div>
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] mb-6">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] text-gray-400 font-medium">
                    <p>© 2026 Social Lens. All rights reserved.</p>
                    <p>Designed with ❤️ for India.</p>
                </div>
            </div>
        </footer>
    );
}
