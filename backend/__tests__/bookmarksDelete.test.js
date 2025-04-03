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

describe('DELETE /bookmarks/:id', () => {
    it('should delete a bookmark and return 200', async () => {
        const mockDeletedBookmark = {
            id: 1,
            audiobook_id: 10,
            student_id: 1,
            name: "Chapter 1",
            time: "00:30",
            created_at: "2025-03-23T10:00:00Z"
        };

        Pool().query.mockResolvedValueOnce({ rows: [mockDeletedBookmark], rowCount: 1 });

        const response = await request(app)
            .delete('/bookmarks/1')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ bookmark: mockDeletedBookmark });
    });

    it('should return 404 if bookmark does not exist or user is not authorized', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

        const response = await request(app)
            .delete('/bookmarks/99')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Bookmark not found or not authorized." });
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app).delete('/bookmarks/1');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: "Access denied. No token provided." });
    });

    it('should return 403 if an invalid token is provided', async () => {
        jwt.verify.mockImplementationOnce(() => {
            throw new Error('Invalid token');
        });

        const response = await request(app)
            .delete('/bookmarks/1')
            .set('Authorization', 'Bearer invalid_token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: "Invalid token." });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .delete('/bookmarks/1')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal server error." });
    });
});
