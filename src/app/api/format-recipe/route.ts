import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, ingredients, steps } = await req.json();

        const systemPrompt = `Du bist ein hilfreicher Assistent im Hintergrund einer Rezept-App. 
Du erhältst Rohdaten für ein Rezept (Titel, Zutaten, evt. grobe Schritte). Formatiere diese in ein vollständiges, strukturiertes Rezept. 
Ergänze fehlende Standard-Schritte oder logische Mengenangaben sinnvoll. 
Erwähne niemals, dass du eine KI bist oder dass du den Text formatiert hast.
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt im folgenden Format, ohne Markdown-Formatierung oder Erklärungen drumherum:
{
  "title": "Formatierter Titel",
  "ingredients": [{"amount": "Menge", "item": "Zutat"}],
  "steps": ["Schritt 1", "Schritt 2"]
}`;

        const userPrompt = `Titel: ${title || 'Nicht angegeben'}
Zutaten: ${ingredients.join(', ')}
Grobe Schritte: ${steps.join(', ')}`;

        // Using Pollinations.ai Text API which is free, open, and requires no API key.
        // It takes the prompt in the URL path or body. We'll use POST.
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                jsonMode: true, // Ask for JSON response
                seed: Math.floor(Math.random() * 1000000) // Ensure fresh generation
            })
        });

        if (!response.ok) {
            throw new Error(`Pollinations API responded with status ${response.status}`);
        }

        const textPayload = await response.text();
        console.log("LLM Output:", textPayload);

        // Sometimes the LLM might wrap the JSON in markdown blocks despite instructions
        const cleanJson = textPayload.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const recipeData = JSON.parse(cleanJson);

        return NextResponse.json(recipeData);

    } catch (error) {
        console.error("Recipe format error:", error);
        return NextResponse.json(
            { error: "Fehler beim Formatieren des Rezepts." },
            { status: 500 }
        );
    }
}
