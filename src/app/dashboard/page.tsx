import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardDnD from './DashboardDnD';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: groups } = await supabase
    .from('quote_groups')
    .select('id, nom_groupe, quote_requests ( id, nom_produit, quantite, photo_url )')
    .eq('id_client_session', user.id)
    .order('created_at', { ascending: false });

  const { data: ungroupedRequests } = await supabase
    .from('quote_requests')
    .select('*')
    .is('id_groupe_devis', null)
    .order('created_at', { ascending: false });

  const session = { user };

  return (
    <DashboardDnD
      groups={groups || []}
      ungroupedRequests={ungroupedRequests || []}
      session={session}
    />
  );
}
