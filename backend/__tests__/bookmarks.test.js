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

describe('GET /bookmarks/:audiobookId', () => {
    it('should return a list of bookmarks for the given audiobook and student', async () => {
        const mockBookmarks = [
            { id: 1, audiobook_id: 10, student_id: 1, timestamp: "00:30", created_at: "2025-03-23T10:00:00Z" },
            { id: 2, audiobook_id: 10, student_id: 1, timestamp: "01:15", created_at: "2025-03-23T10:05:00Z" },
        ];

        Pool().query.mockResolvedValueOnce({ rows: mockBookmarks });

        const response = await request(app)
            .get('/bookmarks/10')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ bookmarks: mockBookmarks });
    });

    it('should return an empty list if no bookmarks exist', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .get('/bookmarks/10')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ bookmarks: [] });
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app).get('/bookmarks/10');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Access denied. No token provided." });
    });

    it('should return 403 if an invalid token is provided', async () => {
        // Mock JWT verification failure
        jwt.verify.mockImplementationOnce(() => {
            throw new Error('Invalid token');
        });

        const response = await request(app)
            .get('/bookmarks/10')
            .set('Authorization', 'Bearer invalid_token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: "Invalid token." });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .get('/bookmarks/10')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal server error." });
    });
});
