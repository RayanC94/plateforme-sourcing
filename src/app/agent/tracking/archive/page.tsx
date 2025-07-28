import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ArchiveTrackingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quoteGroups, error } = await supabase
    .from('quote_groups')
    .select(`*, entreprises (nom_entreprise)`)
    .eq('status', 'Archivé');

  if (error) {
    console.error('Erreur lors de la récupération des archives:', error);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Commandes Archivées</h1>
      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande (Groupe)</TableHead>
                <TableHead>Client (Entreprise)</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteGroups?.map(group => (
                <TableRow key={group.id}>
                  <TableCell>{group.nom_groupe}</TableCell>
                  <TableCell>{group.entreprises?.nom_entreprise}</TableCell>
                  <TableCell>{group.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}