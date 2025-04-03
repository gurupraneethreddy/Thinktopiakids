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
        id: 1,
        grade: 4, // Ensure this matches the test case
    })),
}));

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('GET /audiobooks/:subject', () => {
    it('should return a list of audiobooks for the given subject and grade', async () => {
        const mockAudiobooks = [
            { id: 1, title: 'Math Basics', subject: 'math', grade: 4, difficulty: 'Easy' },
            { id: 2, title: 'Advanced Math', subject: 'math', grade: 4, difficulty: 'Hard' },
        ];

        Pool().query.mockResolvedValueOnce({ rows: mockAudiobooks });

        const response = await request(app)
            .get('/audiobooks/math')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAudiobooks);
    });

    it('should return 404 if no audiobooks are found', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .get('/audiobooks/science')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'No audiobooks found.' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .get('/audiobooks/math')
            .set('Authorization', 'Bearer valid_token');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error.' });
    });
});
