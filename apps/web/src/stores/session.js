const KEY = 'orison_auth';

export const sessionStore = {
  read() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  },
  write(session) {
    localStorage.setItem('orison_token', session.token);
    localStorage.setItem(KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem('orison_token');
    localStorage.removeItem(KEY);
  },
};
