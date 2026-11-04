import { createClient } from '@supabase/supabase-js';

// Cliente del navegador: usa la publishable key, que es pública por diseño.
// Los permisos reales los decide el backend validando el token.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
);

export const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
