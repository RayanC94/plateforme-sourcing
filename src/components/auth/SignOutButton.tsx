// src/components/auth/SignOutButton.tsx

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redirige vers la page d'accueil
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Se déconnecter
    </Button>
  );
}