const request = require('supertest');
const { app, server } = require('../server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

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

describe('POST /login', () => {
    it('should log in a registered user with correct credentials', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10), // Mock hashed password
            grade: 4,
        };

        Pool().query.mockResolvedValueOnce({ rows: [mockUser] });
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
        jest.spyOn(jwt, 'sign').mockReturnValue('mock_token');

        const response = await request(app).post('/login').send({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful!');
        expect(response.body).toHaveProperty('token', 'mock_token');
    });

    it('should return 404 if email is not registered', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).post('/login').send({
            email: 'unknown@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Email not registered.' });
    });

    it('should return 401 if password is incorrect', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            grade: 4,
        };

        Pool().query.mockResolvedValueOnce({ rows: [mockUser] });
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

        const response = await request(app).post('/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ error: 'Incorrect password.' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).post('/login').send({
            email: 'test@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Internal server error.' });
    });
});