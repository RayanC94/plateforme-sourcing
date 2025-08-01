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
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import QuoteSummary from './QuoteSummary';
import QuoteRequestActions from '@/components/quote-requests/QuoteRequestActions';
import ImageLightbox from '@/components/ui/ImageLightbox'; // Using the alias for a cleaner import

export default async function GroupePage({ params: { id: groupId } }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: quoteGroup } = await supabase
    .from('quote_groups')
    .select('nom_groupe, status')
    .eq('id', groupId)
    .single();

  const { data: quoteRequests } = await supabase
    .from('quote_requests')
    .select(`*, supplier_offers ( * )`)
    .eq('id_groupe_devis', groupId)
    .eq('supplier_offers.est_visible_client', true)
    .order('created_at', { ascending: false });

  if (!quoteGroup) {
    return <div>Groupe de devis non trouvé.</div>;
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{quoteGroup.nom_groupe}</h1>
        <CreateQuoteRequest groupId={groupId} />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Demandes de Devis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Votre Photo</TableHead>
                <TableHead>Photo Usine</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Spécification</TableHead>
                <TableHead>Packing</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Prix Unitaire (RMB)</TableHead>
                <TableHead>Prix Unitaire (Client)</TableHead>
                <TableHead>Total (Client)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quoteRequests && quoteRequests.map(request => {
                const visibleOffer = request.supplier_offers?.[0];
                
                const priceRmb = visibleOffer?.prix_unitaire_rmb || 0;
                const rate = visibleOffer?.exchange_rate || 0;
                const clientCurrency = visibleOffer?.client_currency || '';
                const priceClient = rate > 0 ? priceRmb / rate : 0;
                const totalClient = priceClient * request.quantite;

                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.photo_url && (
                         <ImageLightbox src={request.photo_url} alt={request.nom_produit} />
                      )}
                    </TableCell>
                    <TableCell>
                      {visibleOffer?.photo_url_fournisseur ? (
                        <ImageLightbox src={visibleOffer.photo_url_fournisseur} alt={visibleOffer.nom_fournisseur || 'Factory'} />
                      ) : (
                        <span className="text-xs text-gray-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{request.nom_produit}</TableCell>
                    <TableCell className="whitespace-normal break-words max-w-xs">{visibleOffer?.product_specification || 'N/A'}</TableCell>
                    <TableCell>{visibleOffer?.packing || 'N/A'}</TableCell>
                    <TableCell>{request.quantite}</TableCell>
                    <TableCell>¥{priceRmb.toFixed(2)}</TableCell>
                    <TableCell>{priceClient.toFixed(2)} {clientCurrency}</TableCell>
                    <TableCell className="font-semibold text-right">{totalClient.toFixed(2)} {clientCurrency}</TableCell>
                    <TableCell>
                      <QuoteRequestActions request={request} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {(!quoteRequests || quoteRequests.length === 0) && (
            <p className="text-center text-gray-500 py-4">Aucune demande de devis pour le moment.</p>
          )}
        </CardContent>
      </Card>
      
      <QuoteSummary requests={quoteRequests || []} groupId={groupId} groupStatus={quoteGroup.status} />
    </div>
  );
}
