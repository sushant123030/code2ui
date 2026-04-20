console.log('Starting test');
const { getPromptResponse } = require('./geminiService');

(async () => {
    try {
        console.log('Calling getPromptResponse');
        const result = await getPromptResponse("Generate ui for homepage of hotel booking website");
        console.log('Result length:', result.length);
        console.log('First 500 chars:', result.substring(0, 500));
    } catch (error) {
        console.log('Error:', error.message);
        console.log('Full error:', error);
    }
    console.log('Done');
})();