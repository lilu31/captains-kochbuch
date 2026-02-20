"use client";

import { motion } from "framer-motion";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ArrowLeft, Anchor, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError("Bitte fülle alle Felder aus.");
            return;
        }

        setLoading(true);
        setError(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                // Try to log them in immediately after signup
                const { error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (loginError) {
                    setError("Konto erstellt! Bitte logge dich ein.");
                    setIsSignUp(false);
                    setLoading(false);
                } else {
                    router.push('/profile');
                }
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                router.push('/profile');
            }
        }
    };

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
                    <p className="text-gold-100 mb-8 font-bold">
                        {isSignUp ? "Registriere dich als neuer Matrose, um Rezepte zu speichern." : "Logbuch-Eintrag erforderlich. Tritt ein und speichere deine besten Rezepte."}
                    </p>

                    {error && (
                        <div className="bg-coral-red/20 border-2 border-coral-red text-white p-3 rounded-lg mb-6 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4 text-left" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-bold text-gold-300 mb-1 ml-1 uppercase">Flaschenpost-Adresse</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-700" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-gold-500 transition font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <ChunkyButton type="submit" size="lg" className="w-full" disabled={loading}>
                                {loading ? "Lädt..." : (isSignUp ? "Anheuern" : "Luke öffnen")}
                            </ChunkyButton>
                        </div>
                    </form>

                    <div className="mt-6 text-sm text-gold-300 font-bold">
                        {isSignUp ? "Schon an Bord?" : "Neuer Matrose?"} <button onClick={() => setIsSignUp(!isSignUp)} disabled={loading} className="flex-1 text-gold-500 font-black hover:underline uppercase tracking-wide">{isSignUp ? "Logbuch aufschlagen" : "Heuere hier an."}</button>
                    </div>
                </TreasureCard>
            </motion.div>
        </main>
    );
}
