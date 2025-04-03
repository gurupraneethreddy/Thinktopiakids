const request = require('supertest');
const { app, server } = require('../server');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('nodemailer', () => {
    return {
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({}),
        }),
    };
});

const transporter = nodemailer.createTransport();

afterAll((done) => {
    server.close(done);
});

beforeEach(() => {
    jest.clearAllMocks();
    global.otpStore = {};
});

describe('POST /forgot-password', () => {
    it('should send OTP if email is registered', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] });

        const response = await request(app).post('/forgot-password').send({
            email: 'test@example.com',
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: '✅ OTP sent to your email!' });
    });

    it('should return 404 if email is not registered', async () => {
        Pool().query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).post('/forgot-password').send({
            email: 'unknown@example.com',
        });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Email not registered!' });
    });

    it('should return 500 for database errors', async () => {
        Pool().query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app).post('/forgot-password').send({
            email: 'test@example.com',
        });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: '⚠ Failed to send OTP. Try again later.' });
    });
});
