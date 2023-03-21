const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;

// Set up the Facebook Graph API endpoint and access token
const endpoint = 'https://graph.facebook.com/v16.0/102189209500589/messages';
const accessToken = 'EAAKQ2XVxtz8BAFr7XbjxVgT8pmqGOrU1VuaMeP8FkkWtrqjZC6vOZASRBcmfjXkfytlIDKT6KLJnDH6pBAj2ZBNtkCHtK1niZBjQU808QAl5ine8mltmHFFoUFfbZCowXHDd8WEgVjZBhDSq4rZA48J4UIb5NZBRXasLNXJ5IP7hbvzW0aLMN6FX2km9srhCzVoWQ7FWUWwd1hnsn8P5U6NV';

// Middleware to parse incoming request body as JSON
app.use(bodyParser.json());
// Log all requests to the console
app.use(morgan('dev'));
//verify 
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
    const messageBody = req.body;  // Accessing request body
 
    console.log("Object Details:", JSON.stringify(messageBody, null, 2));

    //filter - ignore status message
    const checkNeedTohandle = isNeedTohandleMessage(messageBody );
    if(checkNeedTohandle == false){
        res.status(200).send();
        console.log("dont handle this message ");
        return "";
    }

    const senderId = "84398675430";
    const messageText = "Phu say hi";

    // Send a response to the incoming message
    const messageData = {
        messaging_product: 'whatsapp',
        "recipient_type": "individual",
        "to": senderId,
        "type": "text",
        "text": { // the text object
            "preview_url": false,
            "body": messageText
        }
    };
    const data2 = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "PHONE_NUMBER",
        "type": "text",
        "text": { // the text object
            "preview_url": false,
            "body": "MESSAGE_CONTENT"
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
        console.log("Gia tri changes" ,changes);
        if(changes.statuses){
            //dont handle status message
            console.log("dont handle status message");
            return false;
        }
        if(changes.messages){
            console.log("gia tri " , changes.messages);
            const type = changes.messages[0].type ;
            console.log("check type of message "+ type);
            if(type== 'text'){
                return true;
            }
        }
         
    } catch (error) {
        console.log("error when determiate what kind of message type to handle " , error)
    }
   console.log("no true condition ok, exist faile");
    return false;
}