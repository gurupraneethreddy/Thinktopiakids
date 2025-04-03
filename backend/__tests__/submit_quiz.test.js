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

describe('POST /submit-quiz', () => {
    it('should record a quiz attempt successfully', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [{ next_attempt: 1 }] }); // Mock latest attempt number
        Pool().query.mockResolvedValueOnce({}); // Mock successful insert

        const response = await request(app)
            .post('/submit-quiz')
            .send({ student_id: 1, quiz_id: 2, score: 80 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Quiz attempt recorded successfully' });
    });

    it('should return 400 if student_id is missing', async () => {
        const response = await request(app)
            .post('/submit-quiz')
            .send({ quiz_id: 2, score: 80 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Student ID is required' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/submit-quiz')
            .send({ student_id: 1, quiz_id: 2, score: 80 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Failed to record quiz attempt' });
    });
});
