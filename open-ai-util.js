const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();
const openAISecret =process.env.OPENAI_SECRET;
const configuration = new Configuration({
    apiKey: openAISecret,
});
const openai = new OpenAIApi(configuration);

async function processToAI(prompt) {
    console.log("start openai flow");

    const data = {
        model: "gpt-3.5-turbo",
        messages: prompt,
        max_tokens: 500,
        temperature: 0.1,
        stop: ["/openai"]

    }
    console.log("input to send to openai %j", data);
    // Send the request to the API


    const completionObj = openai.createChatCompletion(data);
    return completionObj;
    // console.log("output %j", completionObj);
    // const responseText = completionObj.data.choices[0].message.content;
    // return responseText;
}
function getDataFromCache(key, dataCache, roleInput, textInput) {
    //  const groupConverstationId = botMessage.chat.id + "_" + botMessage.from.first_name + botMessage.from.last_name;
    const groupConverstationId = key;
    const messageText = textInput;
    let output = [];
    console.log("cache " + dataCache[groupConverstationId]);
    if (dataCache[groupConverstationId] != undefined) {
        console.log('Data fetched from cache!');
        output = dataCache[groupConverstationId];
    }

    const newCommand = { role: roleInput, content: messageText };
    output.push(newCommand);
    console.log(+ output);

    //update it into cache

    dataCache[groupConverstationId] = output;
    try {
        setTimeout(() => {
            try {
                console.log('Cache expired. Deleting data...' + groupConverstationId);
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
async function processImage(command){
    return  openai.createImage({
        prompt: command,
        n: 2
    });
}
module.exports = {
    processToAI: processToAI ,
    getDataFromCache: getDataFromCache,
    processImage: processImage
  };