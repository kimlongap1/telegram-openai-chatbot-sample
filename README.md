# telegram-openai-chatbot-sample

This is a sample test for openAi telegram chat bot by nodejs


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js installed on your machine. You can download and install the latest version of Node.js from the official website: https://nodejs.org/en/download/
- A Telegram account.

# Installing steps

1. Clone this repository to your local machine.
2. install node module
3. Register new telegram bot, then get telegram bot access token
4. Get OpenAI token
5. Config env file and run project


 
## install module
```
npm install

```

## Registering a new telegram bot 
 

1. Open Telegram and search for the `BotFather` account.
2. Start a conversation with the `BotFather` and follow the instructions to create a new bot. You will need to give your bot a name and a username.
3. Once your bot is created, the `BotFather` will give you a token. This token is required to interact with your bot.

## Get OpenAI token
1. Open https://platform.openai.com , login by your account 
2. Open https://platform.openai.com/account/api-keys , create a new secret key to config bot later 

## Change config file 
change file .env.txt to .env 
edit key properly

TELE_SECRET=***Your tele key***
OPENAI_SECRET=** YOUR OPENAI key**
 

## Run server
```
 node tele-bot.js
```

You will see Bot welcome message
```
    ************ TELEGRAM BOT WITH OPENAI INTEGRATED ************
```