/* ══════════════════════════════════════════════
   TaskFlow — script.js
   Lógica del frontend: auth + CRUD de tareas
══════════════════════════════════════════════ */

const API_URL = 'http://localhost:3000/api';

// ─── Estado global ────────────────────────────
let currentToken  = localStorage.getItem('tf_token') || null;
let currentUser   = JSON.parse(localStorage.getItem('tf_user') || 'null');
let editingTaskId = null;

// ─── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (currentToken && currentUser) {
    showDashboard();
    loadTasks();
  } else {
    showAuth();
  }
});

// ══════════════════════════════════════════════
//  AUTH HELPERS
// ══════════════════════════════════════════════

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('dashboard-screen').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('dashboard-screen').classList.remove('hidden');

  // Actualizar info del usuario en sidebar
  const email = currentUser?.correo || '';
  document.getElementById('user-email-display').textContent = email;
  document.getElementById('user-avatar').textContent = email.charAt(0).toUpperCase();
}

function switchTab(tab) {
  ['login', 'register'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`panel-${t}`).classList.toggle('active', t === tab);
  });
  clearMessages();
}

function clearMessages() {
  ['login-error', 'register-error', 'register-success'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.add('hidden');
    el.textContent = '';
  });
}

function showMessage(id, text, hidden = false) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.classList.toggle('hidden', hidden);
}

// ══════════════════════════════════════════════
//  REGISTRO
// ══════════════════════════════════════════════
async function register() {
  clearMessages();

  const correo   = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!correo || !password) {
    return showMessage('register-error', 'Por favor completa todos los campos.');
  }
  if (password.length < 6) {
    return showMessage('register-error', 'La contraseña debe tener al menos 6 caracteres.');
  }

  try {
    const res  = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    const data = await res.json();

    if (res.ok) {
      showMessage('register-success', '¡Cuenta creada! Ahora inicia sesión.');
      document.getElementById('reg-email').value    = '';
      document.getElementById('reg-password').value = '';
      setTimeout(() => switchTab('login'), 1500);
    } else {
      showMessage('register-error', data.message || 'Error al registrar.');
    }
  } catch {
    showMessage('register-error', 'No se pudo conectar al servidor.');
  }
}

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
async function login() {
  clearMessages();

  const correo   = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!correo || !password) {
    return showMessage('login-error', 'Por favor completa todos los campos.');
  }

  try {
    const res  = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password })
    });
    const data = await res.json();

    if (res.ok) {
      // Guardar token y usuario
      currentToken = data.token;
      currentUser  = data.user;
      localStorage.setItem('tf_token', currentToken);
      localStorage.setItem('tf_user',  JSON.stringify(currentUser));

      showDashboard();
      loadTasks();
    } else {
      showMessage('login-error', data.message || 'Credenciales inválidas.');
    }
  } catch {
    showMessage('login-error', 'No se pudo conectar al servidor.');
  }
}

// ══════════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════════
function logout() {
  currentToken = null;
  currentUser  = null;
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_user');
  showAuth();
  switchTab('login');
}

