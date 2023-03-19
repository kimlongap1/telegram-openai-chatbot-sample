const axios = require('axios');

// Set up the API endpoint URL
const apiUrl = 'https://api.openai.com/v1/chat/completions';

// Set up the API authentication headers
const headers = {
  'Authorization': 'Bearer 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',
  'Content-Type': 'application/json'
};

// Set up the request data
 
const data = {
    model: "gpt-3.5-turbo",
    messages : [{"role": "user", "content": "Chào ban!"}],
    max_tokens: 50,
    temperature: 0.7
  }

// Send the request to the API
axios.post(apiUrl, data, { headers })
  .then(response => {
    // Get the response text
    const responseText = response.data.choices[0].message.content;

    // Print the response text
    console.log(responseText);
  })
  .catch(error => {
    console.error(error);
  });