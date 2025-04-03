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

describe('GET /dashboard', () => {
    it('should return user details if authenticated', async () => {
        const mockUser = {
            id: 1,
            name: 'John Doe',
            email: 'test@example.com',
            age: 20,
            grade: 4,
            avatar: 'avatar.png',
        };

        Pool().query.mockResolvedValueOnce({ rows: [mockUser] });
        const token = jwt.sign({ id: 1, email: 'test@example.com' }, SECRET_KEY, { expiresIn: '1h' });

        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ user: mockUser });
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app).get('/dashboard');

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Access denied. No token provided.' });
    });

    it('should return 403 for invalid token', async () => {
        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', 'Bearer invalid_token');

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ error: 'Invalid token.' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockImplementationOnce(() => {
            throw new Error('Database error');
        });

        const token = jwt.sign({ id: 1, email: 'test@example.com' }, SECRET_KEY, { expiresIn: '1h' });

        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: '⚠ Internal server error.' });
    });
});
