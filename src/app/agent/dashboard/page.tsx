import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddOfferDialog from './AddOfferDialog';
import ManageOffersDialog from './ManageOffersDialog';
import ImageLightbox from '../../../components/ui/ImageLightbox'; // Import du nouveau composant

export default async function AgentDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'agent') return redirect('/dashboard');

  const { data: requests, error } = await supabase.from('quote_requests').select(`*, quote_groups (nom_groupe, entreprises ( nom_entreprise )), supplier_offers ( * )`);
    
  if (error) console.error("Error fetching requests:", error);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Tableau de Bord Agent</h1>
      <Card>
        <CardHeader><CardTitle>Toutes les Demandes Client</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Produit</TableHead>
                <TableHead>Détails Client</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="flex items-center gap-3">
                    {/* Utilisation du nouveau composant pour l'image */}
                    <ImageLightbox src={request.photo_url} alt={request.nom_produit} />
                    <span className="font-medium">{request.nom_produit}</span>
                  </TableCell>
                  {/* Correction pour le retour à la ligne */}
                  <TableCell className="whitespace-normal break-words max-w-xs">{request.details}</TableCell>
                  <TableCell>{(request.quote_groups as any)?.entreprises?.nom_entreprise}</TableCell>
                  <TableCell>{request.quantite}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <AddOfferDialog agentId={user.id} quoteRequestId={request.id} quantity={request.quantite} />
                    <ManageOffersDialog request={request} />
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
