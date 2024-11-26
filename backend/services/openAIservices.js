const axios = require("axios");

exports.fetchRecipeSuggestions = async (input) => {
  const response = await axios.post("https://api.openai.com/v1/completions", {
    prompt: `Suggest recipes for ${input}`,
    model: "gpt-4",
  });

  return response.data;
};
