import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectsManager from '../ProjectsManager';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entreprises } = await supabase
    .from('entreprises')
    .select('id, nom_entreprise, address, country, business_registration')
    .eq('id_client_session', user.id);

  const { data: projects } = await supabase
    .from('quote_groups')
    .select('id, nom_groupe, entreprises!inner ( nom_entreprise )')
    .eq('id_client_session', user.id)
    .order('created_at', { ascending: false });

  const normalizedProjects = (projects || []).map((p) => ({
    ...p,
    entreprises: p.entreprises?.[0] || { nom_entreprise: 'Inconnu' }
  }));

  const session = { user };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Projets</h1>
      <ProjectsManager
        entreprises={entreprises || []}
        projects={normalizedProjects}
        session={session}
      />
    </div>
  );
}