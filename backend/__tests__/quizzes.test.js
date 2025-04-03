const request = require('supertest');
const { app, server } = require('../server');
const { Pool } = require('pg');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /quizzes', () => {
    it('should return a list of quizzes', async () => {
        const mockQuizzes = [
            { id: 1, title: 'Math Quiz', created_at: '2025-03-23T10:00:00Z' },
            { id: 2, title: 'Science Quiz', created_at: '2025-03-22T12:00:00Z' },
        ];

        Pool().query.mockResolvedValueOnce({ rows: mockQuizzes });

        const response = await request(app).get('/quizzes');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ quizzes: mockQuizzes });
    });

    it('should return an empty list if no quizzes exist', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get('/quizzes');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ quizzes: [] });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app).get('/quizzes');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: '⚠ Internal server error. Failed to load quizzes.' });
    });
});