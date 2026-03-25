import React from "react";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  showText?: boolean;
}

export default function Logo({ className = "", variant = "dark", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className={`text-xl font-display font-bold tracking-tight leading-none ${variant === "dark" ? "text-brand-dark" : "text-white"}`}>
            mivada
          </span>
        </div>
      )}
    </div>
  );
}
