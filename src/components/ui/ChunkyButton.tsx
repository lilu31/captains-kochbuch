import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface ChunkyButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: "primary" | "secondary" | "danger" | "nav";
    size?: "sm" | "md" | "lg" | "icon";
    children?: React.ReactNode;
}

export const ChunkyButton = React.forwardRef<HTMLButtonElement, ChunkyButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {

        // Vibrant Coin Master style buttons:
        // Solid colors, thick darker bottom border (box-shadow or literal border), white text shadow if bright, etc.
        const variants = {
            primary: "bg-gold-500 hover:bg-gold-300 text-ruby-900 border-b-4 border-gold-900 shadow-lg text-glow-gold rounded-full font-black uppercase tracking-wider",
            secondary: "bg-sky-500 hover:bg-sky-200 text-white border-b-4 border-sky-700 shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] rounded-full font-black uppercase tracking-wider",
            danger: "bg-ruby-500 hover:bg-ruby-300 text-white border-b-4 border-ruby-900 shadow-lg rounded-full font-black uppercase tracking-wider",
            nav: "bg-treasure-wood hover:bg-gold-700 text-gold-100 border-b-4 border-treasure-wood-dark shadow-md rounded-2xl font-bold",
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-lg",
            lg: "px-8 py-4 text-2xl",
            icon: "p-4 text-2xl",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95, y: 2 }} // Push down effect matching the chunky border
                className={cn(
                    "relative inline-flex items-center justify-center transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:border-b-0 active:translate-y-[4px]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                <span className="flex items-center justify-center gap-2 drop-shadow-md">
                    {children}
                </span>
            </motion.button>
        );
    }
);

ChunkyButton.displayName = "ChunkyButton";
