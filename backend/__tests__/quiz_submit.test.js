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

describe('POST /quiz/submit', () => {
    it('should calculate score and return feedback', async () => {
        const mockAnswers = [
            { question_id: 1, selected_option: 'A' },
            { question_id: 2, selected_option: 'B' },
        ];

        Pool().query.mockResolvedValueOnce({ rows: [{ correct_option: 'A' }] });
        Pool().query.mockResolvedValueOnce({ rows: [{ correct_option: 'C' }] });

        const response = await request(app)
            .post('/quiz/submit')
            .send({ answers: mockAnswers });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Quiz submitted!');
        expect(response.body).toHaveProperty('score');
        expect(response.body).toHaveProperty('feedback');
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/quiz/submit')
            .send({ answers: [{ question_id: 1, selected_option: 'A' }] });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error.' });
    });
});
