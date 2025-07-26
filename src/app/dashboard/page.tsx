import { createClient } from '@/lib/supabase/server'; // <-- MODIFIÉ
import { redirect } from 'next/navigation';
import SignOutButton from '../../components/auth/SignOutButton';
import EntreprisesManager from './EntreprisesManager';

export default async function Dashboard() {
  const supabase = createClient(); // <-- MODIFIÉ

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entreprises, error } = await supabase
    .from('entreprises')
    .select('id, nom_entreprise')
    .eq('id_client_session', user.id);

  if (error) {
    console.error("Erreur de chargement des entreprises", error);
  }

  const session = { user }; 

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue, {user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <main>
        <EntreprisesManager entreprises={entreprises || []} session={session} />
      </main>
    </div>
  );
}