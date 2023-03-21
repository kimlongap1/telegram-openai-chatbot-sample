const TelegramBot = require('node-telegram-bot-api');
const token = '5853260702:AAHLHkDwFE3qpiX1TE98VJTxAcVIvGA7SxY';

const bot = new TelegramBot(token, { polling: true });


const axios = require('axios');


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);


// Create an in-memory cache object
let cache = {};


bot.on('message', async (msg) => {

  
    console.log("message 2: %j", msg);
    // if the message is reply on bot message
    if (msg.reply_to_message) {
        //perform conversation as normal
        const replyToUser =  msg.reply_to_message.from.username;
        if(replyToUser == "Phu_2023_bot"){
            const promt = getDataFromCache(msg, cache);
            performOpenAiChatCompletion(msg,cache,promt);
        }
    }
    else {
        handleMessage(msg, cache);
    }




});
async function handleMessage(msg, dataCache) {
    try {

        const messageId = msg.message_id;

        const commandRegex = /^\/(\w+)\s+(.*)$/;

        const inputString = msg.text;

        const match = inputString.match(commandRegex);

        // const promt = getDataFromCache(msg, cache);

        if (match) {
            const command = match[1]; // will be 'openai'
            const args = match[2]; // will be 'hello ban nha'

            console.log(`Command: ${command}`);
            console.log(`Arguments: ${args}`);

            if (command == "openai") {
                const promt = getDataFromCache(msg, cache);
                performOpenAiChatCompletion(msg,cache,promt);


            }
            else if (command == "image") {
                console.log("generate image flow");
                try {
                    const response = await openai.createImage({
                        prompt: args,
                        n: 2
                    });
                    console.log("image %j", response.data);
                    const imageReturns = response.data.data;
                    bot.sendMessage(msg.chat.id, "Kết quả cho " + args, {
                        reply_to_message_id: messageId
                    });


                    // Send the photos as an album
                    bot.sendMediaGroup(msg.chat.id, imageReturns.map((fileId) => ({
                        type: 'photo',
                        media: fileId.url
                    })));

                } catch (error) {
                    console.log("error ", error);
                    if (error.code == 400) {
                        bot.sendMessage(msg.chat.id, "Hình ảnh không được cho phép bởi model nhé anh");
                    }
                    else {
                        bot.sendMessage(msg.chat.id, "Something is wrong baby");

                    }

                }


            }
        } else {
            console.error('Invalid input string');
        }

        return msg.text;
    } catch (error) {
        console.error('something is wrong ' + error);
    }

}
async function performOpenAiChatCompletion(msg, dataCache , prompt){

    const messageId = msg.message_id;
    console.log("start openai flow");
   // const promt = getDataFromCache(msg, cache);
    //get data from cache 

    const data = {
        model: "gpt-3.5-turbo",
        messages: [{ "role": "user", "content": prompt }],
        max_tokens: 500,
        temperature: 0.1

    }
    console.log("input to send to openai %j", data);
    // Send the request to the API

    const completionObj = await openai.createChatCompletion(data);
    console.log("output %j", completionObj);
    const responseText = completionObj.data.choices[0].message.content;

    const subStringCode = "```";
    if (responseText.includes(subStringCode)) {
        bot.sendMessage(msg.chat.id, responseText, { parse_mode: 'Markdown' }), {
            reply_to_message_id: messageId
        };
    }
    else if (responseText.includes("<html>")) {

        bot.sendMessage(msg.chat.id, responseText, { parse_mode: 'HTML' }, {
            reply_to_message_id: messageId
        });
    }
    else {
        bot.sendMessage(msg.chat.id, responseText, {
            reply_to_message_id: messageId
        });
    }



}
function getDataFromCache(botMessage, dataCache) {
    const groupConverstationId = botMessage.chat.id + "_" + botMessage.from.first_name + botMessage.from.last_name;
    const messageText = botMessage.text;
    let output = "";
    console.log("cache " + dataCache[groupConverstationId]);
    if (dataCache[groupConverstationId] != undefined) {
        console.log('Data fetched from cache!');
        output = dataCache[groupConverstationId];
    }
    dataCache[groupConverstationId]
    output = output + "\n" + messageText;
    //update it into cache

    dataCache[groupConverstationId] = output;
    try {
        setTimeout(() => {
            try {
                console.log('Cache expired. Deleting data...');
                delete dataCache[groupConverstationId];
            } catch (error) {
                console.log("error when setting cache time out " + error);
            }
      
        }, 10 * 60 * 1000)
    } catch (error) {
        console.log("error when setting cache time out " + error);
    }

    return output;
}

