const { processToAI, getDataFromCache, processImage } = require('./open-ai-util');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;


const whatsappToken = process.env.WHATSAPP_SECRET;
console.log(whatsappToken);
// Set up the Facebook Graph API endpoint and access token
const endpoint = 'https://graph.facebook.com/v16.0/102189209500589/messages';
const accessToken =  whatsappToken;


// Middleware to parse incoming request body as JSON
app.use(bodyParser.json());
// Log all requests to the console
app.use(morgan('dev'));
//verify 
let cache = {};

// Handle GET requests to the /webhook endpoint
app.get('/webhook', (req, res) => {
    // Extract verification token and mode from query string parameters
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Check that mode and token are present and correct
    if (mode === 'subscribe') {
        // Respond with the challenge to verify webhook
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        // Respond with an error message
        res.sendStatus(403);
    }
});

// Set up the webhook endpoint to receive incoming messages from WhatsApp
app.post('/webhook', (req, res) => {
    const whatsappBody = req.body;  // Accessing request body

    console.log("Object Details:", JSON.stringify(whatsappBody, null, 2));

    //filter - ignore status message
    const checkNeedTohandle = isNeedTohandleMessage(whatsappBody);
    if (checkNeedTohandle == false) {
        res.status(200).send();
        console.log("dont handle this message ");
        return "";
    }

    const messageObj = getMessage(whatsappBody);
    const senderId = messageObj.from;
    const userCache = messageObj.from;
    const prompt = getDataFromCache(userCache, cache, "user", messageObj.text.body);
    processToAI(prompt).then(openAiResponse => {
        // Send a response to the incoming message
        const responseText = openAiResponse.data.choices[0].message.content;
        const messageData = {
            messaging_product: 'whatsapp',
            "recipient_type": "individual",
            "to": senderId,
            "type": "text",
            "text": { // the text object
                "preview_url": false,
                "body": responseText
            }
        };

        axios.post(endpoint, messageData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log('Message sent successfully:', response.data);
        }).catch(error => {
            console.error('Error sending message:', error.response.data);
        });
    })


    // Return a 200 OK response to acknowledge receipt of the incoming message
    res.status(200).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Webhook server listening on port ${port}`);
});

function isNeedTohandleMessage(whatsappObj) {
    try {

        changes = whatsappObj.entry[0].changes[0].value;

        if (changes.statuses) {
            //dont handle status message
            console.log("dont handle status message");
            return false;
        }
        if (changes.messages) {
            console.log("gia tri ", changes.messages);
            const type = changes.messages[0].type;
            console.log("check type of message " + type);
            if (type == 'text') {
                return true;
            }
        }

    } catch (error) {
        console.log("error when determiate what kind of message type to handle ", error)
    }
    console.log("no true condition ok, exist faile");
    return false;
}
function getMessage(whatsappObj) {
    return whatsappObj.entry[0].changes[0].value.messages[0];
}