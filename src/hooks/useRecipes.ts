import { useState, useEffect } from "react";
import { Recipe } from "@/components/ui/RecipeCard";

export const GERMAN_CLASSICS: Recipe[] = [
    {
        id: "system-1",
        title: "Affogato",
        image_url: `https://image.pollinations.ai/prompt/Affogato%203d%20cartoon%20style%20delicious%20food%20shiny%20vibrant%20colorful?width=1200&height=800&nologo=true`,
        ingredients: [{ amount: "1 Kugel", item: "Vanilleeis" }, { amount: "1 Shot", item: "Heißer Espresso" }],
        steps: ["Vanilleeis in ein Glas geben.", "Heißen Espresso darüber gießen.", "Sofort genießen."]
    },
    {
        id: "system-2",
        title: "Kartoffeln mit Spinat und Spiegelei",
        image_url: `https://image.pollinations.ai/prompt/Kartoffeln%20mit%20Spinat%20und%20Spiegelei%203d%20cartoon%20style%20delicious%20food%20shiny%20vibrant%20colorful?width=1200&height=800&nologo=true`,
        ingredients: [{ amount: "500g", item: "Kartoffeln" }, { amount: "300g", item: "Blattspinat" }, { amount: "2", item: "Eier" }, { amount: "1 Prise", item: "Muskatnuss" }],
        steps: ["Kartoffeln schälen und in Salzwasser kochen, bis sie weich sind.", "Spinat in einer Pfanne andünsten und mit Salz, Pfeffer und einer Prise Muskatnuss abschmecken.", "In der Zwischenzeit die Spiegeleier in einer separaten Pfanne braten.", "Kartoffeln, Spinat und Spiegeleier zusammen auf einem Teller anrichten und servieren."]
    }
];

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("kombuesen_recipes");
        if (saved) {
            setRecipes(JSON.parse(saved));
        } else {
            setRecipes(GERMAN_CLASSICS);
            localStorage.setItem("kombuesen_recipes", JSON.stringify(GERMAN_CLASSICS));
        }
        setIsLoaded(true);
    }, []);

    const addRecipe = (recipe: Recipe) => {
        const next = [recipe, ...recipes];
        setRecipes(next);
        localStorage.setItem("kombuesen_recipes", JSON.stringify(next));
    };

    const updateRecipe = (updated: Recipe) => {
        const next = recipes.map(r => r.id === updated.id ? updated : r);
        setRecipes(next);
        localStorage.setItem("kombuesen_recipes", JSON.stringify(next));
    }

    const deleteRecipe = (id: string) => {
        const next = recipes.filter(r => r.id !== id);
        setRecipes(next);
        localStorage.setItem("kombuesen_recipes", JSON.stringify(next));
    }

    return { recipes, isLoaded, addRecipe, updateRecipe, deleteRecipe };
}
