const request = require('supertest');
const { app, server } = require('../server');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
});

describe('POST /update-profile', () => {
    const token = jwt.sign({ id: 1, email: 'test@example.com' }, SECRET_KEY, { expiresIn: '1h' });
    const userData = {
        name: 'John Doe',
        age: 25,
        grade: 4,
        avatar: 'avatar.png',
    };

    it('should update profile successfully', async () => {
        Pool().query.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, ...userData }] });

        const response = await request(app)
            .post('/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Profile updated successfully', user: { id: 1, ...userData } });
    });

    it('should return 400 if any field is missing', async () => {
        const response = await request(app)
            .post('/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'John Doe', age: 25, grade: 4 });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'All fields, including avatar, are required!' });
    });

    it('should return 400 if user not found or update failed', async () => {
        Pool().query.mockResolvedValueOnce({ rowCount: 0 });

        const response = await request(app)
            .post('/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'User not found or update failed' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const response = await request(app)
            .post('/update-profile')
            .set('Authorization', `Bearer ${token}`)
            .send(userData);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: '⚠ Failed to update profile' });
    });
});
