"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence, PanInfo } from "framer-motion";
import { Heart, X as XIcon, Menu, ChefHat, Sparkles } from "lucide-react";
import { TreasureCard } from "@/components/ui/TreasureCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import Link from "next/link";
import { RecipeCard, Recipe } from "@/components/ui/RecipeCard";

import { useRecipes } from "@/hooks/useRecipes";

export default function HomeSwipePage() {
  const { recipes: allRecipes, isLoaded, updateRecipe } = useRecipes();
  const [deck, setDeck] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openedRecipe, setOpenedRecipe] = useState<Recipe | null>(null);

  // Initialize deck
  useEffect(() => {
    if (isLoaded && allRecipes.length > 0) {
      // Shuffle the array to make it random at start
      const shuffled = [...allRecipes].sort(() => 0.5 - Math.random());
      // Duplicate the deck a few times so the user doesn't run out of swipes quickly for this demo
      setDeck([...shuffled, ...shuffled, ...shuffled]);
    }
  }, [allRecipes, isLoaded]);

  const currentRecipe = deck[currentIndex];

  const handleSwipeComplete = (direction: "left" | "right") => {
    if (direction === "right" && currentRecipe) {
      // Open the recipe
      setOpenedRecipe(currentRecipe);
    }
    // Move to next recipe
    setCurrentIndex((prev) => prev + 1);
  };

  if (openedRecipe) {
    return (
      <main className="min-h-screen relative flex flex-col p-4 md:p-8 overflow-hidden bg-ruby-900 z-50">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[150vw] h-[150vw] absolute bg-[radial-gradient(circle,var(--color-gold-500)_0%,transparent_70%)] opacity-20" />
        </div>

        <div className="w-full max-w-3xl mx-auto z-10 mb-6 flex justify-between items-center">
          <ChunkyButton variant="nav" size="sm" onClick={() => setOpenedRecipe(null)} className="gap-2">
            <XIcon className="w-5 h-5" /> Schließen
          </ChunkyButton>
          <ChunkyButton variant="secondary" size="sm" className="gap-2" onClick={() => {
            if (openedRecipe) {
              updateRecipe({ ...openedRecipe, is_favorite: true });
            }
            setOpenedRecipe(null);
          }}>
            <Heart className="w-5 h-5 fill-white" /> Speichern
          </ChunkyButton>
        </div>

        <div className="flex-1 w-full max-w-3xl mx-auto z-10 overflow-y-auto pb-20">
          <RecipeCard recipe={openedRecipe} onFavorite={(id, fav) => {
            updateRecipe({ ...openedRecipe, is_favorite: fav });
            setOpenedRecipe({ ...openedRecipe, is_favorite: fav });
          }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative flex flex-col pt-4 overflow-hidden bg-ruby-900">
      {/* Background pattern/rays to make it feel like an excited game */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="w-[200vw] h-[200vw] absolute"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg 15deg, var(--color-gold-500) 15deg 30deg, transparent 30deg 45deg, var(--color-gold-500) 45deg 60deg, transparent 60deg 75deg, var(--color-gold-500) 75deg 90deg, transparent 90deg 105deg, var(--color-gold-500) 105deg 120deg, transparent 120deg 135deg, var(--color-gold-500) 135deg 150deg, transparent 150deg 165deg, var(--color-gold-500) 165deg 180deg, transparent 180deg 195deg, var(--color-gold-500) 195deg 210deg, transparent 210deg 225deg, var(--color-gold-500) 225deg 240deg, transparent 240deg 255deg, var(--color-gold-500) 255deg 270deg, transparent 270deg 285deg, var(--color-gold-500) 285deg 300deg, transparent 300deg 315deg, var(--color-gold-500) 315deg 330deg, transparent 330deg 345deg, var(--color-gold-500) 345deg 360deg)"
          }}
        />
      </div>

      {/* Top Nav */}
      <header className="w-full flex justify-between items-center px-4 md:px-6 z-10 pt-2">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gold-500 rounded-full border-2 md:border-4 border-gold-900 shadow-lg flex items-center justify-center text-ruby-900 font-bold text-xl md:text-2xl shrink-0">
            ⚓️
          </div>
          <h1 className="text-base sm:text-lg md:text-2xl font-black text-white text-glow-gold drop-shadow-md tracking-wider uppercase leading-snug md:leading-tight">
            Captain's magisches<br />Kombüsen-Kochbuch
          </h1>
        </div>
        <div className="flex gap-2 md:gap-3 shrink-0">
          <Link href="/favorites">
            <ChunkyButton variant="nav" size="sm" className="px-3 md:px-4">
              <Heart className="w-5 h-5 text-ruby-500 fill-ruby-500" />
            </ChunkyButton>
          </Link>
          <Link href="/cookup">
            <ChunkyButton variant="nav" size="sm" className="gap-2 px-3 md:px-4">
              <ChefHat className="w-5 h-5" /> <span className="hidden md:inline">Kochen</span>
            </ChunkyButton>
          </Link>
          <Link href="/profile">
            <ChunkyButton variant="nav" size="sm" className="px-3 md:px-4">
              <Menu className="w-5 h-5" />
            </ChunkyButton>
          </Link>
        </div>
      </header>

      {/* Main Swipe Area */}
      <div className="flex-1 w-full max-w-md mx-auto relative flex items-center justify-center p-6 z-10 perspective-[1000px]">

        {/* Empty State if out of cards */}
        {currentIndex >= deck.length && (
          <TreasureCard variant="gold" className="text-center">
            <Sparkles className="w-16 h-16 text-ruby-700 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-ruby-900 mb-4 uppercase">Keine Rezepte mehr!</h2>
            <ChunkyButton onClick={() => setCurrentIndex(0)}>Neues Deck mischen</ChunkyButton>
          </TreasureCard>
        )}

        {/* The Card Stack */}
        <div className="relative w-full h-[60vh] max-h-[600px]">
          <AnimatePresence>
            {deck.map((recipe, index) => {
              if (index < currentIndex || index > currentIndex + 2) return null; // Show top 3 cards max

              const isTop = index === currentIndex;
              return (
                <SwipeableCard
                  key={`${recipe.id}-${index}`}
                  recipe={recipe}
                  isTop={isTop}
                  indexOffset={index - currentIndex}
                  onSwipe={(dir) => handleSwipeComplete(dir)}
                />
              );
            })}
          </AnimatePresence>
        </div>

      </div>

    </main>
  );
}

