import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/register';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';

jest.mock('../lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));

// Mock för User med newUser
jest.mock('../models/User', () => {
  const mockSave = jest.fn();
  
  const MockUser = jest.fn().mockImplementation(() => ({
    save: mockSave,
  }));
  
  // Lägg till findOne som en static method
  (MockUser as any).findOne = jest.fn();
  
  return {
    __esModule: true,
    default: MockUser,
  };
});

jest.mock('bcryptjs', () => ({ hash: jest.fn() }));

describe('/api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    (User.findOne as jest.Mock).mockResolvedValueOnce(true); // email exists

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "be original" });
  });

  it('returns 400 if username already exists', async () => {
    (User.findOne as jest.Mock)
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
    (User.findOne as jest.Mock).mockResolvedValue(null); // email & username ok
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    
    // Mocka User konstruktorn
    const mockSave = jest.fn().mockResolvedValue(undefined);
    (User as jest.MockedClass<typeof User>).mockImplementation(() => ({
      save: mockSave,
    } as any));

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ message: "all gwent good!" });
    expect(mockSave).toHaveBeenCalled();
    // Verifiera att User konstruktorn anropas
    expect(User).toHaveBeenCalledWith({
      username: 'Test',
      email: 'test@test.com',
      password: 'hashedpass'
    });
  });

  it('returns 400 on MongoServerError duplicate key', async () => {
    const mongoError = new MongoServerError({ message: 'Duplicate key' });
    mongoError.code = 11000;

    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    
    const mockSave = jest.fn().mockRejectedValue(mongoError);
    (User as jest.MockedClass<typeof User>).mockImplementation(() => ({
      save: mockSave,
    } as any));

    const { req, res } = createMocks({
      method: 'POST',
      body: { username: 'Test', email: 'test@test.com', password: '123' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "email or username laready taken" });
  });

  it('returns 500 on unexpected errors', async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpass');
    
    const mockSave = jest.fn().mockRejectedValue(new Error('Unexpected error'));
    (User as jest.MockedClass<typeof User>).mockImplementation(() => ({
      save: mockSave,
    } as any));

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