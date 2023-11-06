//references:
// https://medium.com/@ivankoop/getting-gpt-3-prompt-responses-in-your-own-voice-with-node-js-openai-and-elevenlabs-b2e0aa4f7844
// https://github.com/openai/openai-node/discussions/217

const maxApi = require("max-api");
const dotenv = require("dotenv").config();
const fs = require("fs");
const voice = require("elevenlabs-node");
const player = require("play-sound")((opts = {}));
const readline = require("readline");

// New initialization for open ai
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // taken from .env file
});

// Settings
let ROLE = 'user';
let TEMPERATURE = 1;
let MAX_TOKENS = 300;

// Chat history array
let HISTORY = [];

// Read the JSON file with human responses
const jsonContent = fs.readFileSync('/Users/seansanchez/Desktop/human_responses.json');
const humanResponses = JSON.parse(jsonContent).history;

// Extract the "content" values
const contentValues = humanResponses.map(response => response.content);

// Construct the system instruction
const systemInstruction = `Generate a creative story about AI and Humans using the following list of phrases:
${contentValues.map(content => `"${content}"`).join(', ')}. Make sure the story flows naturally 
and incorporates these phrases in a way that makes sense. The story should be engaging and coherent.
 The story should be about 1 minute long.`;

// Push the system instruction to your chat history
HISTORY.push({
  "role": "system",
  "content": systemInstruction
});

async function runCompletion(prompt) {
  try {
    const msgResponse = prompt;

    // add prompt to chat history
    HISTORY.push({"role": ROLE, "content": msgResponse});

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: HISTORY,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS
    });

    const textResponse = chatCompletion.choices[0].message.content;

    // add openai response to the chat history
    HISTORY.push(chatCompletion.choices[0].message);
	
	// append openai response to elevenlabs api
    const res = await voice.textToSpeechStream(
      process.env.ELEVEN_LABS_API_KEY,
      process.env.ELEVEN_LABS_VOICE_ID,
      textResponse
    );
	
	// if complete play audio response
    if (res) {
      res.pipe(fs.createWriteStream("audio.mp3")).on("finish", () => {
        player.play("audio.mp3", (err) => {
          if (err) {
            maxApi.post("Error playing audio: " + err.message);
          } else {
            maxApi.post("Audio playback complete.");
          }
        });
      });
	  
	  // output response to message box
      maxApi.outlet(textResponse);
      // output history (for storage and saving in dictionary)
      // maxApi.outlet('history', { history: HISTORY });
      // maxApi.outlet('done');
    } else {
      maxApi.post("Empty response from textToSpeechStream.");
    }
  } catch (error) {
    maxApi.post("Error: " + error.message);
  }
}

maxApi.addHandler("message", (output) => {
  	// receive message and run openai and elevenlabs apis 
	runCompletion(output);
	
});