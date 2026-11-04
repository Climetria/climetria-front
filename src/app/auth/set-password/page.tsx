'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AuthCard } from '@/components/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

// Destino de los enlaces de invitación (mentores nuevos) y de "olvidé mi contraseña".
// Supabase deja la sesión en la URL; supabase-js la lee al cargar la página.
export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash.includes('error=')) {
      setLinkError(true);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    // Si en 5 s no llega una sesión, el enlace no era válido (solo se muestra mientras !ready)
    const timeout = setTimeout(() => setLinkError(true), 5000);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres');
    if (password !== confirm) return setError('Las contraseñas no coinciden');

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError('No se pudo guardar la contraseña. Inténtalo de nuevo.');
      setLoading(false);
      return;
    }
    // Se cierra la sesión para que entre con la contraseña nueva desde el login
    await supabase.auth.signOut();
    router.push('/');
  };

  if (linkError && !ready) {
    return (
      <AuthCard
        title="Enlace no válido"
        description="El enlace expiró o ya se usó. Pide uno nuevo desde «¿Olvidaste tu contraseña?»."
      >
        <Button className="w-full" onClick={() => router.push('/')}>
          Ir al inicio de sesión
        </Button>
      </AuthCard>
    );
  }

  if (!ready) {
    return (
      <AuthCard title="Verificando enlace…">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Define tu contraseña" description="La usarás para entrar a Climetria">
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña nueva</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Repite la contraseña</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar contraseña
        </Button>
      </form>
    </AuthCard>
  );
}
