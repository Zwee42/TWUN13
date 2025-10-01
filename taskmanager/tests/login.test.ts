import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/login';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

jest.mock('../lib/mongodb', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../models/User', () => ({
  __esModule: true,
  default: { findOne: jest.fn() }
}));
jest.mock('bcryptjs', () => ({ compare: jest.fn() }));

describe('/api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 405 if method is not POST', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('returns 400 if email or password missing', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { email: 'test@test.com' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "u missed a feild?" });
  });

  it('returns 400 if user not found', async () => {
    (User.findOne as unknown as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({ method: 'POST', body: { email: 'test@test.com', password: '123' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "user not found" });
  });

  it('returns 400 if password is wrong', async () => {
    (User.findOne as unknown as jest.Mock).mockResolvedValueOnce({ password: 'hashedpass', name: 'Test', email: 'test@test.com' });
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValueOnce(false);

    const { req, res } = createMocks({ method: 'POST', body: { email: 'test@test.com', password: 'wrong' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: "haha, wrong password" });
  });

  it('returns 200 on successful login', async () => {
    (User.findOne as unknown as jest.Mock).mockResolvedValueOnce({ password: 'hashedpass', name: 'Test', email: 'test@test.com' });
    (bcrypt.compare as unknown as jest.Mock).mockResolvedValueOnce(true);

    const { req, res } = createMocks({ method: 'POST', body: { email: 'test@test.com', password: '123' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: "Login succeful?? yay",
      user: { username: 'Test', email: 'test@test.com' }
    });
  });
});
