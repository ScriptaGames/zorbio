// ESLint global declarations: https://eslint.org/docs/rules/no-undef
/*
global config:true
global Raven:true
*/

if (!config.DEBUG) {
    Raven.config('https://5b9c66b633364e43bc97ec763be5d018@app.getsentry.com/94111').install();
}
