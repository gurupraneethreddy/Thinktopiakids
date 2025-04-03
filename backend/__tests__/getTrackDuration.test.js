const request = require("supertest");
const { app, server } = require("../server");
const { Pool } = require("pg");

jest.mock("pg", () => {
  const mPool = { query: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /track-duration/:studentid/:audiobookid", () => {
  it("should return the correct duration when a record exists", async () => {
    Pool().query.mockResolvedValueOnce({ rows: [{ duration: 45 }] });

    const response = await request(app).get("/track-duration/1/10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ duration: 45 });
  });

  it("should return 0 if no duration record exists", async () => {
    Pool().query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get("/track-duration/1/10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ duration: 0 });
  });

  it("should return 500 for database errors", async () => {
    Pool().query.mockImplementationOnce(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/track-duration/1/10");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Server error." });
  });
});
