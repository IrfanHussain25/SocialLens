"use client";

import React, { useRef, useState } from "react";

/**
 * A reusable button component that tracks cursor movement to create a 
 * dynamic radial gradient (glow) effect.
 */
export function CursorAwareButton({
    children,
    variant = 'light', // 'light' or 'dark'
    className = '',
    onClick,
    ...props
}) {
    const buttonRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setStyle({
            '--x': `${x}px`,
            '--y': `${y}px`,
        });
    };

    const baseStyles = "relative overflow-hidden transition-all duration-300 group";

    const variants = {
        light: "px-6 py-2.5 rounded-full text-sm font-serif font-medium border border-black/10 bg-white text-[#111827] hover:border-black/20",
        dark: "px-10 py-5 rounded-full text-lg font-serif font-medium bg-[#111827] text-white shadow-xl hover:shadow-2xl",
    };

    const glowColors = {
        light: "radial-gradient(circle at var(--x) var(--y), rgba(249, 115, 22, 0.1) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)",
        dark: `
            radial-gradient(circle 150px at calc(var(--x) - 40px) var(--y), rgba(74, 84, 166, 0.25), transparent),
            radial-gradient(circle 150px at calc(var(--x) + 40px) var(--y), rgba(229, 181, 109, 0.25), transparent)
        `,
    };

    const hoverGlowColors = {
        light: "radial-gradient(circle at var(--x) var(--y), rgba(249, 115, 22, 0.2) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%)",
        dark: `
            radial-gradient(circle 200px at calc(var(--x) - 60px) var(--y), rgba(74, 84, 166, 0.45), transparent),
            radial-gradient(circle 200px at calc(var(--x) + 60px) var(--y), rgba(229, 181, 109, 0.45), transparent),
            radial-gradient(circle 100px at var(--x) var(--y), rgba(255, 255, 255, 0.15), transparent)
        `,
    };

    return (
        <button
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={style}
            {...props}
        >
            {/* Background Glow Layer */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                    background: style['--x'] ? hoverGlowColors[variant] : 'none',
                }}
            />

            {/* Subtle Idle Glow Layer */}
            <div
                className="absolute inset-0 opacity-100 pointer-events-none"
                style={{
                    background: style['--x'] ? glowColors[variant] : 'none',
                }}
            />

            <span className="relative z-10">
                {children}
            </span>
        </button>
    );
}
