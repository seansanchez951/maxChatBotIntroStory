const fs = require('fs');
// const path = require('path');

// Specify the path to the JSON file on your desktop
// const desktopPath = path.join(require('os').homedir(), 'Desktop');
// const filePath = path.join(desktopPath, 'human_responses.json');

// // Read the JSON file
// fs.readFile(filePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error('Error reading the JSON file:', err);
//   } else {
//     try {
//       // Parse the JSON data
//       const jsonData = JSON.parse(data);

//       // Access the 'content' property and display it in the console
//       if (jsonData.history && jsonData.history.length > 0) {
//         const contentValue = jsonData.history[0].content;
//         console.log('Content Value:', contentValue);
//       } else {
//         console.error('No data found in the JSON file.');
//       }
//     } catch (parseError) {
//       console.error('Error parsing JSON data:', parseError);
//     }
//   }
// });

let HISTORY = [];

// Read the JSON file with human responses
const jsonContent = fs.readFileSync('/Users/seansanchez/Desktop/human_responses.json');
const humanResponses = JSON.parse(jsonContent).history;

// Extract the "content" values
const contentValues = humanResponses.map(response => response.content);

// Construct the system instruction
const systemInstruction = `You are an AI that will tell a three-minute story to the audience about AI and Humans. 
The story needs to include these responses which were given by the humans
from the audience, ${contentValues.map(content => `"${content}"`).join(', ')}`;

// Push the system instruction to your chat history
HISTORY.push({
  "role": "system",
  "content": systemInstruction
});

console.log(HISTORY);