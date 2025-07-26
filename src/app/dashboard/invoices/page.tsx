import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import DownloadInvoiceButton from './DownloadInvoiceButton';

export default async function InvoicesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quoteGroups } = await supabase.from('quote_groups').select('id').eq('id_client_session', user.id);
  const groupIds = quoteGroups?.map(group => group.id) || [];

  let invoices: any[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase.from('invoices').select(`*, quote_groups ( nom_groupe )`).in('id_groupe_devis', groupIds);
    invoices = data || [];
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Invoices</h1>
      <Card>
        <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Quote Group</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.numero_facture}</TableCell>
                  <TableCell>{invoice.quote_groups.nom_groupe}</TableCell>
                  <TableCell>${invoice.montant_total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(invoice.date_emission).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'Payée' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DownloadInvoiceButton invoiceId={invoice.id} invoiceNumber={invoice.numero_facture} />
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