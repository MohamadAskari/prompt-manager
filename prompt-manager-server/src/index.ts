import express from "express";
import cors from "cors";
import { client } from "./db";
import { v4 as uuidv4 } from "uuid";


const app = express();

app.use(express.json());
app.use(cors());

interface Prompt {
  id: string;
  title: string;
  description: string;
  temprature: number;
  top_p: number;
  max_tokens: number;
  threshold: number;
  status: string;
  isFavorite: boolean;
  createdAt: string,
  updatedAt: string
}

app.get("/api/prompts/favorites", async (req, res) => {
    const keys: Array<string> = await client.sendCommand(["keys", "*"]);
  
    //   console.log(keys[0]);
    let prompts: Array<Prompt> = [];
    for (let index = 0; index < keys.length; index++) {
      const element = keys[index];
      const newPrompt = await client.get(element);
      if (!newPrompt) {
        return;
      }
      const prompt: Prompt = await JSON.parse(newPrompt);
      if (prompt.isFavorite){
        prompts.push(prompt);
      }
    }
    res.json(prompts);
  });

app.get("/api/prompts", async (req, res) => {
  const keys: Array<string> = await client.sendCommand(["keys", "*"]);

  //   console.log(keys[0]);
  let prompts: Array<Prompt> = [];
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    const newPrompt = await client.get(element);
    if (!newPrompt) {
      return;
    }
    const prompt: Prompt = await JSON.parse(newPrompt);
    prompts.push(prompt);
  }

  res.json(prompts);
});

app.listen(5000, () => {
  console.log("server running on localhost:5000");
});

app.post("/api/prompts", async (req, res) => {
  const { title, description, temprature, top_p, max_tokens, threshold, status, isFavorite, createdAt, updatedAt } = req.body;

//   if (!title || !description || !temprature || !top_p || !max_tokens || !threshold || !status) {
//     return res.status(400).send("All fields are required");
//   }
  try {
    const id = uuidv4();
    const newPrompt: Prompt = {
      id: id,
      title: title,
      description: description,
      temprature: temprature,
      top_p: top_p,
      max_tokens: max_tokens,
      threshold: threshold,
      status: status,
      isFavorite: isFavorite,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
    client.set(id, JSON.stringify(newPrompt));
    res.json(newPrompt);
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.put("/api/prompts/:id", async (req, res) => {
  const { title, description, temprature, top_p, max_tokens, threshold, status, isFavorite, updatedAt } = req.body;
  const id = req.params.id;
  const prompt = await client.get(id);
  if (!prompt) {
    return;
  }
  const createdAt: string = JSON.parse(prompt).createdAt;
//   if (!title || !description || !temprature || !top_p || !max_tokens || !threshold || !status) {
//     return res.status(400).send("All fields are required");
//   }

  if (!id) {
    return res.status(400).send("ID must be a valid UUID");
  }

  try {
    const updated: Prompt = {
      id: id,
      title: title,
      description: description,
      temprature: temprature,
      top_p: top_p,
      max_tokens: max_tokens,
      threshold: threshold,
      status: status,
      isFavorite: isFavorite,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
    console.log(JSON.stringify(updated));
    client.set(id, JSON.stringify(updated));
    res.json(updated);
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.delete("/api/prompts/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).send("ID field required");
  }

  try {
    client.del(id);
    res.json({
      message: "Resource successfully deleted",
    });
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});
