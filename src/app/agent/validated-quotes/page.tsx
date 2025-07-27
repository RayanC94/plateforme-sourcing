import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignOutButton from '../../../components/auth/SignOutButton';
import GenerateInvoiceDialog from './GenerateInvoiceDialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ValidatedQuotesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'agent') {
    redirect('/login');
  }

  const { data: quoteGroups, error } = await supabase
    .from('quote_groups')
    .select(`
      id,
      nom_groupe,
      status,
      cout_transport_estime,
      quote_requests (
        quantite,
        supplier_offers (
          prix_unitaire_rmb,
          exchange_rate,
          client_currency
        )
      )
    `)
    .eq('status', 'Validé');

  if (error) console.error("Error fetching validated quotes:", error);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Validated Quotes</h1>
          <p className="text-gray-500">Generate invoices for approved quotes.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/agent/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
          {/* LIEN AJOUTÉ */}
          <Link href="/agent/invoices">
            <Button variant="outline">Invoices</Button>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Ready for Invoicing</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteGroups?.map(group => {
                let currency = 'EUR';
                const subtotal = group.quote_requests.reduce((acc, req) => {
                  const offer = req.supplier_offers?.[0];
                  if (offer && offer.exchange_rate && offer.exchange_rate > 0) {
                    if(offer.client_currency) currency = offer.client_currency;
                    return acc + (req.quantite * (offer.prix_unitaire_rmb || 0)) / offer.exchange_rate;
                  }
                  return acc;
                }, 0);
                const totalAmount = subtotal + (group.cout_transport_estime || 0);

                return (
                  <TableRow key={group.id}>
                    <TableCell>{group.nom_groupe}</TableCell>
                    <TableCell>{totalAmount.toFixed(2)} {currency}</TableCell>
                    <TableCell>
                      <GenerateInvoiceDialog groupId={group.id} totalAmount={totalAmount} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
