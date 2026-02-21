import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Gültige URL erforderlich.' }, { status: 400 });
        }

        // 1. Fetch HTML from the URL
        const htmlResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            }
        });

        if (!htmlResponse.ok) {
            return NextResponse.json({ error: 'Website konnte nicht geladen werden.' }, { status: 500 });
        }

        const html = await htmlResponse.text();

        // 2. Parse HTML and extract meaningful text to save LLM context window
        const $ = cheerio.load(html);

        // Remove useless clutter like scripts, styles, nav, footer
        $('script, style, noscript, svg, nav, footer, header, iframe').remove();

        const contentText = $('body').text().replace(/\s+/g, ' ').trim();

        // Truncate to avoid blowing up the LLM input
        const truncatedText = contentText.length > 8000 ? contentText.substring(0, 8000) : contentText;

        const systemPrompt = `Du bist ein hilfreicher Assistent für eine Rezept-App. 
Du erhältst einen unstrukturierten Rohtext von einer Koch-Website. Deine Aufgabe ist es, daraus das Rezept zu extrahieren.
Finde den Titel, die Zutaten (inklusive Mengen) und die Zubereitungsschritte.
Ignoriere Werbung, Kommentare oder unwichtige Texte der Website.
Formatiere das Ergebnis in ein vollständiges, strukturiertes Rezept. 
Erwähne niemals, dass du eine KI bist.
Antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt im folgenden Format, ohne Markdown-Formatierung:
{
  "title": "Gefundener Rezepttitel",
  "ingredients": [{"amount": "Menge", "item": "Zutat"}],
  "steps": ["Schritt 1", "Schritt 2"]
}`;

        const userPrompt = `Extrahiere das Rezept aus diesem Website-Text:\n\n${truncatedText}`;

        // 3. Send text to LLM
        const llmResponse = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                jsonMode: true,
                seed: Math.floor(Math.random() * 1000000)
            })
        });

        if (!llmResponse.ok) {
            throw new Error(`Pollinations API error: ${llmResponse.status}`);
        }

        const textPayload = await llmResponse.text();
        console.log("URL Import LLM Output:", textPayload);

        // 4. Parse JSON
        const cleanJson = textPayload.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const recipeData = JSON.parse(cleanJson);

        return NextResponse.json(recipeData);

    } catch (error) {
        console.error("URL import error:", error);
        return NextResponse.json(
            { error: "Fehler beim Extrahieren des Rezepts." },
            { status: 500 }
        );
    }
}
