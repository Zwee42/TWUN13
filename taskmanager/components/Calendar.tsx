import React, { useState } from 'react';

interface Todo {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface CalendarProps {
  todos: Todo[];
}

const Calendar: React.FC<CalendarProps> = ({ todos }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [todosForDate, setTodosForDate] = useState<Todo[]>([]);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Group todos by date
  const todosByDate = todos.reduce((acc, todo) => {
    const todoDate = new Date(todo.deadline).toDateString();
    if (!acc[todoDate]) {
      acc[todoDate] = [];
    }
    acc[todoDate].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
    setSelectedDate(null);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toDateString();
    setTodosForDate(todosByDate[dateKey] || []);
  };

  const getTodosForDay = (date: Date) => {
    const dateKey = date.toDateString();
    return todosByDate[dateKey] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg shadow-lg border border-purple-500/30">
      <div className="flex flex-col lg:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-purple-700/50 rounded-full transition-colors text-purple-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold text-white">
              {monthNames[month]} {year}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-purple-700/50 rounded-full transition-colors text-purple-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-purple-300 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24"></div>;
              }

              const isToday = date.toDateString() === today.toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              const dayTodos = getTodosForDay(date);
              const hasOverdue = dayTodos.some(todo => 
                new Date(todo.deadline) < today && todo.status !== 'completed'
              );

              return (
                <div
                  key={index}
                  onClick={() => selectDate(date)}
                  className={`
                    h-24 p-1 border border-purple-500/20 cursor-pointer transition-colors relative bg-black/20 backdrop-blur-sm
                    ${isToday ? 'bg-purple-600/30 border-purple-400' : 'hover:bg-purple-800/30'}
                    ${isSelected ? 'bg-purple-700/40 border-purple-300' : ''}
                    ${hasOverdue ? 'bg-red-600/30 border-red-400' : ''}
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-sm font-medium 
                      ${isToday ? 'text-purple-200' : 'text-white'}
                      ${hasOverdue ? 'text-red-300' : ''}
                    `}>
                      {date.getDate()}
                    </span>
                    
                    {/* Todo indicators */}
                    <div className="flex-1 flex flex-wrap gap-1 mt-1">
                      {dayTodos.slice(0, 3).map((todo, todoIndex) => (
                        <div
                          key={todoIndex}
                          className={`
                            w-2 h-2 rounded-full 
                            ${getPriorityColor(todo.priority)}
                            ${todo.status === 'completed' ? 'opacity-50' : ''}
                          `}
                          title={`${todo.title} (${todo.priority} priority)`}
                        />
                      ))}
                      {dayTodos.length > 3 && (
                        <span className="text-xs text-purple-300">+{dayTodos.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-purple-200">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low Priority</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></div>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="lg:w-80 border-l border-purple-500/30 p-6">
          {selectedDate ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              
              {todosForDate.length > 0 ? (
                <div className="space-y-3">
                  {todosForDate.map((todo) => (
                    <div key={todo._id} className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white text-sm">{todo.title}</h4>
                        <div className="flex gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)} text-white`}>
                            {todo.priority}
                          </span>
                        </div>
                      </div>
                      
                      {todo.description && (
                        <p className="text-purple-200 text-xs mb-2">{todo.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                          {todo.status}
                        </span>
                        <span className="text-xs text-purple-300">
                          {new Date(todo.deadline).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-purple-300 py-8">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2">No todos for this date</p>
                  <p className="text-xs">Click a date with colored dots to see todos</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-purple-300 py-8">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">Select a date</p>
              <p className="text-xs">Click on a calendar date to see your todos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
