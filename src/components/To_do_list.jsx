
import React, { useState } from 'react';

export default function To_do_list() {
  const [todoList, setTodoList] = useState([
    { text: "Learn HTML", uniqueNo: 1, isChecked: false },
    { text: "Learn CSS", uniqueNo: 2, isChecked: false },
    { text: "Learn JavaScript", uniqueNo: 3, isChecked: false },
  ]);
  const [userInput, setUserInput] = useState("");
  const [todosCount, setTodosCount] = useState(todoList.length);

  const onTodoStatusChange = (uniqueNo) => {
    setTodoList(prevTodos =>
      prevTodos.map(todo =>
        todo.uniqueNo === uniqueNo ? { ...todo, isChecked: !todo.isChecked } : todo
      )
    );
  };

  const onDeleteTodo = (uniqueNo) => {
    setTodoList(prevTodos => prevTodos.filter(todo => todo.uniqueNo !== uniqueNo));
  };

  const onAddTodo = () => {
    if (userInput.trim() === "") {
      alert("Enter Valid Text");
      return;
    }
    const newTodo = {
      text: userInput,
      uniqueNo: todosCount + 1,
      isChecked: false,
    };
    setTodoList(prevTodos => [...prevTodos, newTodo]);
    setTodosCount(todosCount + 1);
    setUserInput("");
  };

  return (
    <div className="bg-gradient-to-br from-[#0f0a17] via-[#13140c] to-[#0c0808] min-h-screen flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-2xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
        <h1 className="text-center bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 font-bold text-5xl mb-10 bg-clip-text text-transparent">
            <span className="text-black bg-auto bg-clip-border text-opacity-100">📝</span> Todo List
        </h1>


        {/* Add Todo Section */}
        <div className="mb-10">
            <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">
                Create Task
            </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              id="todoUserInput"
              className="flex-1 bg-white/20 border border-gray-400 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-300 text-white"
              placeholder="What needs to be done?"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
              id="addTodoButton"
              onClick={onAddTodo}
            >
              ➕ Add
            </button>
          </div>
        </div>

        {/* Todo List */}
        <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">My Tasks</h2>
        <ul className="space-y-4">
          {todoList.map(({ text, uniqueNo, isChecked }) => (
            <li key={uniqueNo} className="group">
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-md p-4 transition hover:scale-[1.02]">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={'checkbox' + uniqueNo}
                    checked={isChecked}
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                    onChange={() => onTodoStatusChange(uniqueNo)}
                  />
                  <label
                    htmlFor={'checkbox' + uniqueNo}
                    className={`text-lg cursor-pointer transition ${
                      isChecked ? 'line-through text-gray-400' : 'text-white'
                    }`}
                  >
                    {text}
                  </label>
                </div>
                <button
                  onClick={() => onDeleteTodo(uniqueNo)}
                  className="opacity-70 hover:opacity-100 hover:text-red-500 transition text-lg"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

