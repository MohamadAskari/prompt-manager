import React, { useEffect, useState } from "react";

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
  createdAt: string;
  updatedAt: string;
}

// {
//   "id": "231c2d9d-951e-4596-a6d7-8fc65a8e0215",
//   "title": "MAMAD",
//   "description": "AS",
//   "top_p": 1,
//   "max_tokens": 12,
//   "threshold": 0.6,
//   "status": "best prompt"
// }

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [temprature, setTemprature] = useState<number | null>(null);
  const [top_p, setTop_p] = useState<number | null>(null);
  const [max_tokens, setMax_tokens] = useState<number | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [status, setStatus] = useState<PromptStatus | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  
  const [favotires, setFavorites] = useState<Prompt[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selected, setSelected] = useState<Prompt | null>(null);
 

  function reset() {
    setTitle("");
    setDescription("");
    setTemprature(null);
    setTop_p(null);
    setMax_tokens(null);
    setThreshold(null);
    setStatus(null);
    setIsFavorite(false);
    setSelected(null);
    setCreatedAt("");
    setUpdatedAt("");
    return;
  }

  function handleChange(val: boolean) {
    setIsFavorite(val);
  }

  useEffect(() => {
    const fetchData = async (url: string, setter: any) => {
      try {
        const response = await fetch(url);
        const data: Prompt[] = await response.json();
        setter(data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData("http://localhost:5000/api/prompts", setPrompts);
    fetchData("http://localhost:5000/api/prompts/favorites", setFavorites);
  }, []);

  const handleSelect = async (prompt: Prompt) => {
    setSelected(prompt);
    setTitle(prompt.title);
    setDescription(prompt.description);
    setTemprature(prompt.temprature);
    setTop_p(prompt.top_p);
    setMax_tokens(prompt.max_tokens);
    setThreshold(prompt.threshold);
    setStatus(prompt.status);
    setIsFavorite(prompt.isFavorite);
    setCreatedAt(prompt.createdAt);
    setUpdatedAt(prompt.updatedAt);
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selected) {
      return;
    }
    const promptId: string = selected.id;
    try {
      const response = await fetch(
        `http://localhost:5000/api/prompts/${promptId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            description,
            temprature,
            top_p,
            max_tokens,
            threshold,
            status,
            isFavorite,
            updatedAt: null
          }),
        }
      );

      const newPrompt = await response.json();

      const isInFavorites = favotires.some(
        (element) => newPrompt.id === element.id
      );

      if (newPrompt.isFavorite && !isInFavorites) {
        setFavorites([newPrompt, ...favotires]);
      } else if (!newPrompt.isFavorite && isInFavorites) {
        setFavorites(favotires.filter((prompt) => prompt.id !== newPrompt.id));
      } else if (newPrompt.isFavorite && isInFavorites){
        for (let index = 0; index < favotires.length; index++) {
          const element = favotires[index];
          if (element.id === selected.id) {
            favotires[index] = newPrompt;
          }
        }
      }
      for (let index = 0; index < prompts.length; index++) {
        const element = prompts[index];
        if (element.id === selected.id) {
          prompts[index] = newPrompt;
        }
      }
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  function handleX(id: string, event: React.MouseEvent) {
    event.stopPropagation();

    try {
      fetch(`http://localhost:5000/api/prompts/${id}`, {
        method: "DELETE",
      });
      const updatedPrompts = prompts.filter((prompt) => prompt.id !== id);
      const updatedFavorites = favotires.filter((prompt) => prompt.id !== id);
      if (selected && selected.id === id) {
        reset();
      }
      setFavorites(updatedFavorites);
      setPrompts(updatedPrompts);
    } catch (error) {
      console.log(error);
    }
  }

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          temprature,
          top_p,
          max_tokens,
          threshold,
          status,
          isFavorite,
          createdAt: null,
          updatedAt: null
        }),
      });

      const newPrompt: Prompt = await response.json();
      setPrompts([newPrompt, ...prompts]);
      if (newPrompt.isFavorite) {
        setFavorites([newPrompt, ...favotires]);
      }
      reset();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="app-container">
      <div className="prompts-container">
        <button className="new-prompt-button" onClick={reset}>
          {" "}
          <i className="fas fa-pencil"></i> New Prompt
        </button>
        {!prompts
          ? null
          : prompts.map((prompt) => (
              <div className="prompt" onClick={() => handleSelect(prompt)}>
                <div className="prompts-header">
                  <h2>{prompt.title}</h2>
                  <button
                    className="close-btn"
                    onClick={(event) => handleX(prompt.id, event)}
                  >
                    x
                  </button>
                </div>
                <p>{prompt.description}</p>
              </div>
            ))}
      </div>

      <form
        className="prompt-form"
        onSubmit={selected ? handleEdit : handleAdd}
      >
        <h2>Title</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        />
        <h2>Description</h2>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          rows={10}
          required
        />
        <div className="form-row">
          <div className="col">
            <h2>Temperature:</h2>
            <input
              value={temprature !== null ? temprature : ""}
              onChange={(event) =>
                setTemprature(parseFloat(event.target.value))
              }
              type="number"
              step="0.01"
              min="0"
              max="1"
              name="temprature"
              className="form-control"
              placeholder="0 to 1"
              required
            />
          </div>
          <div className="col">
            <h2>Top_p:</h2>
            <input
              value={top_p !== null ? top_p : ""}
              onChange={(event) => setTop_p(parseFloat(event.target.value))}
              type="number"
              step="0.01"
              min="0"
              max="1"
              name="top_p"
              className="form-control"
              placeholder="0 to 1"
              required
            />
          </div>
          <div className="col">
            <h2>Max Tokens:</h2>
            <input
              value={max_tokens !== null ? max_tokens : ""}
              onChange={(event) => setMax_tokens(parseInt(event.target.value))}
              type="number"
              name="max_tokens"
              min="0"
              className="form-control"
              placeholder="min 0"
              required
            />
          </div>
          <div className="col">
            <h2>Threshold:</h2>
            <input
              value={threshold !== null ? threshold : ""}
              onChange={(event) => setThreshold(parseFloat(event.target.value))}
              type="number"
              step="0.01"
              min="0"
              max="1"
              name="threshold"
              className="form-control"
              placeholder="0 to 1"
              required
            />
          </div>
          <div className="col">
            <h2>Status:</h2>
            <select
              value={status !== null ? status : ""}
              onChange={(event) => setStatus(event.target.value as PromptStatus)}
              name="status"
              className="form-control status-select"
              required
            >
              <option value="" selected disabled>
                Select
              </option>
              <option value="Yet to Evaluate">Yet to Evaluate</option>
              <option value="Evaluating">Evaluating</option>
              <option value="Best Prompt">Best Prompt</option>
            </select>
          </div>
          <div className="col">
            <label className="wraper" htmlFor="something">
              <span className="label-text">Add to favorites:</span>
              <div className="switch-wrap">
                <input
                  onChange={() => handleChange(!isFavorite)}
                  type="checkbox"
                  id="something"
                  checked={isFavorite}
                />
                <div className="switch"></div>
              </div>
            </label>
          </div>
          { selected ? (
            <>
            <div className="col">
              <div className="created-at-container">
                <h2>{selected ? "Created At:" : ''}</h2>
                <p>{selected ? selected.createdAt : ''}</p>
              </div>  
            </div>
            <div className="col">
              <h2>{selected ? "Last Edited At:" : ''}</h2>
              <p>{selected ? selected.updatedAt : ''}</p>
            </div>
            </> 
          )
          : ''
          }
        </div>

        {selected ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button onClick={reset}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Add</button>
        )}
      </form>
      <div className="favorites-container">
        <div className="fav-header">
          Favorites    
          <span role="img" aria-label="heart">
            ❤️
          </span>{" "}
        </div>
        {!favotires
          ? null
          : favotires.map((prompt) => (
              <div className="prompt" onClick={() => handleSelect(prompt)}>
                <div className="prompts-header">
                  <h2>{prompt.title}</h2>
                </div>
                <p>{prompt.description}</p>
              </div>
            ))}
      </div>
    </div>
  );
}
