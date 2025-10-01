import { createMocks } from 'node-mocks-http';

// ANVÄND RELATIVA SÖKVÄGAR - inga @/
jest.mock('../lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve())
}));

jest.mock('../models/Note', () => ({
  __esModule: true,
  default: {
    find: jest.fn(() => ({
      sort: jest.fn(() => Promise.resolve([]))
    })),
    create: jest.fn(() => Promise.resolve({}))
  }
}));

// Importera handler med relativ sökväg
import handler from '../pages/api/notes';

describe('/api/notes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 400 if no userId provided', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {}
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'User not logged in'
      });
    });

    it('should return 200 with notes when userId provided', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { userId: 'test-user-123' }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
    });
  });

  describe('POST', () => {
    it('should create note successfully', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          title: 'Test Note',
          content: 'Test Content', 
          userId: '123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
    });

    it('should return 400 if no title provided', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          content: 'Test content',
          userId: 'test-user-123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Title is required'
      });
    });
  });
});