(async () => {
  try {
    const response = await fetch('/api/auth/me');
    if (response.status === 401) window.location.replace('/login');
  } catch {
    // The page remains readable if the connection is temporarily unavailable.
  }
})();
