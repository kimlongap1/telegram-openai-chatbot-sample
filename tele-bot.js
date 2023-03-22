const { processToAI, getDataFromCache, processImage } = require('./open-ai-util');
const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();

const teleToken = process.env.TELE_SECRET;
const token = teleToken;
const bot = new TelegramBot(token, { polling: true });

// Create an in-memory cache object
let cache = {};
console.log("************ TELEGRAM BOT WITH OPENAI INTEGRATED ************")

bot.on('message', async (msg) => {


    console.log("message 2: %j", msg);
    // if the message is reply on bot message
    if (msg.reply_to_message) {
        //perform conversation as normal
        const replyToUser = msg.reply_to_message.from.username;
        if (replyToUser == "Phu_2023_bot") {
            const keyCacheUser = msg.chat.id + "_" + msg.from.first_name + msg.from.last_name;
            const promt = getDataFromCache(keyCacheUser, cache, 'user', msg.text);
            performOpenAiChatCompletion(msg, cache, promt);
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
                const keyCacheUser = msg.chat.id + "_" + msg.from.first_name + msg.from.last_name;
                const promt = getDataFromCache(keyCacheUser, cache, 'user', msg.text);
                performOpenAiChatCompletion(msg, cache, promt);


            }
            else if (command == "image") {
                console.log("generate image flow");



                processImage(args).then(response => {

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


                }).catch(error => {
                    console.log("error ", error);
                    if (error.code == 400) {
                        bot.sendMessage(msg.chat.id, "Hình ảnh không được cho phép bởi model nhé anh");
                    }
                    else {
                        bot.sendMessage(msg.chat.id, "Something is wrong baby");

                    }
                });



            }
        } else {
            console.error('Invalid input string');
        }

        return msg.text;
    } catch (error) {
        console.error('something is wrong ' + error);
    }

}
async function performOpenAiChatCompletion(msg, dataCache, prompt) {
    const messageId = msg.message_id;

    processToAI(prompt).then(openAiResponse => {
       
        const responseText = openAiResponse.data.choices[0].message.content;
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
        //add result into cache
        const keyCacheUser = msg.chat.id + "_" + msg.from.first_name + msg.from.last_name;
        getDataFromCache(keyCacheUser, cache, 'system', responseText);
    }).catch(error=>{
        console.log("something is wrong ",error);
        // bot.sendMessage(msg.chat.id, "Câu lệnh bạn quá phức tạp, OpenAI bó tay !!!", {
        //     reply_to_message_id: messageId
        // });
    });





}


