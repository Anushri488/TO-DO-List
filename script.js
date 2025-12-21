const STORAGE_KEY = 'todos';

let todos = loadTodos();

const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');
const stats = document.getElementById('stats');

function loadTodos() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    console.error('Failed to save todos');
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTodo(text) {
  const todo = {
    id: generateId(),
    text: text,
    completed: false
  };
  todos.unshift(todo);
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  render();
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');

  li.innerHTML = `
    <button class="check-btn" aria-label="${todo.completed ? 'Mark incomplete' : 'Mark complete'}">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <span class="todo-text">${escapeHtml(todo.text)}</span>
    <button class="delete-btn" aria-label="Delete task">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
    </button>
  `;

  li.querySelector('.check-btn').addEventListener('click', () => toggleTodo(todo.id));
  li.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));

  return li;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function render() {
  list.innerHTML = '';

  if (todos.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>No tasks yet</p>
        <p>Add your first task above to get started</p>
      </div>
    `;
    stats.innerHTML = '';
    return;
  }

  const completed = todos.filter(t => t.completed).length;
  stats.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span>${completed} of ${todos.length} completed</span>
  `;

  todos.forEach(todo => {
    list.appendChild(createTodoElement(todo));
  });
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const text = input.value.trim();
  if (text) {
    addTodo(text);
    input.value = '';
  }
});

render();
