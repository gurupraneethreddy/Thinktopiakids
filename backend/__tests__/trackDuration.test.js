const request = require("supertest");
const { app, server } = require("../server");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

jest.mock("pg", () => {
  const mPool = { query: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

// Mock JWT verification to return a valid user
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({ id: 1 })), // Mock user ID
}));

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /track-duration/:audiobookId", () => {
  it("should create a new track record when none exists", async () => {
    Pool().query
      .mockResolvedValueOnce({ rows: [] }) // No existing record
      .mockResolvedValueOnce({ rows: [{ studentid: 1, audiobookid: 10, duration: 30 }] });

    const response = await request(app)
      .post("/track-duration/10")
      .set("Authorization", "Bearer valid_token")
      .send({ duration: 30 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "New track record created successfully.",
      track: { studentid: 1, audiobookid: 10, duration: 30 },
    });
  });

  it("should update an existing track duration", async () => {
    Pool().query
      .mockResolvedValueOnce({ rows: [{ studentid: 1, audiobookid: 10, duration: 40 }] }) // Existing record
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/track-duration/10")
      .set("Authorization", "Bearer valid_token")
      .send({ duration: 20 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Duration updated successfully.",
      duration: 60, // 40 + 20
    });
  });

  it("should return 400 if duration is missing", async () => {
    const response = await request(app)
      .post("/track-duration/10")
      .set("Authorization", "Bearer valid_token")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Missing duration in request body." });
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).post("/track-duration/10").send({ duration: 30 });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Access denied. No token provided." });
  });

  it("should return 403 if an invalid token is provided", async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const response = await request(app)
      .post("/track-duration/10")
      .set("Authorization", "Bearer invalid_token")
      .send({ duration: 30 });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Invalid token." });
  });

  it("should return 500 for database errors", async () => {
    Pool().query.mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .post("/track-duration/10")
      .set("Authorization", "Bearer valid_token")
      .send({ duration: 30 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal server error." });
  });
});
