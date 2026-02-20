"use client";

import { motion } from "framer-motion";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { ArrowLeft, BookOpen, LogOut } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock saved recipe
const SAVED_RECIPE: Recipe = {
    id: "fav-1",
    title: "Kartoffeln mit Spinat und Spiegelei",
    image_url: "https://images.unsplash.com/photo-1525548002014-e18135d814d7?q=80&w=1200",
    is_favorite: true,
    creator_id: "user-1",
    ingredients: [
        { amount: "500g", item: "Kartoffeln" },
        { amount: "300g", item: "Blattspinat" },
        { amount: "2", item: "Eier" },
        { amount: "1 Prise", item: "Muskatnuss" }
    ],
    steps: [
        "Kartoffeln schälen und in Salzwasser kochen, bis sie weich sind.",
        "Spinat in einer Pfanne andünsten und mit Salz, Pfeffer und einer Prise Muskatnuss abschmecken.",
        "In der Zwischenzeit die Spiegeleier in einer separaten Pfanne braten.",
        "Kartoffeln, Spinat und Spiegeleier zusammen auf einem Teller anrichten und servieren."
    ]
};

export default function ProfilePage() {
    const MOCK_CURRENT_USER_ID = "user-1";
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([SAVED_RECIPE]);

    const handleDelete = (id: string) => {
        setSavedRecipes(savedRecipes.filter(r => r.id !== id));
    };

    const handleFavorite = (id: string, isFav: boolean) => {
        setSavedRecipes(savedRecipes.map(r => r.id === id ? { ...r, is_favorite: isFav } : r));
    };

    const handleEdit = (updatedRecipe: Recipe) => {
        setSavedRecipes(savedRecipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    };

    return (
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

                <Link href="/">
                    <ChunkyButton variant="danger" size="sm" className="gap-2">
                        Logbuch schließen <LogOut className="w-4 h-4 ml-1" />
                    </ChunkyButton>
                </Link>
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
                    <p className="text-gold-100 font-bold mt-2 text-lg">Willkommen in deiner Kajüte. Hier sind all deine gespeicherten Geheimrezepte sicher verwahrt.</p>
                </motion.div>

                {savedRecipes.length === 0 ? (
                    <TreasureCard variant="wood" className="p-12 text-center max-w-lg mx-auto mt-20">
                        <BookOpen className="w-20 h-20 text-gold-700 mx-auto mb-4 opacity-50 drop-shadow-md" />
                        <h3 className="text-3xl font-black text-gold-500 mb-2 uppercase tracking-wide">Logbuch ist leer</h3>
                        <p className="text-white font-bold mb-8">Du hast noch keine Rezepte gespeichert. Ab in die Magische Kombüse!</p>
                        <Link href="/cookup">
                            <ChunkyButton size="lg">Zur Kombüse</ChunkyButton>
                        </Link>
                    </TreasureCard>
                ) : (
                    <div className="grid grid-cols-1 gap-12 pb-20">
                        {savedRecipes.map(recipe => (
                            <motion.div key={recipe.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <RecipeCard
                                    recipe={recipe}
                                    showActions={true}
                                    currentUserId={MOCK_CURRENT_USER_ID}
                                    onFavorite={handleFavorite}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
