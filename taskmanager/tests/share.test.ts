import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/share';
import Note from '../models/Note';

jest.mock('../lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve())
}));

jest.mock('../models/Note', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  }
}));
describe('/api/share', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('should return 405 if method is not POST', async () => {
      const { req, res } = createMocks({ method: 'GET' });
      await handler(req, res);
  
      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({ success: false, message: 'Method not allowed' });
    });
  
    it('should return 400 if noteId or email is missing', async () => {
      const { req, res } = createMocks({ 
        method: 'POST', 
        body: { noteId: '123' } // email saknas
      });
      await handler(req, res);
  
      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ success: false, message: 'Missing noteId or email' });
    });
  
    it('should return 404 if note not found', async () => {
      (Note.findById as jest.Mock).mockResolvedValueOnce(null);
  
      const { req, res } = createMocks({
        method: 'POST',
        body: { noteId: '123', email: 'test@example.com' }
      });
  
      await handler(req, res);
  
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({ success: false, message: 'Note not found' });
    });
  
    it('should add email to sharedWith and return 200', async () => {
      const fakeNote = {
        sharedWith: [],
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
  
      (Note.findById as jest.Mock).mockResolvedValueOnce(fakeNote);
  
      const { req, res } = createMocks({
        method: 'POST',
        body: { noteId: '123', email: 'test@example.com' }
      });
  
      await handler(req, res);
  
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true, sharedWith: ['test@example.com'] });
      expect(fakeNote.save).toHaveBeenCalled();
    });
  
    it('should not duplicate email in sharedWith', async () => {
      const fakeNote = {
        sharedWith: ['test@example.com'],
        save: jest.fn().mockResolvedValueOnce(undefined),
      };
  
      (Note.findById as jest.Mock).mockResolvedValueOnce(fakeNote);
  
      const { req, res } = createMocks({
        method: 'POST',
        body: { noteId: '123', email: 'test@example.com' }
      });
  
      await handler(req, res);
  
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true, sharedWith: ['test@example.com'] });
      expect(fakeNote.save).not.toHaveBeenCalled();
    });
  });
  