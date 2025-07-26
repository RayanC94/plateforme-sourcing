import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EntreprisesManager from './EntreprisesManager';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entreprises } = await supabase
    .from('entreprises')
    .select('id, nom_entreprise')
    .eq('id_client_session', user.id);

  const session = { user }; 

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <EntreprisesManager entreprises={entreprises || []} session={session} />
    </div>
  );
}