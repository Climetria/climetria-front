'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { DEV_BYPASS_AUTH, supabase } from '@/lib/supabase';
import { setAccessTokenCookie } from '@/utils/setAuthCookie';
import { getRoleFromToken, type UserRole } from '@/utils/jwt';

const homeFor = (role: UserRole | null) =>
  role === 'mentor' ? '/dashboard/mentors/tracking' : '/dashboard';

function translateAuthError(message: string) {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos';
  if (message.includes('Email not confirmed'))
    return 'Primero confirma tu correo con el enlace que te enviamos';
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

function SignInForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setError(translateAuthError(error?.message ?? ''));
      setLoading(false);
      return;
    }

    const token = data.session.access_token;
    localStorage.setItem('accessToken', token);
    setAccessTokenCookie(token);
    setUser({ username: data.user.email ?? email, email: data.user.email ?? email });
    router.push(homeFor(getRoleFromToken(token)));
  };

  const resetPassword = async () => {
    setError(null);
    setNotice(null);
    if (!email) {
      setError('Escribe tu correo para enviarte el enlace');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/set-password/`,
    });
    if (error) setError('No se pudo enviar el correo. Inténtalo de nuevo.');
    else
      setNotice('Si el correo está registrado, te llegará un enlace para cambiar la contraseña.');
  };

  return (
    <AuthCard title="Iniciar sesión" description="Plataforma de gestión de pasantías">
      <form onSubmit={signIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </Button>
        <button
          type="button"
          onClick={resetPassword}
          className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </AuthCard>
  );
}

// Solo para desarrollo local: entra sin Supabase con un token falso (sin firma)
function toBase64Url(value: object) {
  return btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function DevLogin() {
  const router = useRouter();
  const { setUser } = useUser();

  const enterAs = (role: UserRole) => {
    const email = `dev-${role}@local.test`;
    const token = [
      toBase64Url({ alg: 'none', typ: 'JWT' }),
      toBase64Url({ sub: `dev-${role}`, email, app_metadata: { roles: [role] } }),
      'dev',
    ].join('.');

    localStorage.setItem('accessToken', token);
    setAccessTokenCookie(token);
    setUser({ username: `dev-${role}`, email });

    router.push(homeFor(role));
  };

  return (
    <AuthCard title="Modo desarrollo" description="Login desactivado (NEXT_PUBLIC_DEV_BYPASS_AUTH)">
      <div className="flex flex-col gap-2">
        <Button onClick={() => enterAs('admin')}>Entrar como admin</Button>
        <Button variant="outline" onClick={() => enterAs('mentor')}>
          Entrar como mentor
        </Button>
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return DEV_BYPASS_AUTH ? <DevLogin /> : <SignInForm />;
}
