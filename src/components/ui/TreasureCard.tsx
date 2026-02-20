import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface TreasureCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
    className?: string;
    variant?: "gold" | "wood";
    children?: React.ReactNode;
}

export const TreasureCard = React.forwardRef<HTMLDivElement, TreasureCardProps>(
    ({ className, variant = "wood", children, ...props }, ref) => {

        const variants = {
            gold: "bg-gradient-to-br from-gold-300 to-gold-500 border-chunky-gold",
            wood: "bg-gradient-to-br from-treasure-wood to-treasure-wood-dark border-chunky-wood text-gold-100",
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", bounce: 0.6, duration: 0.6 }}
                className={cn(
                    "rounded-3xl p-6 relative overflow-hidden",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {/* Shiny overlay effect for gold variant */}
                {variant === "gold" && (
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-70" />
                )}

                <div className="relative z-10">
                    {children}
                </div>
            </motion.div>
        );
    }
);

TreasureCard.displayName = "TreasureCard";
