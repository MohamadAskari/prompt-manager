# Prompt Manager - A Full Stack Application
This document describes the Prompt Manager, a full-stack application that allows you to manage your creative prompts. You can create prompts, save them for later use, and mark frequently used ones as favorites. You can set various parameters like temperature, top p, max tokens and threshold. You can also mark your prompt's status to keep track of that prompt's evaluation.   

![Sample Image](https://drive.google.com/uc?export=view&id=1qJ4i5xSz27WLXpCC0xJ7Fe9_Z40B5g1J)

## Technologies Used
### Frontend
* React.js: A JavaScript library for building user interfaces.
* Fetch API: Used for making HTTP requests to the backend API.
* CSS: Styling language for designing the user interface.

### Backend
* Express.js: Web framework for Node.js used to build the RESTful API.
* Redis: In-memory data structure store used as a cache and to store prompt keys.

## Usage
1. clone the repository.
2. Navigate to the project's root directory (/prompt-manager)
3. Run ``` sudo docker compose up ``` 
4. Now navigate to ```http://localhost:3000/```