// Separate component for the swipe mechanics to keep the main file cleaner
interface SwipeableCardProps {
  recipe: Recipe;
  isTop: boolean;
  indexOffset: number;
  onSwipe: (dir: "left" | "right") => void;
}

function SwipeableCard({ recipe, isTop, indexOffset, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  // Rotate based on x
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  // Opacity for the "LIKE/NOPE" stamps
  const opacityRight = useTransform(x, [0, 100], [0, 1]);
  const opacityLeft = useTransform(x, [0, -100], [0, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute top-0 left-0 w-full h-full transform-gpu"
      style={{
        x,
        rotate: isTop ? rotate : 0,
        zIndex: 10 - indexOffset,
      }}
      initial={{ scale: 0.8, y: 50, opacity: 0 }}
      animate={{
        scale: 1 - indexOffset * 0.05,
        y: indexOffset * 15,
        opacity: 1
      }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.3 } }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
    >
      <TreasureCard variant="wood" className="w-full h-full p-2 cursor-grab shadow-2xl flex flex-col">
        <div
          className="w-full h-[65%] bg-cover bg-center rounded-2xl border-4 border-gold-900 shadow-inner relative overflow-hidden"
          style={{ backgroundImage: `url(${recipe.image_url})` }}
        >
          {/* Dynamic LIKE / NOPE stamps */}
          <motion.div style={{ opacity: opacityRight }} className="absolute top-4 left-4 border-4 border-green-500 text-green-500 font-black text-3xl px-2 py-1 rotate-[-15deg] rounded-lg bg-black/50 uppercase tracking-widest">
            Lecker!
          </motion.div>
          <motion.div style={{ opacity: opacityLeft }} className="absolute top-4 right-4 border-4 border-red-500 text-red-500 font-black text-3xl px-2 py-1 rotate-[15deg] rounded-lg bg-black/50 uppercase tracking-widest">
            Über Bord!
          </motion.div>
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black text-gold-500 text-glow-gold uppercase leading-tight mb-2 tracking-wide">{recipe.title}</h2>
            <div className="bg-treasure-wood-dark p-3 rounded-xl border border-gold-900/50">
              <h3 className="text-gold-300 font-bold uppercase text-sm mb-1 tracking-wider">Zutaten</h3>
              <p className="text-white text-sm">
                {recipe.ingredients.map(i => i.item).join(", ")}
              </p>
            </div>
          </div>

          {/* Manual buttons for users who don't want to swipe */}
          <div className="flex justify-evenly pb-2">
            <ChunkyButton
              variant="danger"
              size="icon"
              onClick={() => onSwipe("left")}
            >
              <XIcon className="w-8 h-8" strokeWidth={3} />
            </ChunkyButton>

            <ChunkyButton
              variant="secondary"
              size="icon"
              onClick={() => onSwipe("right")}
            >
              <Heart className="w-8 h-8 fill-white" strokeWidth={3} />
            </ChunkyButton>
          </div>
        </div>
      </TreasureCard>
    </motion.div>
  );
}
