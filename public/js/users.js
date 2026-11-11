const tableBody = document.getElementById('users-table');
const message = document.getElementById('users-message');
function safeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users');
    const data = await response.json();
    if (response.status === 401) return window.location.replace('/login');
    if (!response.ok) throw new Error(data.message || 'Unable to load users.');
    if (!data.users.length) {
      tableBody.innerHTML = '<tr><td colspan="5">No users registered yet.</td></tr>';
      return;
    }
    tableBody.innerHTML = data.users.map(user => `<tr><td>${safeText(user.fullName)}</td><td>${safeText(user.username)}</td><td>${safeText(user.email)}</td><td>${safeText(user.role)}</td><td>${safeText(new Date(user.createdAt).toLocaleDateString())}</td></tr>`).join('');
  } catch (error) {
    message.textContent = error.message;
    message.className = 'notice error';
    message.hidden = false;
  }
}
loadUsers();
