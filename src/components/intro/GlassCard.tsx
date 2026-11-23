"use client";

import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({
  children,
  className = "",
}: GlassCardProps) {
  return (
    <div className={`glass-card ${className}`}>
      <div className="glass-card-highlight" />
      <div className="glass-card-content">
        {children}
      </div>
    </div>
  );
}
