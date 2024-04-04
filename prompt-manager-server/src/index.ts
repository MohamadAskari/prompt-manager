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
  updatedAt: string,
}

function validatePrompt(prompt: Prompt): boolean {
    const requiredFields = [
      "title",
      "description",
      // "temprature",
      // "top_p",
      // "max_tokens",
      // "threshold",
      "status",
    ];

    if (requiredFields.some((field) => !prompt[field as keyof typeof prompt])) {
      return false;
    }
    if (prompt.threshold > 1 && prompt.threshold < 0) {
      return false
    } 
    if (prompt.top_p > 1 && prompt.top_p < 0) {
      return false
    } 
    if (prompt.max_tokens < 0) {
      return false
    } 
    if (prompt.temprature > 1 && prompt.temprature < 0) {
      return false
    } 

    return true;
}

app.get("/api/prompts/favorites", async (req, res) => {
    const keys: Array<string> = await client.sendCommand(["keys", "*"]);
  
    try {
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
    } catch (error) {
      res.status(500).send("Internal server error");
    }    
  });


app.get("/api/prompts", async (req, res) => {
  const keys: Array<string> = await client.sendCommand(["keys", "*"]);

  try {
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
  } catch (error) {
    res.status(500).send("Internal server error");
  }
  
});

app.post("/api/prompts", async (req, res) => {
  const { title, description, temprature, top_p, max_tokens, threshold, status, isFavorite, createdAt, updatedAt } = req.body;
  
  const id = uuidv4();
  const p: Prompt = {
    id, title, description, temprature, top_p, max_tokens, threshold, status, isFavorite, createdAt, updatedAt 
  }
  if (!validatePrompt(p)) {
    return res.status(400).send({message: "Missing required fields or invalid data"});
  }

  try {
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

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).send({message: "ID must be a valid UUID"});
  }

  const prompt = await client.get(id);
  if (!prompt) {
    return res.status(404).send({message: "ID does not exist"});
  }
  const createdAt: string = JSON.parse(prompt).createdAt;

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
    client.set(id, JSON.stringify(updated));
    res.json(updated);
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

app.delete("/api/prompts/:id", async (req, res) => {
  const id = req.params.id;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return res.status(400).send({message: "ID must be a valid UUID"});
  }
  
  if (!id) {
    return res.status(400).send("ID field required");
  }

  try {
    const prompt = await client.get(id);
    if (!prompt) {
      return res.status(404).send({message: "ID does not exist"});
    }
    client.del(id);
    res.status(204).json({
      message: "Resource successfully deleted",
    });
  } catch (error) {
    res.status(500).send("Oops, something went wrong");
  }
});

export default app;