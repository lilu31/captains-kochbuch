"use client";

import { motion } from "framer-motion";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ArrowLeft, Anchor, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1] bg-ruby-900">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-500/10 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-ruby-700/50 rounded-full blur-3xl" />
            </div>

            <header className="absolute top-8 left-8 z-10">
                <Link href="/">
                    <ChunkyButton variant="nav" size="sm" className="gap-2">
                        <ArrowLeft className="w-5 h-5" /> Zurück zum Deck
                    </ChunkyButton>
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <TreasureCard variant="wood" className="p-8 text-center border-4 border-gold-900">
                    <Anchor className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-black text-gold-500 text-glow-gold uppercase tracking-wider mb-2">Meine Kajüte</h1>
                    <p className="text-gold-100 mb-8 font-bold">Logbuch-Eintrag erforderlich. Tritt ein und speichere deine besten Rezepte.</p>

                    <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-bold text-gold-300 mb-1 ml-1 uppercase">Flaschenpost-Adresse</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-700" />
                                <input
                                    type="email"
                                    placeholder="matrose@meer.de"
                                    className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gold-300 mb-1 ml-1 uppercase">Geheimcode</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-700" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link href="/profile">
                                <ChunkyButton size="lg" className="w-full">Luke öffnen</ChunkyButton>
                            </Link>
                        </div>
                    </form>

                    <div className="mt-6 text-sm text-gold-300 font-bold">
                        Neuer Matrose? <a href="#" className="flex-1 text-gold-500 font-black hover:underline uppercase tracking-wide">Heuere hier an.</a>
                    </div>
                </TreasureCard>
            </motion.div>
        </main>
    );
}
