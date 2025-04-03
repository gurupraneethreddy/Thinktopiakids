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

describe('GET /quiz/start/:quiz_id', () => {
    it('should return a list of 10 random questions for a quiz', async () => {
        const mockQuestions = [
            { id: 1, question_text: 'What is 2+2?', option_a: '1', option_b: '2', option_c: '3', option_d: '4' },
            { id: 2, question_text: 'What is the capital of France?', option_a: 'Berlin', option_b: 'Madrid', option_c: 'Paris', option_d: 'Rome' },
        ];

        Pool().query.mockResolvedValueOnce({ rows: mockQuestions });

        const response = await request(app).get('/quiz/start/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ questions: mockQuestions });
    });

    it('should return an empty list if no questions exist for the quiz', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).get('/quiz/start/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ questions: [] });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app).get('/quiz/start/1');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error.' });
    });
});
