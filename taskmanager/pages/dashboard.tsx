import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Calendar from '../components/Calendar';
import TodoCard from '../components/TodoCard';
import TodoModal from '../components/TodoModal';
import Image from 'next/image'


interface Todo {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [weekTodos, setWeekTodos] = useState<Todo[]>([]);
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar' | 'all-todos'>('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const router = useRouter();
  const mock_user_id = '68d3afe3022098a6fa4c5054'

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      // Fetch different todo categories
      const [allRes, todayRes, weekRes, overdueRes] = await Promise.all([
        fetch(`/api/todos?userId=${mock_user_id}`),
        fetch(`/api/todos?filter=today&userId=${mock_user_id}`),
        fetch(`/api/todos?filter=thisweek&userId=${mock_user_id}`),
        fetch(`/api/todos?filter=overdue&userId=${mock_user_id}`)
      ]);

      const [allData, todayData, weekData, overdueData] = await Promise.all([
        allRes.json(),
        todayRes.json(),
        weekRes.json(),
        overdueRes.json()
      ]);

      if (allData.success) setTodos(allData.data);
      if (todayData.success) setTodayTodos(todayData.data);
      if (weekData.success) setWeekTodos(weekData.data);
      if (overdueData.success) setOverdueTodos(overdueData.data);
    } catch (error) {
      toast.error('Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTodo,
          userId: mock_user_id
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Todo added successfully!');
        setNewTodo({ title: '', description: '', deadline: '', priority: 'medium' });
        setShowAddForm(false);
        fetchTodos();
      } else {
        toast.error('Failed to add todo');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Error adding todo');
    }
  };

  const updateTodoStatus = async (todoId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`/api/todos?id=${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Todo updated!');
        fetchTodos();
      } else {
        toast.error('Failed to update todo');
      }
    } catch (error) {
      toast.error('Error updating todo');
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos?id=${todoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Todo deleted!');
        fetchTodos();
      } else {
        toast.error('Failed to delete todo');
      }
    } catch (error) {
      toast.error('Error deleting todo');
      console.error('Error deleting todo:', error);
    }
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowEditForm(true);
  };

  const updateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    try {
      const response = await fetch(`/api/todos?id=${editingTodo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingTodo.title,
          description: editingTodo.description,
          deadline: editingTodo.deadline,
          priority: editingTodo.priority,
          status: editingTodo.status
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Todo updated successfully!');
        setShowEditForm(false);
        setEditingTodo(null);
        fetchTodos();
      } else {
        toast.error('Failed to update todo');
      }
    } catch (error) {
      toast.error('Error updating todo');
      console.error('Error updating todo:', error);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-white">Loading your todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Todo Dashboard</h1>
              <p className="text-purple-200">Manage your tasks and deadlines</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                  activeView === 'dashboard' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                  activeView === 'calendar' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                <Image src="/calendar-icon.png" alt="Calendar" className="w-4 h-4 inline mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setActiveView('all-todos')}
                className={`px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                  activeView === 'all-todos' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                }`}
              >
                <Image src="/white-todo-icon.png" alt="All Todos" className="w-4 h-4 inline mr-2" />
                All Todos
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Todo
              </button>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-800/50 text-purple-200 px-4 py-2 rounded-lg font-semibold shadow-md hover:bg-purple-700/50 transition"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-red-500/30 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-300">Overdue</p>
                    <p className="text-2xl font-semibold text-white">{overdueTodos.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-blue-500/30 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-300">Today</p>
                    <p className="text-2xl font-semibold text-white">{todayTodos.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-yellow-500/30 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-300">This Week</p>
                    <p className="text-2xl font-semibold text-white">{weekTodos.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-green-500/30 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-300">Total</p>
                    <p className="text-2xl font-semibold text-white">{todos.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overdue Todos */}
            {overdueTodos.length > 0 && (
              <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-red-500/30">
                <div className="px-6 py-4 border-b border-red-500/30">
                  <h2 className="text-lg font-semibold text-red-400 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Overdue Tasks
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {overdueTodos.map((todo) => (
                    <TodoCard 
                      key={todo._id} 
                      todo={todo} 
                      onEdit={editTodo}
                      onDelete={deleteTodo}
                      onStatusUpdate={updateTodoStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Today's Todos */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-purple-500/30">
              <div className="px-6 py-4 border-b border-purple-500/30">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Today&apos;s Tasks
                </h2>
              </div>
              <div className="p-6">
                {todayTodos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayTodos.map((todo) => (
                      <TodoCard 
                        key={todo._id} 
                        todo={todo} 
                        onEdit={editTodo}
                        onDelete={deleteTodo}
                        onStatusUpdate={updateTodoStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-purple-200">No tasks due today! Great job!</p>
                  </div>
                )}
              </div>
            </div>

            {/* This Week's Todos */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-purple-500/30">
              <div className="px-6 py-4 border-b border-purple-500/30 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  This Week&apos;s Tasks
                </h2>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-purple-400 hover:text-purple-300 font-medium transition"
                >
                  {showAll ? 'Show Less' : 'Show All'}
                </button>
              </div>
              <div className="p-6">
                {weekTodos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(showAll ? weekTodos : weekTodos.slice(0, 6)).map((todo) => (
                      <TodoCard 
                        key={todo._id} 
                        todo={todo} 
                        onEdit={editTodo}
                        onDelete={deleteTodo}
                        onStatusUpdate={updateTodoStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m2-8H9m4 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2h2" />
                    </svg>
                    <p className="text-purple-200">No tasks this week! Time to plan ahead!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'calendar' && (
          <div>
            <Calendar todos={todos} />
          </div>
        )}

        {activeView === 'all-todos' && (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-purple-500/30">
            <div className="px-6 py-4 border-b border-purple-500/30">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H9V5zm0 0V3a2 2 0 012-2h2a2 2 0 012 2v2M7 13h10l4 8H3l4-8z" />
                </svg>
                All Todos ({todos.length})
              </h2>
            </div>
            <div className="p-6">
              {todos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todos.map((todo) => (
                    <TodoCard 
                      key={todo._id} 
                      todo={todo} 
                      onEdit={editTodo}
                      onDelete={deleteTodo}
                      onStatusUpdate={updateTodoStatus}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2H9V5zm0 0V3a2 2 0 012-2h2a2 2 0 012 2v2M7 13h10l4 8H3l4-8z" />
                  </svg>
                  <p className="text-purple-200">No todos yet! Create your first todo to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Todo Modal */}
      <TodoModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={addTodo}
        title="Add New Todo"
        todo={newTodo}
        onChange={(field, value) => setNewTodo({...newTodo, [field]: value})}
        isEdit={false}
      />

      {/* Edit Todo Modal */}
      <TodoModal
        isOpen={showEditForm && editingTodo !== null}
        onClose={() => {
          setShowEditForm(false);
          setEditingTodo(null);
        }}
        onSubmit={updateTodo}
        title="Edit Todo"
        todo={editingTodo ? {
          title: editingTodo.title,
          description: editingTodo.description,
          deadline: editingTodo.deadline ? new Date(editingTodo.deadline).toISOString().slice(0, 16) : '',
          priority: editingTodo.priority,
          status: editingTodo.status
        } : { title: '', description: '', deadline: '', priority: 'medium' }}
        onChange={(field, value) => editingTodo && setEditingTodo({...editingTodo, [field]: value})}
        isEdit={true}
      />
    </div>
  );
};

export default Dashboard;
