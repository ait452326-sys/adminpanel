const messageBox = document.getElementById('dashboard-message');
const logoutButton = document.getElementById('logout-button');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('sidebar-backdrop');

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value));
}
function updateClock() {
  const now = new Date();
  document.getElementById('topbar-date').textContent = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  document.getElementById('current-time').textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
function showError(message) {
  messageBox.textContent = message;
  messageBox.className = 'notice error';
  messageBox.hidden = false;
}
async function loadDashboard() {
  try {
    const response = await fetch('/api/admin/dashboard');
    const data = await response.json();
    if (response.status === 401) return window.location.replace('/login');
    if (!response.ok) throw new Error(data.message || 'Could not load dashboard.');
    const user = data.user;
    const initial = (user.fullName || user.username || 'A').trim().charAt(0).toUpperCase();
    document.getElementById('user-name').textContent = user.fullName;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('detail-name').textContent = user.fullName;
    document.getElementById('detail-email').textContent = user.email;
    document.getElementById('detail-role').textContent = user.role.toUpperCase();
    document.getElementById('detail-created').textContent = formatDate(user.createdAt);
    document.getElementById('top-avatar').textContent = initial;
    document.getElementById('welcome-avatar').textContent = initial;
    if (user.role !== 'admin') document.getElementById('users-lock').textContent = 'Restricted';
  } catch (error) {
    showError(error.message || 'Unable to connect to the server.');
  }
}
logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.replace('/login');
  } catch {
    showError('Could not log out. Please check your connection and try again.');
    logoutButton.disabled = false;
  }
});
function closeSidebar() {
  sidebar.classList.remove('open');
  backdrop.classList.remove('show');
}
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  backdrop.classList.toggle('show');
});
backdrop.addEventListener('click', closeSidebar);
document.getElementById('year').textContent = new Date().getFullYear();
updateClock();
setInterval(updateClock, 30000);
loadDashboard();
