const request = require("supertest");
const app = require("../server"); // Adjust the path if needed

describe("Audiobooks API", () => {
  it("should return a list of audiobooks", async () => {
    const response = await request(app).get("/audiobooks/English");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
