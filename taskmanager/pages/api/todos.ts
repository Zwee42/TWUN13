import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

interface Query {
    userId: string | string[];
    deadline?: {
        $gte?: Date;
        $lte?: Date;
        $lt?: Date;
    };
    status?: {
        $ne?: string;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { filter, startDate, endDate } = req.query;
        
        const userId = req.query.userId || 'mock-user-id';

        const query: Query = { userId };


        if (startDate && endDate) {
          query.deadline = {
            $gte: new Date(startDate as string),
            $lte: new Date(endDate as string)
          };
        }

        if (filter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          query.deadline = {
            $gte: today,
            $lt: tomorrow
          };
        } else if (filter === 'thisweek') {
          const now = new Date();
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 7);
          
          query.deadline = {
            $gte: startOfWeek,
            $lt: endOfWeek
          };
        } else if (filter === 'overdue') {
          query.deadline = { $lt: new Date() };
          query.status = { $ne: 'completed' };
        }

        const todos = await Todo.find(query).sort({ deadline: 1 });
        res.status(200).json({ success: true, data: todos });
      } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;

    case 'POST':
      try {
        const userId = req.body.userId || 'mock-user-id';
        const todoData = { ...req.body, userId };
        console.log('Creating todo with data:', todoData);
        const todo = await Todo.create(todoData);
        res.status(201).json({ success: true, data: todo });
      } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const todo = await Todo.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        
        if (!todo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        
        res.status(200).json({ success: true, data: todo });
      } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        
        if (!deletedTodo) {
          return res.status(404).json({ success: false, error: 'Todo not found' });
        }
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
      break;

    default:
      res.status(400).json({ success: false, error: 'Method not allowed' });
      break;
  }
}
