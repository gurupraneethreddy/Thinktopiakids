const request = require('supertest');
const { app, server } = require('../server');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

// Mock JWT verification to always return a valid user
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(() => ({
        id: 1, // Mock user ID
    })),
}));

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('POST /bookmarks', () => {
    it('should create a new bookmark and return 201', async () => {
        const mockBookmark = {
            id: 1,
            audiobook_id: 10,
            student_id: 1,
            name: "Chapter 1",
            time: "00:30",
            created_at: "2025-03-23T10:00:00Z"
        };

        Pool().query.mockResolvedValueOnce({ rows: [mockBookmark] });

        const response = await request(app)
            .post('/bookmarks')
            .set('Authorization', 'Bearer valid_token')
            .send({
                audiobook_id: 10,
                name: "Chapter 1",
                time: "00:30"
            });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ bookmark: mockBookmark });
    });

    it('should return 400 if required parameters are missing', async () => {
        const response = await request(app)
            .post('/bookmarks')
            .set('Authorization', 'Bearer valid_token')
            .send({ name: "Chapter 1", time: "00:30" }); // Missing audiobook_id

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Missing required parameters." });
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app).post('/bookmarks').send({
            audiobook_id: 10,
            name: "Chapter 1",
            time: "00:30"
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Access denied. No token provided." });
    });

    it('should return 403 if an invalid token is provided', async () => {
        // Mock JWT verification failure
        jwt.verify.mockImplementationOnce(() => {
            throw new Error('Invalid token');
        });

        const response = await request(app)
            .post('/bookmarks')
            .set('Authorization', 'Bearer invalid_token')
            .send({
                audiobook_id: 10,
                name: "Chapter 1",
                time: "00:30"
            });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: "Invalid token." });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/bookmarks')
            .set('Authorization', 'Bearer valid_token')
            .send({
                audiobook_id: 10,
                name: "Chapter 1",
                time: "00:30"
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal server error." });
    });
});
