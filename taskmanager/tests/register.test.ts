import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/register';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';

// Mocka ALLT först
jest.mock('../lib/mongodb', () => ({ 
  __esModule: true, 
  default: jest.fn() 
}));

jest.mock('bcryptjs', () => ({ 
  hash: jest.fn() 
}));

// Skapa mock functions separat
const mockFindOne = jest.fn();
const mockSave = jest.fn();

// Mocka User-modellen med en funktion som returnerar klassen
jest.mock('../models/User', () => ({
  __esModule: true,
  default: class User {
    username: string;
    email: string;
    password: string;
    save: jest.Mock;

    constructor({ username, email, password }: { username: string; email: string; password: string }) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.save = mockSave;
    }

    static findOne = mockFindOne;
  }
}));

describe('/api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockClear();
    mockSave.mockClear();
    (bcrypt.hash as jest.Mock).mockClear();
  });

  it('returns 400 if any field is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: '', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "whoops! fill in all fields" });
  });

  it('returns 400 if email already exists', async () => {
    mockFindOne.mockResolvedValueOnce(true); // email exists
    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "be original" });
  });

  it('returns 400 if username already exists', async () => {
    mockFindOne
      .mockResolvedValueOnce(null) // email check ok
      .mockResolvedValueOnce(true); // username exists

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "username already in use" });
  });

  it('returns 201 on successful registration', async () => {
    mockFindOne.mockResolvedValue(null); // email & username ok
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    mockSave.mockResolvedValue(undefined);

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: "all gwent good!" });
    expect(mockSave).toHaveBeenCalled();
  });

  it('returns 400 on MongoServerError duplicate key', async () => {
    const mongoError = new MongoServerError({ message: 'Duplicate key' });
    mongoError.code = 11000;

    mockFindOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    mockSave.mockRejectedValueOnce(mongoError);

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "email or username laready taken" });
  });

  it('returns 500 on unexpected errors', async () => {
    mockFindOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    mockSave.mockRejectedValue(new Error('Unexpected error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: " something went wrong :( " });
  });

  it('returns 405 if method is not POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: "Only POST requests allowed" });
  });
});