// ══════════════════════════════════════════════
//  TAREAS
// ══════════════════════════════════════════════

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${currentToken}`
  };
}

// ─── Cargar tareas ────────────────────────────
async function loadTasks() {
  setLoading(true);

  try {
    const res = await fetch(`${API_URL}/tasks`, {
      headers: authHeaders()
    });

    if (res.status === 401 || res.status === 403) {
      logout();
      return;
    }

    const tasks = await res.json();
    renderTasks(tasks);
  } catch {
    showToast('Error al cargar las tareas.', 'error');
  } finally {
    setLoading(false);
  }
}

// ─── Agregar tarea ────────────────────────────
async function addTask() {
  const input = document.getElementById('new-task-input');
  const titulo = input.value.trim();

  if (!titulo) {
    input.focus();
    return;
  }

  try {
    const res  = await fetch(`${API_URL}/tasks`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ titulo })
    });
    const data = await res.json();

    if (res.ok) {
      input.value = '';
      // Inserta la tarea al inicio sin recargar
      prependTask(data.task);
      updateCount(1);
      showToast('Tarea agregada', 'success');
    } else {
      showToast(data.message || 'Error al agregar.', 'error');
    }
  } catch {
    showToast('Error de conexión.', 'error');
  }
}

// ─── Abrir modal de edición ───────────────────
function openEditModal(id, titulo) {
  editingTaskId = id;
  document.getElementById('edit-input').value = titulo;
  document.getElementById('edit-modal').classList.remove('hidden');
  document.getElementById('edit-input').focus();
}

function closeEditModal() {
  editingTaskId = null;
  document.getElementById('edit-modal').classList.add('hidden');
}

function closeModal(event) {
  if (event.target.classList.contains('modal-overlay')) closeEditModal();
}

// ─── Guardar edición ──────────────────────────
async function saveEdit() {
  const titulo = document.getElementById('edit-input').value.trim();
  if (!titulo || !editingTaskId) return;

  try {
    const res  = await fetch(`${API_URL}/tasks/${editingTaskId}`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    JSON.stringify({ titulo })
    });
    const data = await res.json();

    if (res.ok) {
      // Actualiza en el DOM directamente
      const el = document.querySelector(`[data-id="${editingTaskId}"] .task-title`);
      if (el) el.textContent = titulo;
      closeEditModal();
      showToast('Tarea actualizada', 'success');
    } else {
      showToast(data.message || 'Error al actualizar.', 'error');
    }
  } catch {
    showToast('Error de conexión.', 'error');
  }
}

// ─── Eliminar tarea ───────────────────────────
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method:  'DELETE',
      headers: authHeaders()
    });

    if (res.ok) {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        el.style.transition = '0.2s ease';
        setTimeout(() => { el.remove(); updateCount(-1); checkEmpty(); }, 200);
      }
      showToast('Tarea eliminada', 'success');
    } else {
      const data = await res.json();
      showToast(data.message || 'Error al eliminar.', 'error');
    }
  } catch {
    showToast('Error de conexión.', 'error');
  }
}

// ══════════════════════════════════════════════
//  RENDER HELPERS
// ══════════════════════════════════════════════

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (tasks.length === 0) {
    showEmpty(true);
  } else {
    showEmpty(false);
    tasks.forEach(t => list.appendChild(createTaskEl(t)));
  }

  document.getElementById('task-count').textContent = tasks.length;
}

function prependTask(task) {
  const list = document.getElementById('task-list');
  const el   = createTaskEl(task);
  list.prepend(el);
  showEmpty(false);
}

function createTaskEl(task) {
  const div = document.createElement('div');
  div.className = 'task-item';
  div.dataset.id = task.id;
  div.innerHTML = `
    <div class="task-bullet"></div>
    <span class="task-title">${escapeHtml(task.titulo)}</span>
    <div class="task-actions">
      <button class="btn-icon" title="Editar" onclick="openEditModal(${task.id}, \`${escapeHtml(task.titulo)}\`)">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
      </button>
      <button class="btn-icon delete" title="Eliminar" onclick="deleteTask(${task.id})">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  `;
  return div;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setLoading(on) {
  document.getElementById('loading-state').classList.toggle('hidden', !on);
  document.getElementById('task-list').classList.toggle('hidden', on);
}

function showEmpty(on) {
  document.getElementById('empty-state').classList.toggle('hidden', !on);
}

function checkEmpty() {
  const list = document.getElementById('task-list');
  showEmpty(list.children.length === 0);
}

function updateCount(delta) {
  const el  = document.getElementById('task-count');
  el.textContent = Math.max(0, parseInt(el.textContent || 0) + delta);
}

// ── Toast ────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

// ── Enter key en modal ────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditModal();
  if (e.key === 'Enter' && editingTaskId) saveEdit();
});
