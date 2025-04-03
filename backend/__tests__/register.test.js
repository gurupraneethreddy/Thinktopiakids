
const request = require('supertest');
const { app, server } = require('../server');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

const pool = new Pool();

afterAll((done) => {
    server.close(done);
});

let logSpy, errorSpy;

beforeAll(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
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

describe('Server Endpoints', () => {
    /* POST /register */
    describe('POST /register', () => {
        const mockUser = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            age: 10,
            grade: 4,
            parentName: 'Jane Doe',
            parentEmail: 'jane@example.com',
        };

        it('should register a new student successfully', async () => {
            // First query: check if email is already registered (none found)
            pool.query.mockResolvedValueOnce({ rows: [] });
            // Second query: insert new student
            const hashedPassword = await bcrypt.hash(mockUser.password, 10);
            pool.query.mockResolvedValueOnce({ rows: [{ ...mockUser, password: hashedPassword }] });

            const response = await request(app).post('/register').send(mockUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: '🎉 Registration successful!' });
        });

        it('should return error if fields are missing', async () => {
            const incompleteUser = { ...mockUser, password: undefined };
            const response = await request(app).post('/register').send(incompleteUser);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'All fields are required!' });
        });

        it('should return error if email is already registered', async () => {
            pool.query.mockResolvedValueOnce({ rows: [mockUser] });
            const response = await request(app).post('/register').send(mockUser);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: `Email "john@example.com" is already registered!` });
        });

        it('should return error if age is 12 or older', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            const olderUser = { ...mockUser, age: 12 };
            const response = await request(app).post('/register').send(olderUser);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Student age must be less than 12 years.' });
        });

        it('should return error if grade is greater than 5', async () => {
            pool.query.mockResolvedValueOnce({ rows: [] });
            const higherGradeUser = { ...mockUser, grade: 6 };
            const response = await request(app).post('/register').send(higherGradeUser);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Grade must be 5 or below.' });
        });

        it('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));
            const response = await request(app).post('/register').send(mockUser);
            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: '⚠ Internal server error. Please try again.' });
        });
    });
});
