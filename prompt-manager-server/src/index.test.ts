import supertest from "supertest";
import app from "./index";
import { v4 as uuidv4 } from "uuid";
import { client } from "./db";
const request = require("supertest");

describe("Tesing the API", () => {
  describe("GET /api/prompts", () => {
    it("should return a list of prompts", async () => {
      const response = await request(app).get("/api/prompts");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe("GET /api/prompts/favorites", () => {
    it("should return a list of favorite prompts", async () => {
      const response = await request(app).get("/api/prompts/favorites");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array); 
    });
  });

  describe("POST /api/prompts", () => {
    it("should create a new prompt", async () => {
      const newPrompt = {
        title: "Test Prompt",
        description: "This is a test description",
        temprature: 1,
        top_p: 1,
        max_tokens: 1,
        threshold: 1,
        status: "evaluating",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await request(app).post("/api/prompts").send(newPrompt);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(newPrompt)); // Check for expected properties
    });

    it("should return 400 for missing required fields in POST /api/prompts", async () => {
      const newPrompt = {
        description: "This is a test description",
        temprature: 0.7,
        top_p: 1.0,
        max_tokens: 100,
        threshold: 0.0,
        status: "draft",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await request(app).post("/api/prompts").send(newPrompt);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(
        "Missing required fields or invalid data"
      );
    });
  });


  describe("PUT /api/prompts/:id", () => {
    let promptId: string; // Store the ID of a created prompt for update tests

    beforeEach(async () => {
      const newPrompt = {
        title: "Test Prompt",
        description: "This is a test description",
        temprature: 1,
        top_p: 1,
        max_tokens: 1,
        threshold: 1,
        status: "evaluating",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createResponse = await request(app)
        .post("/api/prompts")
        .send(newPrompt);
      promptId = createResponse.body.id;
    });

    it("should update a prompt", async () => {
      const updatedPrompt = {
        title: "Updated Test Prompt",
        description: "This is an updated description",
        temprature: 0.8,
        top_p: 0.9,
        max_tokens: 150,
        threshold: 0.1,
        status: "active",
        isFavorite: true,
        updatedAt: new Date().toISOString(),
      };

      const response = await request(app)
        .put(`/api/prompts/${promptId}`)
        .send(updatedPrompt);

      expect(response.status).toBe(200);
    });
    
    it('should return 404 for PUT /api/prompts/:id with non-existent ID', async () => {
        const nonExistentId = uuidv4(); 
        const updateData = {
          title: 'Updated Test Prompt',
        };
      
        const response = await request(app)
          .put(`/api/prompts/${nonExistentId}`)
          .send(updateData);
      
        expect(response.status).toBe(404);
        expect(response.body.message).toMatch("ID does not exist");
      });

    it('should return 400 for invalid ID in PUT /api/prompts/:id', async () => {
        const invalidId = 'invalid-id';
        const updateData = {
          title: 'Updated Test Prompt',
        };
      
        const response = await request(app)
          .put(`/api/prompts/${invalidId}`)
          .send(updateData);
      
        console.log(response.status)
        expect(response.status).toBe(400);
        expect(response.body.message).toMatch("ID must be a valid UUID");
      });  





  });
    
  describe("DELETE /api/prompts/:id", () => {
    let promptId: string; // Store the ID of a created prompt for deletion tests
  
    beforeEach(async () => {
      const newPrompt = {
        title: "Test Prompt for Deletion",
        description: "This is a test description",
        temprature: 1,
        top_p: 1,
        max_tokens: 1,
        threshold: 1,
        status: "evaluating",
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  
      const createResponse = await request(app)
        .post("/api/prompts")
        .send(newPrompt);
      promptId = createResponse.body.id;
    });
  
    it("should delete a prompt by ID and return 204 (No Content)", async () => {
      const deleteResponse = await request(app).delete(`/api/prompts/${promptId}`);
  
      expect(deleteResponse.status).toBe(204); // No Content expected
      expect(deleteResponse.body).toEqual({}); // Empty body for successful deletion
  
      // Optional: Verify prompt is actually deleted (if your database allows querying)
      // const getResponse = await request(app).get(`/api/prompts/${promptId}`);
      // expect(getResponse.status).toBe(404); // Prompt should be not found
    });
  
    it('should return 404 for DELETE /api/prompts/:id with non-existent ID', async () => {
      const nonExistentId = uuidv4(); 
  
      const deleteResponse = await request(app)
        .delete(`/api/prompts/${nonExistentId}`);
  
      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body.message).toMatch("ID does not exist");
    });
  
    it('should return 400 for invalid ID in DELETE /api/prompts/:id', async () => {
      const invalidId = 'invalid-id';
  
      const deleteResponse = await request(app)
        .delete(`/api/prompts/${invalidId}`);
  
      console.log(deleteResponse.status)
      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body.message).toMatch("ID must be a valid UUID");
    });
  });

  afterAll(done => {
    client.disconnect()
    done()
  })
});
