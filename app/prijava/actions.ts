'use server';

import { signIn } from '@/auth';

export async function prijavaGoogle(formData: FormData) {
  const raw = String(formData.get('callbackUrl') ?? '/inventar');
  // Only allow relative paths, so a crafted callbackUrl cannot become an open redirect.
  const redirectTo = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/inventar';
  await signIn('google', { redirectTo });
}
