"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const [beams, setBeams] = useState<{ x: number; y: number; duration: number; delay: number; width: number; top: number; left: number; rotation: number }[]>([]);
    const [staticBeams, setStaticBeams] = useState<{ width: number; height: number; top: number; left: number; rotation: number; opacity: number }[]>([]);

    useEffect(() => {
        // Generate random beams on client side only to avoid hydration mismatch
        const newBeams = Array.from({ length: 20 }).map(() => ({
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 10,
            width: Math.random() * 600 + 400,
            top: Math.random() * 100,
            left: Math.random() * 100,
            rotation: Math.random() * 360,
        }));
        setBeams(newBeams);

        const newStaticBeams = Array.from({ length: 5 }).map(() => ({
            width: Math.random() * 1000 + 1000,
            height: 1,
            top: Math.random() * 100,
            left: Math.random() * 100,
            rotation: -45,
            opacity: 0.3
        }));
        setStaticBeams(newStaticBeams);
    }, []);

    return (
        <div
            className={cn(
                "absolute top-0 left-0 w-full h-full overflow-hidden bg-neutral-950 flex flex-col items-center justify-center antialiased",
                className
            )}
        >
            <div className="absolute inset-0 bg-transparent z-0 pointer-events-none flex items-center justify-center">
                <div
                    style={{
                        transform: "translateY(-350px) rotate(-45deg)",
                        width: "100%",
                        height: "100%",
                    }}
                    className="relative w-full h-full opacity-20"
                >
                    {/* Generates beams */}
                    {beams.map((beam, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: beam.x,
                                y: beam.y,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: beam.x, // randomized end position - for simplicity keeping start/end same roughly or simpler animation
                                y: beam.y,
                            }}
                            transition={{
                                duration: beam.duration,
                                repeat: Infinity,
                                delay: beam.delay,
                                ease: "easeInOut",
                            }}
                            style={{
                                background: `linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)`,
                                width: beam.width + "px",
                                height: "1px",
                                position: "absolute",
                                top: beam.top + "%",
                                left: beam.left + "%",
                                transform: `rotate(${beam.rotation}deg)`,
                            }}
                        />
                    ))}
                    {/* Static Beams for depth */}
                    {staticBeams.map((beam, i) => (
                        <div
                            key={`static-${i}`}
                            style={{
                                background: `linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 100%)`,
                                width: beam.width + "px",
                                height: "1px",
                                position: "absolute",
                                top: beam.top + "%",
                                left: beam.left + "%",
                                transform: `rotate(${beam.rotation}deg)`,
                                opacity: beam.opacity
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Radial Gradient to fade out edges */}
            <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

        </div>
    );
};
