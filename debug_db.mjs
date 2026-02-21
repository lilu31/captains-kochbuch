import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: recipes } = await supabase.from('recipes').select('*');
    console.log("Recipes count:", recipes?.length);

    const { data: favorites } = await supabase.from('favorites').select('*');
    console.log("Favorites count:", favorites?.length);
    console.log("Favorites data:", favorites);

    const { data: myCloned } = await supabase.from('recipes').select('*').eq('is_system_recipe', false);
    console.log("User created/cloned recipes:", myCloned?.length);
}

checkData();
