import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectsManager from '../ProjectsManager';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: groups } = await supabase
    .from('quote_groups')
    .select('id, nom_groupe, quote_requests ( id, nom_produit, quantite, photo_url )')
    .eq('id_client_session', user.id)
    .order('created_at', { ascending: false });

  const session = { user };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Projets</h1>
      <ProjectsManager
        projects={groups || []}
        session={session}
      />
    </div>
  );
}