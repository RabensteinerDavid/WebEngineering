import { useState, type JSX } from 'react';
import { apiUrl } from '../../api/url';
import { checkResponse } from '../../api/problem';

type Status = 'idle' | 'saving' | 'success' | 'error';

export default function Register(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function submit(): Promise<void> {
    setStatus('saving');
    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      await checkResponse(response);
      setPassword('');
      setStatus('success');
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Registration failed.'
      );
      setStatus('error');
    }
  }

  return (
    <section>
      <h2>Register</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (status !== 'saving') void submit();
        }}
      >
        <p>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </p>
        <p>
          <label htmlFor="register-password">
            Password (12–128 characters)
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={12}
            maxLength={128}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </p>
        <button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Registering…' : 'Register'}
        </button>
      </form>
      {status === 'success' && <p role="status">Registration successful.</p>}
      {status === 'error' && <p role="alert">{error}</p>}
    </section>
  );
}
