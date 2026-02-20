"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";
import { ArrowLeft, ChefHat, Camera, Plus, Trash2, Sailboat, Ship } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRecipes } from "@/hooks/useRecipes";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

export default function CookupPage() {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUserId(session.user.id);
            }
        };
        checkUser();
    }, []);

    const { addRecipe } = useRecipes(userId);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [steps, setSteps] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState("");
    const [currentStep, setCurrentStep] = useState("");
    const [recipeTitle, setRecipeTitle] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const addIngredient = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentInput.trim() && !ingredients.includes(currentInput.trim())) {
            setIngredients([...ingredients, currentInput.trim()]);
            setCurrentInput("");
        }
    };

    const addStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep.trim() && !steps.includes(currentStep.trim())) {
            setSteps([...steps, currentStep.trim()]);
            setCurrentStep("");
        }
    };

    const removeIngredient = (ing: string) => {
        setIngredients(ingredients.filter(i => i !== ing));
    };

    const removeStep = (step: string) => {
        setSteps(steps.filter(s => s !== step));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCookup = async () => {
        if (ingredients.length === 0 && steps.length === 0 && !imagePreview) return;

        setIsLoading(true);

        try {
            const res = await fetch('/api/format-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: recipeTitle,
                    ingredients,
                    steps
                })
            });

            if (!res.ok) throw new Error("API Fehler");

            const data = await res.json();

            const generatedTitle = data.title || recipeTitle || "Neues Rezept";
            const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(generatedTitle + " 3d cartoon style delicious food shiny vibrant colorful")}?width=1200&height=800&nologo=true`;

            const newRecipe = {
                id: `generated-${Date.now()}`,
                title: generatedTitle,
                image_url: imagePreview || aiImageUrl,
                ingredients: data.ingredients || ingredients.map(i => ({ amount: "1 Portion", item: i })),
                steps: data.steps || steps,
                creator_id: userId || undefined
            };

            setRecipe(newRecipe);
            addRecipe(newRecipe);
        } catch (error) {
            console.error(error);
            const fallbackTitle = recipeTitle || "Nautischer Eintopf";
            const fallbackImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackTitle + " 3d cartoon style delicious food shiny vibrant colorful")}?width=1200&height=800&nologo=true`;
            const fallbackRecipe = {
                id: `generated-${Date.now()}`,
                title: fallbackTitle,
                image_url: imagePreview || fallbackImageUrl,
                ingredients: ingredients.map(i => ({ amount: "1 Portion", item: i })),
                steps: steps.length > 0 ? steps : ["Zubereitung fehlt."],
                creator_id: userId || undefined
            };
            // Fallback
            setRecipe(fallbackRecipe);
            addRecipe(fallbackRecipe);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[-1]">
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-coral-red/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-marine-500/20 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="w-full max-w-5xl mx-auto flex items-center justify-between mb-8 z-10">
                <Link href="/">
                    <ChunkyButton variant="nav" size="sm" className="gap-2">
                        <ArrowLeft className="w-5 h-5" /> Zurück zum Deck
                    </ChunkyButton>
                </Link>
                <div className="text-xl font-bold text-coral-red flex items-center gap-2">
                    <ChefHat className="w-6 h-6" />
                    Kombüse
                </div>
            </header>

            <div className="flex-1 flex flex-col items-center z-10 w-full max-w-5xl mx-auto">
                <AnimatePresence mode="wait">
                    {!isLoading && !recipe ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl"
                        >
                            <TreasureCard variant="wood" className="p-8">
                                <h2 className="text-3xl font-black text-gold-500 text-glow-gold uppercase tracking-wider mb-2">Neues Rezept Eintragen</h2>
                                <p className="text-gold-100 mb-8 font-bold">Trag deine Zutaten und grobe Schritte ein. Wir formatieren und standardisieren das Rezept automatisch für dein Logbuch.</p>

                                {/* Title Input */}
                                <div className="mb-6">
                                    <label className="block text-gold-300 font-bold uppercase mb-2">Titel (Optional)</label>
                                    <input
                                        type="text"
                                        value={recipeTitle}
                                        onChange={(e) => setRecipeTitle(e.target.value)}
                                        placeholder="Z.B. Omas Fischsuppe"
                                        className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl px-4 py-4 text-white placeholder-gold-700 focus:outline-none focus:border-gold-500 transition font-bold"
                                    />
                                </div>

                                {/* Form */}
                                <label className="block text-gold-300 font-bold uppercase mb-2">Zutaten (Stichpunkte reichen)</label>
                                <form onSubmit={addIngredient} className="relative mb-4">
                                    <input
                                        type="text"
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        placeholder="Z.B. Kartoffeln, Möhren, Altes Brot..."
                                        className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl px-4 py-4 pr-12 text-white placeholder-gold-700 focus:outline-none focus:border-gold-500 transition font-bold"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:text-gold-300 transition shrink-0"
                                    >
                                        <Plus className="w-8 h-8 font-black" />
                                    </button>
                                </form>

                                {/* Ingredients List */}
                                <div className="flex flex-wrap gap-2 mb-8 min-h-[40px]">
                                    <AnimatePresence>
                                        {ingredients.map((ing) => (
                                            <motion.span
                                                key={`ing-${ing}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-ruby-900 border-2 border-gold-900 rounded-full text-sm font-bold text-gold-100 shadow-sm"
                                            >
                                                {ing}
                                                <button onClick={() => removeIngredient(ing)} className="text-gold-500 hover:text-ruby-500 transition border-l border-gold-900/50 pl-2 ml-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Steps Form */}
                                <label className="block text-gold-300 font-bold uppercase mb-2">Ablauf (Grobe Schritte)</label>
                                <form onSubmit={addStep} className="relative mb-4">
                                    <input
                                        type="text"
                                        value={currentStep}
                                        onChange={(e) => setCurrentStep(e.target.value)}
                                        placeholder="Z.B. Alles in einen Topf werfen..."
                                        className="w-full bg-treasure-wood-dark border-4 border-gold-900 rounded-xl px-4 py-4 pr-12 text-white placeholder-gold-700 focus:outline-none focus:border-gold-500 transition font-bold"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gold-500 hover:text-gold-300 transition shrink-0"
                                    >
                                        <Plus className="w-8 h-8 font-black" />
                                    </button>
                                </form>

                                {/* Steps List */}
                                <div className="flex flex-col gap-2 mb-8 min-h-[40px]">
                                    <AnimatePresence>
                                        {steps.map((step, idx) => (
                                            <motion.div
                                                key={`step-${idx}-${step}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-start gap-3 bg-treasure-wood-dark p-3 rounded-xl border-2 border-gold-900"
                                            >
                                                <span className="text-gold-500 font-black mt-0.5">{idx + 1}.</span>
                                                <span className="flex-1 text-gold-100 font-bold text-sm">{step}</span>
                                                <button onClick={() => removeStep(step)} className="text-gold-500 hover:text-ruby-500 transition mt-0.5">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Image Upload */}
                                <div className="mb-8 p-6 border-4 border-dashed border-gold-900 rounded-xl bg-treasure-wood-dark text-center relative hover:border-gold-500 transition font-bold">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {imagePreview ? (
                                        <div className="flex flex-col items-center">
                                            <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2 shadow-md" />
                                            <span className="text-sail-gray text-sm">Bild ändern</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-marine-400">
                                            <Camera className="w-8 h-8 mb-2" />
                                            <p>Füge noch ein Foto vom fertigen Gericht (oder den Zutaten) hinzu!</p>
                                            <p className="text-xs uppercase tracking-widest mt-1 opacity-70">KI-Sicht aktivieren</p>
                                        </div>
                                    )}
                                </div>

                                <ChunkyButton
                                    size="lg"
                                    className="w-full"
                                    onClick={handleCookup}
                                    disabled={ingredients.length === 0 && steps.length === 0 && !imagePreview}
                                >
                                    <Ship className="w-8 h-8" />
                                    Rezept speichern & formatieren
                                </ChunkyButton>
                            </TreasureCard>
                        </motion.div>
                    ) : isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center justify-center py-20 translate-y-20 relative"
                        >
                            <div className="absolute inset-0 bg-marine-500/10 rounded-full blur-3xl animate-pulse" />
                            <motion.div
                                animate={{ rotate: [-5, 5, -5], y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sailboat className="w-24 h-24 text-brass-400 opacity-90" />
                            </motion.div>
                            <h3 className="mt-8 text-xl font-bold text-white tracking-widest uppercase mb-2">Rezept wird formatiert...</h3>
                            <p className="text-gold-300 text-center max-w-sm font-bold">Automatische Ergänzung von Mengenangaben und Standardschritten im Hintergrund.</p>
                        </motion.div>
                    ) : recipe ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full relative"
                        >
                            <button
                                onClick={() => setRecipe(null)}
                                className="absolute -top-12 left-0 text-sail-gray hover:text-white transition flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Neues Rezept
                            </button>
                            <RecipeCard
                                recipe={recipe}
                                showActions={true}
                                currentUserId={userId || undefined}
                                onEdit={setRecipe}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </main>
    );
}
