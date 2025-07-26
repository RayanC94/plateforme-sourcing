'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"; // Import icons
import EditOfferDialog from './EditOfferDialog';

// Types
type Offer = { 
  id: string; 
  nom_fournisseur: string;
  prix_unitaire_rmb?: number;
  client_currency?: string;
  exchange_rate?: number;
  product_specification?: string;
  packing?: string;
  remark?: string;
  details_qualite: string; 
  est_visible_client: boolean; 
  photo_url_fournisseur?: string;
};
type Request = { 
  id: string; 
  supplier_offers: Offer[]; 
  quantite: number; 
  poids_estime_unitaire_kg?: number;
  volume_estime_unitaire_m3?: number;
};

export default function ManageOffersDialog({ request }: { request: Request }) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const handleVisibility = async (offerId: string, visible: boolean) => {
    setIsLoading(true);
    if (visible) {
      await supabase.from('supplier_offers').update({ est_visible_client: false }).eq('id_demande_devis', request.id);
    }
    await supabase.from('supplier_offers').update({ est_visible_client: visible }).eq('id', offerId);
    router.refresh();
    setIsLoading(false);
  };
  
  const handleDelete = async (offerId: string) => {
    await supabase.from('supplier_offers').delete().eq('id', offerId);
    router.refresh();
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {request.supplier_offers.length} Offer(s)
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-7xl">
          <DialogHeader><DialogTitle>Manage Offers</DialogTitle></DialogHeader>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Packing</TableHead>
                  <TableHead>Unit Weight</TableHead>
                  <TableHead>Unit Volume</TableHead>
                  <TableHead>Price (RMB)</TableHead>
                  <TableHead>Converted Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.supplier_offers.map(offer => {
                  const priceRmb = offer.prix_unitaire_rmb || 0;
                  const rate = offer.exchange_rate || 0;
                  const priceClient = rate > 0 ? priceRmb / rate : 0;

                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        {offer.photo_url_fournisseur ? (
                          <Image src={offer.photo_url_fournisseur} alt={offer.nom_fournisseur || 'Factory'} width={40} height={40} className="rounded-md object-cover"/>
                        ) : ( <span className="text-xs text-gray-500">No Photo</span> )}
                      </TableCell>
                      <TableCell>{offer.nom_fournisseur}</TableCell>
                      <TableCell>{offer.product_specification}</TableCell>
                      <TableCell>{offer.packing}</TableCell>
                      <TableCell>{request.poids_estime_unitaire_kg} kg</TableCell>
                      <TableCell>{request.volume_estime_unitaire_m3} m³</TableCell>
                      <TableCell>¥{priceRmb.toFixed(2)}</TableCell>
                      <TableCell>{priceClient.toFixed(2)} {offer.client_currency}</TableCell>
                      <TableCell>
                        {offer.est_visible_client ? <Badge>Visible</Badge> : <Badge variant="secondary">Hidden</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {offer.est_visible_client ? (
                            <Button variant="ghost" size="icon" onClick={() => handleVisibility(offer.id, false)} disabled={isLoading}>
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleVisibility(offer.id, true)} disabled={isLoading}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setEditingOffer(offer)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                              <AlertDialogDescription>This will permanently delete the offer.</AlertDialogDescription>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(offer.id)}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {editingOffer && (
        <EditOfferDialog
          offer={editingOffer}
          quoteRequestId={request.id}
          quantity={request.quantite}
          open={!!editingOffer}
          onOpenChange={() => setEditingOffer(null)}
        />
      )}
    </>
  );
}