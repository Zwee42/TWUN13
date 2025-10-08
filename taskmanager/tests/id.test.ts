import { createMocks } from 'node-mocks-http';
import handler from '../pages/api/id';
import mongoose from 'mongoose';
import Note from '../models/Note';

// Mocka databasen
jest.mock('../lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve())
}));

// Mocka Note-modellen
jest.mock('../models/Note', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
}));

describe('/api/id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //
  // --- GET ---
  //
  it('should return 400 if id is invalid', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: 'not-a-valid-objectid' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Invalid ObjectId' });
  });

  it('should return 404 if note not found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    (Note.findById as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: fakeId }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Note not found' });
  });

  it('should return 200 with note if found', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const fakeNote = { _id: fakeId, title: 'Test', content: 'Hello' };
    (Note.findById as jest.Mock).mockResolvedValueOnce(fakeNote);

    const { req, res } = createMocks({
      method: 'GET',
      query: { id: fakeId }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(fakeNote);
  });

  //
  // --- PUT ---
  //
  it('should return 400 if title is missing on PUT', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: fakeId },
      body: { content: 'Only content' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Title is required' });
  });

  it('should update note successfully on PUT', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const updatedNote = { _id: fakeId, title: 'Updated', content: 'New Content' };
    (Note.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedNote);

    const { req, res } = createMocks({
      method: 'PUT',
      query: { id: fakeId },
      body: { title: 'Updated', content: 'New Content' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(updatedNote);
  });

  //
  // --- PATCH ---
  //
  it('should return 400 if isDeleted is not boolean', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: fakeId },
      body: { isDeleted: 'yes' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ message: 'isDeleted boolean required' });
  });

  it('should update isDeleted successfully on PATCH', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const updatedNote = { _id: fakeId, title: 'Test', content: 'Hello', isDeleted: true };
    (Note.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(updatedNote);

    const { req, res } = createMocks({
      method: 'PATCH',
      query: { id: fakeId },
      body: { isDeleted: true }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(updatedNote);
  });

  //
  // --- DELETE ---
  //
  it('should delete note successfully', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    (Note.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({});

    const { req, res } = createMocks({
      method: 'DELETE',
      query: { id: fakeId }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Deleted' });
  });

  //
  // --- METHOD NOT ALLOWED ---
  //
  it('should return 405 for unsupported method', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const { req, res } = createMocks({
      method: 'POST',
      query: { id: fakeId }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ message: 'Method not allowed' });
  });
});
