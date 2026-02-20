import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface NauticalButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

export const NauticalButton = React.forwardRef<HTMLButtonElement, NauticalButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {

        const variants = {
            primary: "bg-brass-500 hover:bg-brass-400 text-marine-900 border border-brass-400/50 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] font-bold",
            secondary: "bg-marine-700 hover:bg-marine-600 text-sail-white border border-marine-500",
            ghost: "bg-transparent hover:bg-white/10 text-sail-white border border-transparent",
            danger: "bg-coral-red/80 hover:bg-coral-red text-white border border-coral-red/50",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm rounded-lg",
            md: "px-5 py-2.5 text-base rounded-xl",
            lg: "px-8 py-4 text-lg rounded-2xl",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brass-400 focus:ring-offset-2 focus:ring-offset-marine-900 disabled:opacity-50 disabled:pointer-events-none",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

NauticalButton.displayName = "NauticalButton";
