'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, loginWithOAuth } from '@/lib/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = mode === 'login'
      ? await login({ email: form.email, password: form.password })
      : await register(form);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push('/admin');
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <input placeholder="First name" onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <input placeholder="Last name" onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </>
        )}
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>

      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        Switch to {mode === 'login' ? 'Register' : 'Login'}
      </button>

      <hr />

      <button onClick={() => loginWithOAuth('google')}>Sign in with Google</button>
      <button onClick={() => loginWithOAuth('github')}>Sign in with GitHub</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}