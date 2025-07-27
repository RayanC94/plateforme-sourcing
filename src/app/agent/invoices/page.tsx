import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpdateInvoiceStatus from './UpdateInvoiceStatus';

export default async function AgentInvoicesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: invoices } = await supabase.from('invoices').select(`*, quote_groups(nom_groupe)`).order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Gestion des Factures</h1>
      <Card>
        <CardHeader><CardTitle>Toutes les Factures</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Groupe</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut du Paiement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.numero_facture}</TableCell>
                  <TableCell>{invoice.quote_groups?.nom_groupe}</TableCell>
                  <TableCell>${invoice.montant_total.toFixed(2)}</TableCell>
                  <TableCell>
                    <UpdateInvoiceStatus invoice={invoice} />
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
