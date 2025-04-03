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

afterAll((done) => {
  server.close(done);
});

let logSpy, errorSpy;

beforeAll(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

beforeEach(() => {
    jest.clearAllMocks();
    global.otpStore = {};
});

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    console.error.mockRestore();
});

jest.mock('nodemailer', () => {
    return {
        createTransport: jest.fn().mockReturnValue({
            sendMail: jest.fn().mockResolvedValue({}),
        }),
    };
});

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_keyl;';
const generateToken = (user) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('Server Endpoints', () => {
    /* GET /home */
    describe('GET /home', () => {
        it('should return welcome message and total students', async () => {
            const mockTotalStudents = { rows: [{ count: '10' }] };
            Pool().query.mockResolvedValueOnce(mockTotalStudents);

            const response = await request(app).get('/home');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: '🎉 Welcome to the Interactive Learning Platform!',
                totalStudents: '10',
            });
        });

        it('should handle database errors', async () => {
            Pool().query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/home');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: '⚠ Internal server error.' });
        });
    });
});
