// import necessary libraries for server

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

// npm package dotenv to import environment var

require("dotenv").config();

// super secret key

const apiKey = process.env.OPENAI_API_KEY;

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: apiKey,
});

// Server setup

const app = express();
const port = 8000;
app.use(express.json());
app.use(cors());
const fineTuneID = "file-SK3f8xsAvPkMh2Wc5yVJhlX6";
const systemMess =
  "";
var discussions = [
  {
    role: "system",
    content: systemMess,
  },
];

async function introduceSelf(character, introduction) {
  const model = "gpt-3.5-turbo";
  //message from user
  discussions[0].content = character;
  discussions.push({ role: "user", content: introduction });
  const completion = await openai.chat.completions.create({
    model,
    messages: discussions,
  });

  discussions.push({
    role: "assistant",
    content: completion.choices[0].message.content,
  });
  console.log(discussions);
  return completion.choices;
}

// starts api request to openai, defining its system and taking message from user as input var
async function sendMessage(input) {
  const model = "gpt-3.5-turbo";
  // message from user
  discussions.push({ role: "user", content: input });

  const completion = await openai.chat.completions.create({
    model,
    messages: discussions,
  });

  discussions.push({
    role: "assistant",
    content: completion.choices[0].message.content,
  });
  console.log(discussions);
  return completion.choices;
}

// async function upload() {
//   const file = await openai.files.create({
//     file: fs.createReadStream("sarcastic-bot.jsonl"),
//     purpose: "fine-tune",
//   });
//   console.log(file);
// }

// async function fineTune() {
//   const ft = await openai.fineTuning.jobs.listEvents(
//     "ftjob-lqFC1Wqv0NVsEdjluQyz3T6T"
//   );
//   console.log(ft);
// }

// endpoint for ChatGPT
app.post("/api", async (req, res) => {
  // deconstruct prompt from client
  const { prompt } = req.body;
  const answer = await sendMessage(prompt);
  res.status(200).json({
    message: answer,
  });
});

app.put("/api", async (req, res) => {
  const { character, introduction } = req.body;
  const intro = await introduceSelf(character, introduction);
  res.json({
    message: intro,
  });
});

app.delete("/api", async (req, res) => {
  if (discussions.length != 1) {
    // starting from index 1, remove other elements except system message
    discussions.splice(1, discussions.length);
  }
  res.json({
    message: "Chat restart.",
  });
});

// app.delete()

app.listen(port, () => {
  console.log("Server is listening on " + port);
});
