const response = await fetch('https://hijtovcawskifuepfjgi.supabase.co/rest/v1/recipes?limit=1&select=portions', {
    headers: { 'apikey': 'sb_publishable_tfJMizDQD8NpElyuXew6tQ_SiO83Kkl' }
});
console.log(response.status);
console.log(await response.text());
