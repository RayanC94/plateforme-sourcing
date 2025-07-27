import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpdateTrackingStatus from './UpdateTrackingStatus';

export default async function AgentTrackingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // CORRECTION : On récupère les groupes de devis qui sont en cours de production/expédition
  const { data: quoteGroups, error } = await supabase
    .from('quote_groups')
    .select(`
      *,
      entreprises (nom_entreprise)
    `)
    .in('status', ['En production', 'Expédié', 'En transit', 'Livré']);

  if (error) {
    console.error("Erreur lors de la récupération des commandes à suivre:", error);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Suivi des Commandes</h1>
      <Card>
        <CardHeader><CardTitle>Commandes en Cours</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande (Groupe)</TableHead>
                <TableHead>Client (Entreprise)</TableHead>
                <TableHead>Statut de Production/Expédition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteGroups?.map(group => (
                <TableRow key={group.id}>
                  <TableCell>{group.nom_groupe}</TableCell>
                  <TableCell>{group.entreprises.nom_entreprise}</TableCell>
                  <TableCell>
                    <UpdateTrackingStatus quoteGroup={group} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
