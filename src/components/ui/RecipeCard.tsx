import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { TreasureCard } from "./TreasureCard";
import { Clock, ChefHat, Anchor, Heart, Trash2, Edit2, Save, X, Camera, RefreshCw, Plus, GripVertical, Leaf } from "lucide-react";
import { ChunkyButton } from "./ChunkyButton";

export interface Recipe {
    id: string;
    title: string;
    ingredients: { amount: string; item: string }[];
    steps: string[];
    image_url: string;
    portions?: number;
    is_favorite?: boolean;
    creator_id?: string;
    author_email?: string;
    is_system_recipe?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
}

interface RecipeCardProps {
    recipe: Recipe;
    currentUserId?: string;
    onFavorite?: (id: string, isFavorite: boolean) => void;
    onDelete?: (id: string) => void;
    onEdit?: (updatedRecipe: Recipe) => void;
    showActions?: boolean;
}

export function RecipeCard({ recipe, currentUserId, onFavorite, onDelete, onEdit, showActions = false }: RecipeCardProps) {
    const isCreator = currentUserId && recipe.creator_id === currentUserId;
    const [isEditing, setIsEditing] = useState(false);

    // Edit state
    const [editTitle, setEditTitle] = useState(recipe.title);
    const [editIngredients, setEditIngredients] = useState([...recipe.ingredients]);
    const [editSteps, setEditSteps] = useState([...recipe.steps]);
    const [editImageUrl, setEditImageUrl] = useState(recipe.image_url);
    const [editPortions, setEditPortions] = useState(recipe.portions || 4);
    const [editVeg, setEditVeg] = useState(recipe.is_vegetarian || false);
    const [editVegan, setEditVegan] = useState(recipe.is_vegan || false);

    // Portions state (for viewing)
    const originalPortions = recipe.portions || 4;
    const [viewPortions, setViewPortions] = useState(originalPortions);
    const portionMultiplier = viewPortions / originalPortions;

    // Helper to scale ingredient amounts
    const scaleAmount = (amountStr: string, multiplier: number) => {
        if (multiplier === 1) return amountStr;

        // Match numbers (including decimals/fractions if possible, but keep it simple for now)
        return amountStr.replace(/(\d+(?:[.,]\d+)?)/g, (match) => {
            const num = parseFloat(match.replace(',', '.'));
            if (isNaN(num)) return match;

            const scaled = num * multiplier;
            // Format cleanly (no trailing zeros, max 2 decimals)
            return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(2).replace('.', ',');
        });
    };

    // Track image loading state to show spinner for slow AI generation
    const currentDisplayImage = isEditing ? editImageUrl : (recipe.image_url || 'https://images.unsplash.com/photo-1548811579-017fc2a7ea68?q=80&w=1200');
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (onEdit) {
            onEdit({
                ...recipe,
                title: editTitle,
                ingredients: editIngredients,
                steps: editSteps,
                image_url: editImageUrl,
                portions: editPortions,
                is_vegetarian: editVeg,
                is_vegan: editVegan
            });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(recipe.title);
        setEditIngredients([...recipe.ingredients]);
        setEditSteps([...recipe.steps]);
        setEditImageUrl(recipe.image_url);
        setIsEditing(false);
    };

    const updateIngredient = (index: number, field: 'amount' | 'item', value: string) => {
        const newIngs = [...editIngredients];
        newIngs[index] = { ...newIngs[index], [field]: value };
        setEditIngredients(newIngs);
    };

    const updateStep = (index: number, value: string) => {
        const newSteps = [...editSteps];
        newSteps[index] = value;
        setEditSteps(newSteps);
    };

    const addEditIngredient = () => {
        setEditIngredients([...editIngredients, { amount: "", item: "" }]);
    };

    const removeEditIngredient = (index: number) => {
        setEditIngredients(editIngredients.filter((_, idx) => idx !== index));
    };

    const addEditStep = () => {
        setEditSteps([...editSteps, ""]);
    };

    const removeEditStep = (index: number) => {
        setEditSteps(editSteps.filter((_, idx) => idx !== index));
    };

    return (
        <TreasureCard variant="wood" className="max-w-3xl w-full mx-auto p-0 overflow-hidden relative border-4 border-gold-900">
            {/* Header Image */}
            <div className="w-full h-80 md:h-[450px] relative border-b-4 border-gold-900 overflow-hidden bg-treasure-wood-dark">
                {currentDisplayImage && (
                    <Image
                        src={currentDisplayImage}
                        alt={recipe.title}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 768px) 100vw, 768px"
                        priority
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                    />
                )}
                {!imageLoaded && currentDisplayImage && (
                    <div className="absolute inset-0 bg-treasure-wood-dark/50 animate-pulse" />
                )}

                {!imageLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-treasure-wood-dark">
                        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mb-2" />
                        <span className="text-gold-300 font-bold uppercase tracking-widest text-xs">Malt Bild...</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-ruby-900 via-transparent to-transparent opacity-90" />

                {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10 transition">
                        <label className="cursor-pointer p-4 bg-black/60 border-2 border-gold-500 rounded-xl text-gold-300 hover:text-white hover:bg-black/80 transition flex flex-col items-center">
                            <Camera className="w-8 h-8 mb-2" />
                            <span className="font-bold">Bild Ändern</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                )}

                {showActions && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        {isCreator && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-3 rounded-xl bg-black/50 backdrop-blur-md border-2 border-sky-500 hover:bg-black/70 transition transform hover:scale-110 active:scale-95 text-sky-400"
                            >
                                <Edit2 className="w-6 h-6" />
                            </button>
                        )}
                        <button
                            onClick={() => onFavorite?.(recipe.id, !recipe.is_favorite)}
                            className="p-3 rounded-xl bg-black/50 backdrop-blur-md border-2 border-gold-500 hover:bg-black/70 transition transform hover:scale-110 active:scale-95"
                        >
                            <Heart className={`w-6 h-6 ${recipe.is_favorite ? 'text-gold-500 fill-gold-500 text-glow-gold' : 'text-gold-100'}`} />
                        </button>
                    </div>
                )}

                <div className="absolute bottom-6 left-6 right-6">
                    {isEditing ? (
                        <div className="flex flex-col gap-3 mb-2">
                            <input
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="text-3xl md:text-4xl font-black text-white bg-black/60 border-2 border-gold-500 rounded-lg p-2 w-full focus:outline-none focus:border-gold-300 shadow-inner"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 mb-2">
                            {(recipe.is_vegetarian || recipe.is_vegan) && (
                                <div className="flex gap-2">
                                    {recipe.is_vegetarian && !recipe.is_vegan && (
                                        <span className="bg-green-600/90 text-white text-xs font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 shadow-md border border-green-400/50 backdrop-blur-sm">
                                            <Leaf className="w-3 h-3" /> Veggie
                                        </span>
                                    )}
                                    {recipe.is_vegan && (
                                        <span className="bg-emerald-500/90 text-white text-xs font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1 shadow-md border border-emerald-300/50 backdrop-blur-sm">
                                            <Leaf className="w-3 h-3" /> Vegan
                                        </span>
                                    )}
                                </div>
                            )}
                            <h2 className="text-3xl md:text-4xl font-black text-gold-500 text-glow-gold uppercase tracking-wider drop-shadow-lg">{recipe.title}</h2>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-gold-100 text-sm font-bold uppercase tracking-wide">
                        <div className="flex items-center gap-1 bg-ruby-900/80 px-3 py-1.5 rounded-lg border border-ruby-700 shadow-inner"><Clock className="w-4 h-4 text-gold-300" /> ca. 30 Min</div>
                        <div className="flex items-center gap-1 bg-ruby-900/80 px-3 py-1.5 rounded-lg border border-ruby-700 shadow-inner">
                            <ChefHat className="w-4 h-4 text-gold-300" /> {recipe.author_email ? recipe.author_email.split('@')[0] : (recipe.is_system_recipe ? "Smutje Klassiker" : "Unbekannter Matrose")}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 bg-treasure-wood">
                <div className="md:w-1/3">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b-2 border-gold-900/30 pb-2">
                        <h3 className="text-xl font-black text-gold-300 flex items-center gap-2 uppercase tracking-widest">
                            <Anchor className="w-6 h-6 text-gold-500" /> Zutaten
                        </h3>

                        {/* Portions Stepper */}
                        <div className="flex items-center bg-ruby-900/80 rounded-lg border border-ruby-700 shadow-inner overflow-hidden">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setEditPortions(Math.max(1, editPortions - 1))} className="px-2 py-1 text-gold-500 hover:bg-ruby-800 hover:text-white transition font-black">-</button>
                                    <div className="px-2 py-1 text-sm font-bold text-gold-100 min-w-[3rem] text-center border-x border-ruby-700/50">
                                        {editPortions} <span className="text-xs opacity-80">Port.</span>
                                    </div>
                                    <button onClick={() => setEditPortions(editPortions + 1)} className="px-2 py-1 text-gold-500 hover:bg-ruby-800 hover:text-white transition font-black">+</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setViewPortions(Math.max(1, viewPortions - 1))} className="px-2 py-1 text-gold-500 hover:bg-ruby-800 hover:text-white transition font-black">-</button>
                                    <div className="px-2 py-1 text-sm font-bold text-gold-100 min-w-[3rem] text-center border-x border-ruby-700/50">
                                        {viewPortions} <span className="text-xs opacity-80">Port.</span>
                                    </div>
                                    <button onClick={() => setViewPortions(viewPortions + 1)} className="px-2 py-1 text-gold-500 hover:bg-ruby-800 hover:text-white transition font-black">+</button>
                                </>
                            )}
                        </div>
                    </div>
                    {isEditing && (
                        <div className="flex gap-3 items-center mb-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer text-gold-100 font-bold text-sm bg-ruby-900/60 px-3 py-2 rounded-lg border border-gold-900 shadow-inner">
                                <input type="checkbox" checked={editVeg} onChange={e => setEditVeg(e.target.checked)} className="accent-green-500 w-4 h-4 cursor-pointer" />
                                🌱 Vegetarisch
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-gold-100 font-bold text-sm bg-ruby-900/60 px-3 py-2 rounded-lg border border-gold-900 shadow-inner">
                                <input type="checkbox" checked={editVegan} onChange={e => setEditVegan(e.target.checked)} className="accent-emerald-500 w-4 h-4 cursor-pointer" />
                                🌿 Vegan
                            </label>
                        </div>
                    )}
                    <ul className="space-y-3">
                        {isEditing ? (
                            <>
                                {editIngredients.map((ing, idx) => (
                                    <li key={idx} className="flex gap-2 items-center">
                                        <input value={ing.amount} onChange={e => updateIngredient(idx, 'amount', e.target.value)} placeholder="Menge" className="w-1/3 bg-treasure-wood-dark text-gold-100 p-2 rounded border border-gold-900/50 text-xs font-bold uppercase focus:border-gold-500 focus:outline-none" />
                                        <input value={ing.item} onChange={e => updateIngredient(idx, 'item', e.target.value)} placeholder="Zutat" className="w-full bg-treasure-wood-dark text-white p-2 rounded border border-gold-900/50 text-sm font-black focus:border-gold-500 focus:outline-none" />
                                        <button onClick={() => removeEditIngredient(idx)} className="p-2 text-ruby-700 hover:text-ruby-500 hover:bg-ruby-900/30 rounded border border-transparent hover:border-ruby-700/50 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                                <button onClick={addEditIngredient} className="w-full py-2 mt-2 flex items-center justify-center gap-2 text-gold-300 font-bold border-2 border-dashed border-gold-900/50 hover:border-gold-500/50 hover:bg-gold-900/10 rounded-lg transition text-sm uppercase">
                                    <Plus className="w-4 h-4" /> Zutat hinzufügen
                                </button>
                            </>
                        ) : (
                            recipe.ingredients.map((ing, idx) => (
                                <li key={idx} className="flex flex-col border-b border-gold-900/30 pb-2">
                                    <span className="text-gold-100 font-bold uppercase text-xs">
                                        {scaleAmount(ing.amount, portionMultiplier)}
                                    </span>
                                    <span className="text-white font-black text-lg">{ing.item}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="md:w-2/3">
                    <h3 className="text-xl font-black text-gold-300 mb-4 flex items-center gap-2 uppercase tracking-widest border-b-2 border-gold-900/30 pb-2">
                        <ChefHat className="w-6 h-6 text-gold-500" /> Zubereitung
                    </h3>
                    <ol className="space-y-4">
                        {isEditing ? (
                            <>
                                {editSteps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 items-start">
                                        <span className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-ruby-700 border-2 border-gold-500 flex items-center justify-center text-gold-100 font-black shadow-lg">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-grow flex gap-2">
                                            <textarea value={step} onChange={e => updateStep(idx, e.target.value)} placeholder="Zubereitungsschritt..." className="w-full bg-treasure-wood-dark text-gold-100 p-3 rounded border border-gold-900/50 text-sm font-bold min-h-[80px] focus:border-gold-500 focus:outline-none resize-y" />
                                            <button onClick={() => removeEditStep(idx)} className="p-2 self-start mt-1 text-ruby-700 hover:text-ruby-500 hover:bg-ruby-900/30 rounded border border-transparent hover:border-ruby-700/50 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                <button onClick={addEditStep} className="w-full py-3 mt-4 flex items-center justify-center gap-2 text-gold-300 font-bold border-2 border-dashed border-gold-900/50 hover:border-gold-500/50 hover:bg-gold-900/10 rounded-lg transition text-sm uppercase">
                                    <Plus className="w-5 h-5" /> Schritt hinzufügen
                                </button>
                            </>
                        ) : (
                            recipe.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-ruby-700 border-2 border-gold-500 flex items-center justify-center text-gold-100 font-black shadow-lg">
                                        {idx + 1}
                                    </span>
                                    <p className="text-gold-100 font-bold leading-relaxed pt-1 text-lg">{step}</p>
                                </li>
                            ))
                        )}
                    </ol>

                    {isEditing ? (
                        <div className="mt-8 pt-6 border-t border-gold-900/30 flex justify-end gap-4">
                            <ChunkyButton variant="nav" size="sm" onClick={handleCancel} className="gap-2">
                                <X className="w-4 h-4" /> Abbrechen
                            </ChunkyButton>
                            <ChunkyButton variant="primary" size="sm" onClick={handleSave} className="gap-2 text-ruby-900">
                                <Save className="w-4 h-4" /> Speichern
                            </ChunkyButton>
                        </div>
                    ) : (
                        showActions && isCreator && onDelete && (
                            <div className="mt-8 pt-6 border-t border-ruby-900/40 text-right">
                                <ChunkyButton variant="danger" size="sm" onClick={() => onDelete(recipe.id)} className="gap-2">
                                    <Trash2 className="w-4 h-4" /> Rezept löschen
                                </ChunkyButton>
                            </div>
                        )
                    )}
                </div>
            </div>
        </TreasureCard>
    );
}
