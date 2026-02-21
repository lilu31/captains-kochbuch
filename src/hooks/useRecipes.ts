import { useState, useEffect } from "react";
import { Recipe } from "@/components/ui/RecipeCard";
import { supabase } from "@/lib/supabase";

export const GERMAN_CLASSICS: Recipe[] = [
    {
        id: "system-1",
        title: "Affogato",
        image_url: `/images/affogato.png`,
        ingredients: [{ amount: "1 Kugel", item: "Vanilleeis" }, { amount: "1 Shot", item: "Heißer Espresso" }],
        steps: ["Vanilleeis in ein Glas geben.", "Heißen Espresso darüber gießen.", "Sofort genießen."]
    },
    {
        id: "system-2",
        title: "Kartoffeln mit Spinat und Spiegelei",
        image_url: `/images/spinach_potato.png`,
        ingredients: [{ amount: "500g", item: "Kartoffeln" }, { amount: "300g", item: "Blattspinat" }, { amount: "2", item: "Eier" }, { amount: "1 Prise", item: "Muskatnuss" }],
        steps: ["Kartoffeln schälen und in Salzwasser kochen, bis sie weich sind.", "Spinat in einer Pfanne andünsten und mit Salz, Pfeffer und einer Prise Muskatnuss abschmecken.", "In der Zwischenzeit die Spiegeleier in einer separaten Pfanne braten.", "Kartoffeln, Spinat und Spiegeleier zusammen auf einem Teller anrichten und servieren."]
    }
];

// Global cache to prevent redundant fetches on route navigation
let globalRecipesCache: Recipe[] | null = null;
let globalCachedUserId: string | null | undefined = undefined;

export function useRecipes(userId?: string | null, userEmail?: string | null) {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchRecipes = async () => {
            if (globalRecipesCache && globalCachedUserId === userId) {
                if (isMounted) {
                    setRecipes(globalRecipesCache);
                    setIsLoaded(true);
                }
                return;
            }

            try {
                // 1. Fetch system recipes and user's own recipes
                let query = supabase.from('recipes').select('*');
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
                        author_email: r.author_email,
                        portions: r.portions,
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
                    globalRecipesCache = mergedRecipes;
                    globalCachedUserId = userId;
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
        const newRecipe = { ...recipe, id: tempId, creator_id: userId, author_email: userEmail || undefined };

        setRecipes(prev => {
            const updated = [newRecipe as Recipe, ...prev];
            globalRecipesCache = updated;
            return updated;
        });

        if (!userId) return; // Must be logged in to save to DB

        const { data, error } = await supabase
            .from('recipes')
            .insert({
                user_id: userId,
                title: recipe.title,
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                image_url: recipe.image_url,
                author_email: userEmail || undefined,
                portions: recipe.portions,
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
            setRecipes(prev => {
                const updated = prev.map(r => r.id === tempId ? { ...r, id: data.id } : r);
                globalRecipesCache = updated;
                return updated;
            });
        }
    };

    const updateRecipe = async (updated: Recipe) => {
        // Optimistic UI update
        const previousState = [...recipes];
        const previousRecipe = recipes.find(r => r.id === updated.id);

        setRecipes(prev => {
            const newRecipes = prev.map(r => r.id === updated.id ? updated : r);
            globalRecipesCache = newRecipes;
            return newRecipes;
        });

        if (!userId) return;

        try {
            // Check if it's a system recipe being saved/favorited
            let finalRecipeId = updated.id;

            if (updated.is_system_recipe && previousRecipe?.is_favorite !== updated.is_favorite && updated.is_favorite) {
                // Clone the system recipe for the user
                const { data: newRecipeData, error: cloneError } = await supabase
                    .from('recipes')
                    .insert({
                        user_id: userId,
                        title: updated.title,
                        ingredients: updated.ingredients,
                        steps: updated.steps,
                        image_url: updated.image_url,
                        portions: updated.portions,
                        is_system_recipe: false
                    })
                    .select()
                    .single();

                if (cloneError) throw cloneError;
                finalRecipeId = newRecipeData.id;

                // Update the local state to point to the new ID so future edits work
                setRecipes(prev => {
                    const newRecipes = prev.map(r => r.id === updated.id ? { ...updated, id: finalRecipeId, is_system_recipe: false, creator_id: userId } : r);
                    globalRecipesCache = newRecipes;
                    return newRecipes;
                });
            }

            // Check if favorite status changed
            if (previousRecipe && previousRecipe.is_favorite !== updated.is_favorite) {
                if (updated.is_favorite) {
                    await supabase.from('favorites').insert({ user_id: userId, recipe_id: finalRecipeId });
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
                        image_url: updated.image_url,
                        portions: updated.portions
                    })
                    .eq('id', updated.id)
                    .eq('user_id', userId);

                if (error) throw error;
            }
        } catch (error) {
            console.error("Error updating recipe:", error);
            // Revert optimistic update
            setRecipes(previousState);
            globalRecipesCache = previousState;
        }
    }

    const deleteRecipe = async (id: string) => {
        // Optimistic UI update
        const previousState = [...recipes];
        setRecipes(prev => {
            const next = prev.filter(r => r.id !== id);
            globalRecipesCache = next;
            return next;
        });

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
