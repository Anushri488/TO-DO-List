const STORAGE_KEY = 'taskflow-todos';
const THEME_KEY = 'taskflow-theme';
let todos = [];
let currentFilter = 'all';
let currentStatus = 'all';
let searchQuery = '';
let selectedPriority = 'low';

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark');
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'dark' : 'light');
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateString) < today;
}

function getCategoryEmoji(cat) {
  const emojis = { work: '💼', personal: '🏠', shopping: '🛒', health: '💪' };
  return emojis[cat] || '📌';
}

function addTodo(text, dueDate, category, priority) {
  todos.unshift({
    id: generateId(),
    text,
    completed: false,
    dueDate: dueDate || null,
    category: category || null,
    priority: priority || 'low',
    createdAt: Date.now()
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item priority-${todo.priority}${todo.completed ? ' completed' : ''}`;

  let metaHtml = '';
  if (todo.category) {
    metaHtml += `<span class="meta-badge category">${getCategoryEmoji(todo.category)} ${todo.category}</span>`;
  }
  if (todo.dueDate) {
    const overdueClass = !todo.completed && isOverdue(todo.dueDate) ? ' overdue' : '';
    metaHtml += `<span class="meta-badge date${overdueClass}">📅 ${formatDate(todo.dueDate)}</span>`;
  }

  li.innerHTML = `
    <button class="check-btn" aria-label="${todo.completed ? 'Mark incomplete' : 'Mark complete'}"></button>
    <div class="todo-content">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      ${metaHtml ? `<div class="todo-meta">${metaHtml}</div>` : ''}
    </div>
    <button class="delete-btn" aria-label="Delete">×</button>
  `;

  li.querySelector('.check-btn').onclick = () => toggleTodo(todo.id);
  li.querySelector('.delete-btn').onclick = () => deleteTodo(todo.id);
  return li;
}

function getFilteredTodos() {
  return todos.filter(todo => {
    const statusMatch = currentStatus === 'all' || (currentStatus === 'active' ? !todo.completed : todo.completed);
    const categoryMatch = currentFilter === 'all' || todo.category === currentFilter;
    const searchMatch = !searchQuery.trim() || todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && categoryMatch && searchMatch;
  });
}

function updateCounts() {
  document.getElementById('allCount').textContent = todos.length;
  document.getElementById('activeCount').textContent = todos.filter(t => !t.completed).length;
  document.getElementById('completedCount').textContent = todos.filter(t => t.completed).length;
}

function render() {
  const list = document.getElementById('todoList');
  const filtered = getFilteredTodos();
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  document.getElementById('progressText').textContent = `${completedCount} of ${totalCount} completed`;
  document.getElementById('progressPercent').textContent = `${percent}%`;
  document.getElementById('progressFill').style.width = `${percent}%`;

  updateCounts();
  list.innerHTML = '';

  if (todos.length === 0) {
    list.innerHTML = `<li class="empty-state"><div class="empty-icon">📝</div><p>No tasks yet. Add one above!</p></li>`;
  } else if (filtered.length === 0) {
    list.innerHTML = '<li class="no-results">No matching tasks found</li>';
  } else {
    filtered.forEach(todo => list.appendChild(createTodoElement(todo)));
  }
}

// Event Listeners
document.getElementById('todoForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (text) {
    addTodo(text, document.getElementById('dueDate').value, document.getElementById('category').value, selectedPriority);
    input.value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('category').value = '';
  }
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('searchInput').addEventListener('input', e => { searchQuery = e.target.value; render(); });

document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPriority = btn.dataset.priority;
  });
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatus = btn.dataset.status;
    render();
  });
});

document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Init
loadTheme();
todos = loadTodos();
render();
