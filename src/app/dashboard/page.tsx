import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectsManager from './ProjectsManager';
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import QuoteRequestActions from '@/components/quote-requests/QuoteRequestActions';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: projects } = await supabase
    .from('quote_groups')
    .select('id, nom_groupe, entreprises!inner ( nom_entreprise )') // Utilise ! pour forcer la jointure
    .eq('id_client_session', user.id)
    .order('created_at', { ascending: false });

  const { data: ungroupedRequests } = await supabase
    .from('quote_requests')
    .select('*')
    .is('id_groupe_devis', null)
    .order('created_at', { ascending: false });

  const normalizedProjects = (projects || []).map((p) => ({
    ...p,
    entreprises: p.entreprises?.[0] || { nom_entreprise: 'Inconnu' } // on extrait le premier élément
  }));

  const session = { user };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <section className="mb-8">
        <header className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Requêtes seules</h2>
          <CreateQuoteRequest />
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Demandes de Devis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ungroupedRequests && ungroupedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.photo_url && (
                        <ImageLightbox src={request.photo_url} alt={request.nom_produit} />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{request.nom_produit}</TableCell>
                    <TableCell>{request.quantite}</TableCell>
                    <TableCell className="text-right">
                      <QuoteRequestActions request={request} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!ungroupedRequests || ungroupedRequests.length === 0) && (
              <p className="text-center text-gray-500 py-4">Aucune demande libre.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <ProjectsManager
        projects={normalizedProjects}
        session={session}
      />
    </div>
  );
}
