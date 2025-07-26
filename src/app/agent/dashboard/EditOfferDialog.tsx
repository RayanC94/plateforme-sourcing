'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Type for the offer prop
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
  photo_url_fournisseur?: string;
};

// Props now include 'open' and 'onOpenChange' to be controlled from the parent
interface EditOfferDialogProps {
  offer: Offer;
  quoteRequestId: string;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditOfferDialog({ offer, quoteRequestId, quantity, open, onOpenChange }: EditOfferDialogProps) {
  // States for form fields are initialized from the 'offer' prop
  const [supplierName, setSupplierName] = useState(offer.nom_fournisseur);
  const [unitPriceRmb, setUnitPriceRmb] = useState(offer.prix_unitaire_rmb?.toString() || '');
  const [clientCurrency, setClientCurrency] = useState(offer.client_currency || 'EUR');
  const [exchangeRate, setExchangeRate] = useState(offer.exchange_rate?.toString() || '');
  const [specification, setSpecification] = useState(offer.product_specification || '');
  const [packing, setPacking] = useState(offer.packing || '');
  const [remark, setRemark] = useState(offer.remark || '');
  const [qualityDetails, setQualityDetails] = useState(offer.details_qualite);
  const [unitWeight, setUnitWeight] = useState('');
  const [unitVolume, setUnitVolume] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchLogistics = async () => {
      const { data } = await supabase.from('quote_requests').select('poids_estime_unitaire_kg, volume_estime_unitaire_m3').eq('id', quoteRequestId).single();
      if (data) {
        setUnitWeight(data.poids_estime_unitaire_kg?.toString() || '');
        setUnitVolume(data.volume_estime_unitaire_m3?.toString() || '');
      }
    };
    if (open) {
      fetchLogistics();
    }
  }, [open, supabase, quoteRequestId]);

  const calculations = useMemo(() => {
    const priceRmb = parseFloat(unitPriceRmb) || 0;
    const rate = parseFloat(exchangeRate) || 0;
    const qty = quantity || 0;
    const priceClient = rate > 0 ? priceRmb / rate : 0;
    const totalRmb = priceRmb * qty;
    const totalClient = priceClient * qty;
    return { priceClient, totalRmb, totalClient };
  }, [unitPriceRmb, exchangeRate, quantity]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedPhotoUrl = offer.photo_url_fournisseur;

    if (newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `supplier-offers/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, newFile);

      if (uploadError) { console.error("Error uploading new photo:", uploadError.message); return; }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      updatedPhotoUrl = publicUrl;
    }

    await supabase.from('supplier_offers').update({
        nom_fournisseur: supplierName,
        prix_unitaire_rmb: parseFloat(unitPriceRmb),
        client_currency: clientCurrency,
        exchange_rate: parseFloat(exchangeRate),
        product_specification: specification,
        packing: packing,
        remark: remark,
        details_qualite: qualityDetails,
        photo_url_fournisseur: updatedPhotoUrl,
      }).eq('id', offer.id);

    await supabase.from('quote_requests').update({
        poids_estime_unitaire_kg: parseFloat(unitWeight),
        volume_estime_unitaire_m3: parseFloat(unitVolume),
      }).eq('id', quoteRequestId);

    onOpenChange(false); // Use the prop to close the dialog
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Note: There is no <DialogTrigger> here because it's in the parent component */}
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Edit Offer</DialogTitle></DialogHeader>
          <div className="grid gap-2 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <Label>Supplier Name</Label>
            <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
            <Label>Product Specification</Label>
            <Input value={specification} onChange={(e) => setSpecification(e.target.value)} />
            <Label>Packing</Label>
            <Input value={packing} onChange={(e) => setPacking(e.target.value)} />
            <Label>Unit Price (RMB)</Label>
            <Input type="number" step="0.01" value={unitPriceRmb} onChange={(e) => setUnitPriceRmb(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Client Currency</Label>
                <Select value={clientCurrency} onValueChange={setClientCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exchange Rate</Label>
                <Input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required />
              </div>
            </div>
            <Label>Unit Weight (kg)</Label>
            <Input type="number" step="0.01" value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)} required />
            <Label>Unit Volume (m³)</Label>
            <Input type="number" step="0.001" value={unitVolume} onChange={(e) => setUnitVolume(e.target.value)} required />
            <Label>Quality/Production Details</Label>
            <Textarea value={qualityDetails} onChange={(e) => setQualityDetails(e.target.value)} />
            <Label>Remark</Label>
            <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} />
            <Label>Change Factory Photo</Label>
            {offer.photo_url_fournisseur && !newFile && (
              <div className="my-2"><Image src={offer.photo_url_fournisseur} alt="Current factory photo" width={80} height={80} className="rounded-md object-cover" /></div>
            )}
            <Input type="file" onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)} />
          </div>
           <div className="mt-4 p-2 border rounded-md space-y-1 text-sm bg-slate-50">
            <div className="flex justify-between font-semibold"><span>Calculated Unit Price ({clientCurrency}):</span> <strong>{calculations.priceClient.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>Calculated Total (RMB):</span> <strong>{calculations.totalRmb.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>Calculated Total ({clientCurrency}):</span> <strong>{calculations.totalClient.toFixed(2)}</strong></div>
          </div>
          <DialogFooter className="mt-4"><Button type="submit">Save Changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}