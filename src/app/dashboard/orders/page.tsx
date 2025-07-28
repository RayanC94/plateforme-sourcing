import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

export default async function OrdersPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quoteGroups } = await supabase
    .from('quote_groups')
    .select(`*, entreprises(id, nom_entreprise, address, country, business_registration), invoices(status)`)
    .eq('id_client_session', user.id)
    .in('status', ['En production', 'Expédié', 'En transit', 'Livré']);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Mes Commandes</h1>
      <Card>
        <CardHeader><CardTitle>Historique et Suivi des Commandes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Statut Paiement</TableHead>
                <TableHead>Statut Suivi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteGroups?.map(group => (
                <TableRow key={group.id}>
                  <TableCell>{group.nom_groupe}</TableCell>
                  <TableCell>{group.entreprises.nom_entreprise}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{group.invoices[0]?.status || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge>{group.status}</Badge>
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