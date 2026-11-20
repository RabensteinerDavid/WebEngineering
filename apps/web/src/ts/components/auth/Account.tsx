import { Link } from 'react-router-dom';
import { useEffect, useState, type JSX } from 'react';
import { apiUrl } from '../../api/url';
import { checkResponse } from '../../api/problem';

interface User {
  email: string;
}
const unauthorized = 401;

export default function Account(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  async function readUser(response: Response): Promise<User> {
    await checkResponse(response);
    const data: unknown = await response.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !('email' in data) ||
      typeof data.email !== 'string'
    )
      throw new Error('Invalid user response.');
    return { email: data.email };
  }

  useEffect(() => {
    const controller = new AbortController();
    async function loadUser(): Promise<void> {
      try {
        const response = await fetch(apiUrl('/api/auth/me'), {
          credentials: 'include',
          signal: controller.signal,
        });
        const current =
          response.status === unauthorized ? null : await readUser(response);
        if (!controller.signal.aborted) setUser(current);
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : 'Could not load account.'
          );
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }
    void loadUser();
    return () => {
      controller.abort();
    };
  }, []);

  async function login(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setUser(await readUser(response));
      setPassword('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function logout(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await checkResponse(
        await fetch(apiUrl('/api/auth/logout'), {
          method: 'POST',
          credentials: 'include',
        })
      );
      setUser(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Logout failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account" aria-label="Account">
      {user === null ? (
        <div className="account-actions">
          <Link className="account-register" to="/register">
            Register
          </Link>
          <details className="account-menu">
            <summary>Log in</summary>
            <form
              className="account-panel"
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) void login();
              }}
            >
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                minLength={12}
                maxLength={128}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              <button type="submit" disabled={busy}>
                Log in
              </button>
              {error !== '' && <p role="alert">{error}</p>}
            </form>
          </details>
        </div>
      ) : (
        <div className="account-actions">
          <span className="account-email" title={user.email}>
            {user.email}
          </span>{' '}
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void logout();
            }}
          >
            Log out
          </button>
        </div>
      )}
      {user !== null && error !== '' && <p role="alert">{error}</p>}
    </section>
  );
}
