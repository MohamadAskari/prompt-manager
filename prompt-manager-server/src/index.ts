import express from "express";
import cors from "cors";
import { client } from "./db";
import { v4 as uuidv4 } from "uuid";


const app = express();

app.use(express.json());
app.use(cors());

enum PromptStatus {
  YetToEvaluate = "Yet to Evaluate",
  Evaluating = "Evaluating",
  BestPrompt = "Best Prompt"
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  temprature: number;
  top_p: number;
  max_tokens: number;
  threshold: number;
  status: PromptStatus;
  isFavorite: boolean;
  createdAt: string,
  updatedAt: string,
}

function validatePrompt(prompt: Prompt): boolean {
    const requiredFields = [
      "title",
      "description",
      "temprature",
      "top_p",
      "max_tokens",
      "threshold",
      "status",
      "isFavorite",
    ];

    if (requiredFields.some((field) => prompt[field as keyof typeof prompt] === undefined)) {
      return false;
    }

    if (!Object.values(PromptStatus).includes(prompt.status)) {
      return false;
    }

    if (prompt.threshold > 1 ||
        prompt.threshold < 0 ||
        prompt.top_p > 1 ||
        prompt.top_p < 0 ||
        prompt.max_tokens < 0 || 
        prompt.temprature > 1 ||
        prompt.temprature < 0) {
      
          return false
    }

    return true;
}

async function getPrompts(withFavorites: boolean) {

    const keys: Array<string> = await client.sendCommand(["keys", "*"]);
    const prompts: Prompt[] = [];
    for (let index = 0; index < keys.length; index++) {
      const promptData = await client.get(keys[index]);
      if (!promptData) continue;
      const prompt: Prompt = await JSON.parse(promptData);
      if (withFavorites && prompt.isFavorite) {
        prompts.push(prompt);
      } else if (!withFavorites) {
        prompts.push(prompt);
      }
    }
    return prompts;
  
}

app.get("/api/prompts/favorites", async (req, res) => {
    try {
      const prompts: Array<Prompt> = await getPrompts(true);
      res.json(prompts);
    } catch (error) {
      res.status(500).send("Internal server error");
    }    
  });


app.get("/api/prompts", async (req, res) => {
  try {
    let prompts: Array<Prompt> = await getPrompts(false);
    res.json(prompts);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
  
});

app.post("/api/prompts", async (req, res) => {
  const { title, description, temprature, top_p, max_tokens, threshold, status, isFavorite, createdAt, updatedAt } = req.body;
  
  try {
    const newPrompt: Prompt = {
      id: uuidv4(),
      title: title,
      description: description,
      temprature: temprature,
      top_p: top_p,
      max_tokens: max_tokens,
      threshold: threshold,
      status: status,
      isFavorite: isFavorite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!validatePrompt(newPrompt)) {
      return res.status(400).send({message: "Missing required fields or invalid data"});
    }
    client.set(newPrompt.id, JSON.stringify(newPrompt));
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
      updatedAt: new Date().toISOString(),
    };
    if (!validatePrompt(updated)) {
      return res.status(400).send({message: "Missing required fields or invalid data"});
    }
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