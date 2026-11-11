const loginForm = document.getElementById('login-form');
const messageBox = document.getElementById('form-message');

function showMessage(message, type = 'error') {
  messageBox.textContent = message;
  messageBox.className = `notice ${type}`;
  messageBox.hidden = false;
}
function setLoading(loading) {
  const button = loginForm.querySelector('button[type="submit"]');
  button.disabled = loading;
  button.querySelector('.btn-label').textContent = loading ? 'Signing in…' : 'Sign in';
  button.querySelector('.spinner').hidden = !loading;
}
document.querySelectorAll('[data-toggle-password]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'Show' : 'Hide';
  });
});
document.getElementById('forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  showMessage('Password recovery is not configured in this starter project. Please contact your administrator.', 'error');
});
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageBox.hidden = true;
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;
  if (!identifier || !password) return showMessage('Please enter both your email/username and password.');
  setLoading(true);
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, rememberMe: document.getElementById('rememberMe').checked })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to sign in.');
    window.location.assign(data.redirect || '/admin/dashboard');
  } catch (error) {
    showMessage(error.message || 'A network error occurred. Please try again.');
    setLoading(false);
  }
});
