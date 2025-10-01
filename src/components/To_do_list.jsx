import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: Local date (YYYY-MM-DD)
const getNowLocal = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

// Initial todos
const getInitialTodos = () => {
  const saved = localStorage.getItem('todos');
  return saved ? JSON.parse(saved) : [
    { text: "you can add", uniqueNo: 1, isChecked: false, priority: 'Medium', due: getNowLocal(), editing: false },
    { text: "list or else", uniqueNo: 2, isChecked: false, priority: 'Low', due: getNowLocal(), editing: false },
    { text: "you can delete", uniqueNo: 3, isChecked: false, priority: 'High', due: getNowLocal(), editing: false }
  ];
};

// Cubes explosion for delete animation
function Explosion({ x = 0, y = 0, width = 200, height = 50, onComplete }) {
  const countX = Math.floor(width / 20);
  const countY = Math.floor(height / 20);
  const cubeElements = Array.from({ length: countX * countY });

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width,
        height,
        pointerEvents: 'none',
        zIndex: 99,
        display: 'grid',
        gridTemplateColumns: `repeat(${countX}, 1fr)`,
        gridTemplateRows: `repeat(${countY}, 1fr)`,
        gap: 2,
        borderRadius: 8
      }}
    >
      <AnimatePresence>
        {cubeElements.map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: [1, 1.2, 0],
              opacity: [1, 0.7, 0],
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              rotate: (Math.random() - 0.5) * 360
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            exit={{ opacity: 0 }}
            style={{
              background: `linear-gradient(45deg, #f43f5e, #eab308)`,
              borderRadius: 3,
              width: '100%',
              height: '100%',
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function To_do_list() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [todoList, setTodoList] = useState(getInitialTodos);
  const [userInput, setUserInput] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState(getNowLocal());
  const [filter, setFilter] = useState("All");
  const [explodingTask, setExplodingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todoList));
  }, [todoList]);
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const totalCount = todoList.length;
  const completedCount = todoList.filter(t => t.isChecked).length;
  const pendingCount = totalCount - completedCount;

  const onAddTodo = () => {
    if (userInput.trim() === "") {
      alert("Enter Valid Text");
      return;
    }
    const maxNo = todoList.length ? Math.max(...todoList.map(todo => todo.uniqueNo)) : 0;
    const newTodo = {
      text: userInput,
      uniqueNo: maxNo + 1,
      isChecked: false,
      priority,
      due: due || getNowLocal(),
      editing: false
    };
    setTodoList([...todoList, newTodo]);
    setUserInput("");
    setPriority("Medium");
    setDue(getNowLocal());
  };

  const onTodoStatusChange = (uniqueNo) => {
    setTodoList(prev =>
      prev.map(todo =>
        todo.uniqueNo === uniqueNo ? { ...todo, isChecked: !todo.isChecked } : todo
      )
    );
  };

  const startEditing = (uniqueNo) => {
    setTodoList(prev =>
      prev.map(todo =>
        todo.uniqueNo === uniqueNo ? { ...todo, editing: true } : todo
      )
    );
  };
  const finishEditing = (uniqueNo, newText, newPriority, newDue) => {
    setTodoList(prev =>
      prev.map(todo =>
        todo.uniqueNo === uniqueNo
          ? { ...todo, text: newText, priority: newPriority, due: newDue, editing: false }
          : todo
      )
    );
  };

  // Delete with explosion of full todo container, not just Delete button
  const onDeleteTodo = (uniqueNo, e) => {
    const container = e.target.closest('li');
    if (!container) {
      // fallback if event target can't find ancestor li
      setTodoList(prev => prev.filter(todo => todo.uniqueNo !== uniqueNo));
      return;
    }
    const rect = container.getBoundingClientRect();

    setExplodingTask({
      uniqueNo,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    });

    setTimeout(() => {
      setTodoList(prev => prev.filter(todo => todo.uniqueNo !== uniqueNo));
      setExplodingTask(null);
    }, 850);
  };

  const onDragStart = (idx) => {
    setTodoList(prev => prev.map((todo, i) => i === idx ? { ...todo, dragging: true } : todo));
  };
  const onDrop = (draggedIdx, droppedIdx) => {
    const newList = [...todoList];
    const draggedItem = newList.splice(draggedIdx, 1)[0];
    newList.splice(droppedIdx, 0, draggedItem);
    setTodoList(newList.map(todo => ({ ...todo, dragging: false })));
  };

  const filteredTodos = todoList.filter(todo => {
    if (filter === "All") return true;
    if (filter === "Completed") return todo.isChecked;
    if (filter === "Pending") return !todo.isChecked;
    return true;
  });

  const inputClass = darkMode
    ? "bg-gray-900 text-white placeholder:opacity-70 border-gray-700"
    : "bg-white text-black placeholder-gray-400 border-gray-300";

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden
      ${darkMode
        ? 'bg-gradient-to-br from-[#131c31] via-[#1c1331] to-[#131728]'
        : 'bg-gradient-to-br from-[#a3c9fa] via-[#f6d365] to-[#fda085]'}`
    }>
      {/* Explosion animation */}
      {explodingTask && <Explosion {...explodingTask} onComplete={() => setExplodingTask(null)} />}

      {/* Todo Container */}
      <div className={`w-full max-w-2xl mx-auto
        backdrop-blur-xl
        bg-gradient-to-br ${darkMode
          ? 'from-[#181c34]/70 via-[#2a223d]/80 to-[#101622]/80'
          : 'from-white/60 via-white/90 to-blue-100/80'}
        border border-white/20 rounded-3xl shadow-2xl p-8 transition-all duration-700 relative z-10`
      }>
        {/* Theme Toggle */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-400 via-purple-600 to-pink-500 text-white font-semibold shadow-lg hover:scale-110 transition"
          >
            {darkMode ? "🌙 Dark" : "🔆 Light"}
          </button>
        </div>
        {/* Title */}
        <h1 className="text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 font-bold text-5xl mb-10 bg-clip-text text-transparent">
          <span className="text-black bg-auto bg-clip-border text-opacity-100">📝</span> Todo List
        </h1>
        {/* Counters */}
        <div className="flex justify-between gap-8 mb-8 font-semibold text-lg">
          <span>Total: {totalCount}</span>
          <span className="text-green-400">Completed: {completedCount}</span>
          <span className="text-pink-500">Pending: {pendingCount}</span>
        </div>
        {/* Add Task */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">
            Create Task
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              className={`col-span-2 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none ${inputClass}`}
              placeholder="What needs to be done?"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              autoComplete="off"
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className={`rounded-xl px-3 py-2 border ${inputClass} font-semibold`}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
              className={`rounded-xl px-3 py-2 border ${inputClass} font-semibold`}
            />
            <button
              className="col-span-1 md:col-span-4 px-6 py-3 mt-2 bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white font-bold rounded-xl shadow-md hover:scale-105 transition-transform"
              onClick={onAddTodo}
            >
              ➕ Add
            </button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-4 mb-8 justify-center">
          {["All", "Completed", "Pending"].map(cat =>
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                px-4 py-2 rounded-xl transition font-medium outline-none 
                ${filter === cat
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow"
                  : darkMode
                    ? "bg-gray-800 text-gray-200 border border-gray-700"
                    : "bg-white text-black border border-gray-200"
                }`}
            >{cat}</button>
          )}
        </div>
        {/* Tasks */}
        <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">My Tasks</h2>
        <ul className="space-y-4 transition-all duration-700">
          <AnimatePresence>
            {filteredTodos.map((todo, idx) => (
              <motion.li
                key={todo.uniqueNo}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => {
                  const draggingIdx = todoList.findIndex(t => t.dragging);
                  if (draggingIdx !== -1) onDrop(draggingIdx, idx);
                }}
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="group"
              >
                <div className={`flex items-center justify-between transition 
                  bg-gradient-to-r ${darkMode
                    ? 'from-[#191724]/80 via-[#25233a]/80 to-[#23213d]/80'
                    : 'from-white via-blue-50 to-fuchsia-50/80'}
                  border border-white/20 rounded-2xl shadow-xl p-4 hover:scale-[1.01] hover:shadow-2xl`}
                >
                  {/* Left Side (checkbox, text, badges) */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.isChecked}
                      onChange={() => onTodoStatusChange(todo.uniqueNo)}
                      className="w-5 h-5 accent-indigo-500 cursor-pointer mt-1"
                    />
                    {!todo.editing ? (
                      <div className="min-w-0 flex flex-col">
                        <label
                          className={`text-lg break-all cursor-pointer transition-all duration-300 select-auto truncate ${todo.isChecked ? 'line-through text-gray-400' : darkMode ? 'text-white' : 'text-gray-900'}`}
                          onDoubleClick={() => startEditing(todo.uniqueNo)}
                        >{todo.text}</label>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`
                            px-2 py-1 rounded-full font-bold text-xs drop-shadow
                            ${todo.priority === 'High'
                              ? "bg-gradient-to-r from-pink-500 to-red-600 text-white"
                              : todo.priority === 'Medium'
                                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                                : "bg-gradient-to-r from-green-400 to-teal-500 text-white"}
                              `}
                          >{todo.priority}</span>
                          <span className="ml-1 px-2 py-1 rounded-xl bg-fuchsia-100 text-fuchsia-700 text-xs">{todo.due}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 min-w-0">
                        <input
                          type="text"
                          defaultValue={todo.text}
                          onBlur={e => finishEditing(todo.uniqueNo, e.target.value, todo.priority, todo.due)}
                          className={`${inputClass} rounded px-2 py-1 shadow-lg min-w-[100px]`}
                          autoFocus
                        />
                        <div className="flex gap-2 items-center mt-0.5">
                          <select
                            defaultValue={todo.priority}
                            onBlur={e => finishEditing(todo.uniqueNo, todo.text, e.target.value, todo.due)}
                            className={`rounded px-2 py-1 ${inputClass}`}
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                          <input
                            type="date"
                            defaultValue={todo.due}
                            onBlur={e => finishEditing(todo.uniqueNo, todo.text, todo.priority, e.target.value)}
                            className={`${inputClass} rounded px-2 py-1`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Buttons */}
                  <div className="flex gap-2 ml-4">
                    {!todo.editing && (
                      <button
                        onClick={() => startEditing(todo.uniqueNo)}
                        className="opacity-75 hover:opacity-100 hover:text-blue-400 transition text-lg"
                        title="Edit"
                      >✏️</button>
                    )}
                    <button
                      onClick={(e) => onDeleteTodo(todo.uniqueNo, e)}
                      className="opacity-80 hover:opacity-100 hover:text-red-500 transition text-lg"
                      title="Delete"
                    >Delete</button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="text-center mt-10 text-xs text-fuchsia-400/90 select-none">Never forget your tasks!</div>
      </div>
    </div>
  );
}
