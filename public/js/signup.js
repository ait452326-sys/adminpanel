const signupForm = document.getElementById('signup-form');
const messageBox = document.getElementById('form-message');
function showMessage(message, type = 'error') {
  messageBox.textContent = message;
  messageBox.className = `notice ${type}`;
  messageBox.hidden = false;
}
function setLoading(loading) {
  const button = signupForm.querySelector('button[type="submit"]');
  button.disabled = loading;
  button.querySelector('.btn-label').textContent = loading ? 'Creating account…' : 'Create account';
  button.querySelector('.spinner').hidden = !loading;
}
document.querySelectorAll('[data-toggle-password]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    input.type = input.type === 'password' ? 'text' : 'password';
    button.textContent = input.type === 'password' ? 'Show' : 'Hide';
  });
});
signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  messageBox.hidden = true;
  const payload = {
    fullName: document.getElementById('fullName').value.trim(),
    username: document.getElementById('username').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value
  };
  if (payload.fullName.length < 2) return showMessage('Please enter your full name.');
  if (!/^[a-zA-Z0-9_]{3,30}$/.test(payload.username)) return showMessage('Username must be 3–30 characters and use only letters, numbers or underscores.');
  if (payload.password.length < 8) return showMessage('Password must be at least 8 characters.');
  if (payload.password !== payload.confirmPassword) return showMessage('Passwords do not match.');
  setLoading(true);
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to create account.');
    window.location.assign(data.redirect || '/admin/dashboard');
  } catch (error) {
    showMessage(error.message || 'A network error occurred. Please try again.');
    setLoading(false);
  }
});
