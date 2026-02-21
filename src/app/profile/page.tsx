"use client";

import { motion } from "framer-motion";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { ArrowLeft, BookOpen, LogOut, Ship } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { useRecipes } from "@/hooks/useRecipes";

export default function ProfilePage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { recipes, isLoaded: recipesLoaded, updateRecipe, deleteRecipe } = useRecipes(userId, userEmail);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setUserId(session.user.id);
                setUserEmail(session.user.email || null);
            }
        };
        checkUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    // Only show recipes that the user created themselves
    const myRecipes = recipes.filter(r => r.creator_id === userId);

    const handleDelete = (id: string) => {
        deleteRecipe(id);
    };

    const handleFavorite = (id: string, isFav: boolean) => {
        const target = recipes.find(r => r.id === id);
        if (target) {
            updateRecipe({ ...target, is_favorite: isFav });
        }
    };

    const handleEdit = (updatedRecipe: Recipe) => {
        updateRecipe(updatedRecipe);
    };

    if (!userId || !recipesLoaded) {
        return (
            <main className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-ruby-900">
                <TreasureCard variant="wood" className="w-full max-w-sm flex flex-col items-center justify-center py-12 animate-pulse border-4 border-gold-900">
                    <Ship className="w-16 h-16 text-gold-500 mb-4 animate-bounce" />
                    <h2 className="text-2xl font-black text-gold-300 uppercase tracking-widest text-center">Setze Segel...</h2>
                    <p className="text-gold-100/50 mt-2 font-bold text-sm">Logbuch wird geladen</p>
                </TreasureCard>
            </main>
        );
    } return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden bg-ruby-900">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-gold-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Header */}
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-12 z-10">
                <Link href="/">
                    <ChunkyButton variant="nav" size="sm" className="gap-2">
                        <ArrowLeft className="w-5 h-5" /> Zurück zum Deck
                    </ChunkyButton>
                </Link>

                <div className="flex flex-col items-end">
                    <p className="text-gold-300 font-bold uppercase tracking-widest text-sm mb-6">{userEmail}</p>
                    <ChunkyButton variant="secondary" size="lg" className="gap-2 mb-4 w-full justify-center" onClick={handleLogout}>
                        <LogOut className="w-5 h-5 text-white" /> Logout
                    </ChunkyButton>
                </div>
            </header>

            <div className="flex-1 w-full max-w-5xl mx-auto z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-black text-gold-500 text-glow-gold flex items-center gap-3 uppercase tracking-wider drop-shadow-lg">
                        <BookOpen className="w-10 h-10 text-gold-500" />
                        Captains Logbuch
                    </h1>
                    <p className="text-gold-100 font-bold mt-2 text-lg">Willkommen in deiner Kajüte. Hier sind all deine eigenen Geheimrezepte sicher verwahrt.</p>
                </motion.div>

                {myRecipes.length === 0 ? (
                    <TreasureCard variant="wood" className="p-12 text-center max-w-lg mx-auto mt-20">
                        <BookOpen className="w-20 h-20 text-gold-700 mx-auto mb-4 opacity-50 drop-shadow-md" />
                        <h3 className="text-3xl font-black text-gold-500 mb-2 uppercase tracking-wide">Logbuch ist leer</h3>
                        <p className="text-white font-bold mb-8">Du hast noch keine eigenen Rezepte gekocht. Ab in die Magische Kombüse!</p>
                        <Link href="/cookup">
                            <ChunkyButton size="lg">Zur Kombüse</ChunkyButton>
                        </Link>
                    </TreasureCard>
                ) : (
                    <div className="grid grid-cols-1 gap-12 pb-20">
                        {myRecipes.map((recipe) => (
                            <motion.div key={recipe.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    currentUserId={userId}
                                    onFavorite={handleFavorite}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                    showActions={true}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
