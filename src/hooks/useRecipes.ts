import { useState, useEffect } from "react";
import { Recipe } from "@/components/ui/RecipeCard";
import { supabase } from "@/lib/supabase";

export const GERMAN_CLASSICS: Recipe[] = [
    {
        id: "system-1",
        title: "Affogato",
        image_url: `https://pollinations.ai/p/Affogato%203d%20cartoon%20style%20delicious%20food%20shiny%20vibrant%20colorful?width=1200&height=800&nologo=true`,
        ingredients: [{ amount: "1 Kugel", item: "Vanilleeis" }, { amount: "1 Shot", item: "Heißer Espresso" }],
        steps: ["Vanilleeis in ein Glas geben.", "Heißen Espresso darüber gießen.", "Sofort genießen."]
    },
    {
        id: "system-2",
        title: "Kartoffeln mit Spinat und Spiegelei",
        image_url: `https://pollinations.ai/p/Kartoffeln%20mit%20Spinat%20und%20Spiegelei%203d%20cartoon%20style%20delicious%20food%20shiny%20vibrant%20colorful?width=1200&height=800&nologo=true`,
        ingredients: [{ amount: "500g", item: "Kartoffeln" }, { amount: "300g", item: "Blattspinat" }, { amount: "2", item: "Eier" }, { amount: "1 Prise", item: "Muskatnuss" }],
        steps: ["Kartoffeln schälen und in Salzwasser kochen, bis sie weich sind.", "Spinat in einer Pfanne andünsten und mit Salz, Pfeffer und einer Prise Muskatnuss abschmecken.", "In der Zwischenzeit die Spiegeleier in einer separaten Pfanne braten.", "Kartoffeln, Spinat und Spiegeleier zusammen auf einem Teller anrichten und servieren."]
    }
];

export function useRecipes(userId?: string | null) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchRecipes = async () => {
            try {
                // 1. Fetch system recipes and user's own recipes
                let query = supabase.from('recipes').select('*').or(`is_system_recipe.eq.true${userId ? `,user_id.eq.${userId}` : ''}`);
                const { data: recipesData, error: recipesError } = await query;

                if (recipesError) throw recipesError;

                let mergedRecipes: Recipe[] = [];

                if (recipesData) {
                    // Map DB format to Recipe interface
                    mergedRecipes = recipesData.map(r => ({
                        id: r.id,
                        title: r.title,
                        image_url: r.image_url,
                        ingredients: r.ingredients,
                        steps: r.steps,
                        creator_id: r.user_id,
                        is_system_recipe: r.is_system_recipe
                    }));
                }

                // 2. Fetch user's favorites if logged in
                if (userId && mergedRecipes.length > 0) {
                    const { data: favData, error: favError } = await supabase
                        .from('favorites')
                        .select('recipe_id')
                        .eq('user_id', userId);

                    if (!favError && favData) {
                        const favIds = new Set(favData.map(f => f.recipe_id));
                        mergedRecipes = mergedRecipes.map(r => ({
                            ...r,
                            is_favorite: favIds.has(r.id)
                        }));
                    }
                }

                // Fallback to local GERMAN_CLASSICS if DB is empty/unseeded
                if (mergedRecipes.length === 0) {
                    mergedRecipes = GERMAN_CLASSICS;
                }

                if (isMounted) {
                    setRecipes(mergedRecipes);
                    setIsLoaded(true);
                }

            } catch (err) {
                console.error("Error fetching recipes:", err);
                if (isMounted) {
                    setRecipes(GERMAN_CLASSICS);
                    setIsLoaded(true);
                }
            }
        };

        fetchRecipes();

        return () => { isMounted = false; };
    }, [userId]);

    const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
        // Optimistic UI update
        const tempId = `temp-${Date.now()}`;
        const newRecipe = { ...recipe, id: tempId, creator_id: userId };
        setRecipes(prev => [newRecipe as Recipe, ...prev]);

        if (!userId) return; // Must be logged in to save to DB

        const { data, error } = await supabase
            .from('recipes')
            .insert({
                user_id: userId,
                title: recipe.title,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                image_url: recipe.image_url,
                is_system_recipe: false
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding recipe:", error);
            // Revert optimistic update
            setRecipes(prev => prev.filter(r => r.id !== tempId));
        } else if (data) {
            // Replace temp ID with real DB UUID
            setRecipes(prev => prev.map(r => r.id === tempId ? { ...r, id: data.id } : r));
        }
    };

    const updateRecipe = async (updated: Recipe) => {
        // Optimistic UI update
        const previousState = [...recipes];
        const previousRecipe = recipes.find(r => r.id === updated.id);

        setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));

        if (!userId) return;

        try {
            // Check if favorite status changed
            if (previousRecipe && previousRecipe.is_favorite !== updated.is_favorite) {
                if (updated.is_favorite) {
                    await supabase.from('favorites').insert({ user_id: userId, recipe_id: updated.id });
                } else {
                    await supabase.from('favorites').delete().eq('user_id', userId).eq('recipe_id', updated.id);
                }
            }

            // Update recipe data if user is creator
            if (updated.creator_id === userId) {
                const { error } = await supabase
                    .from('recipes')
                    .update({
                        title: updated.title,
                        ingredients: updated.ingredients,
                        steps: updated.steps,
                        image_url: updated.image_url
                    })
                    .eq('id', updated.id)
                    .eq('user_id', userId);

                if (error) throw error;
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            // Revert optimistic update
            setRecipes(previousState);
        }
    }

    const deleteRecipe = async (id: string) => {
        // Optimistic UI update
        const previousState = [...recipes];
        setRecipes(prev => prev.filter(r => r.id !== id));

        if (!userId || String(id).startsWith('system-')) return;

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error("Error deleting recipe:", error);
            // Revert optimistic update
            setRecipes(previousState);
        }
    }

    return { recipes, isLoaded, addRecipe, updateRecipe, deleteRecipe };
}
