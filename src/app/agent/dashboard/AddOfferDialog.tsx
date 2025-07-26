'use client';

import { useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AddOfferDialog({ agentId, quoteRequestId, quantity }: { agentId: string, quoteRequestId: string, quantity: number }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [unitPriceRmb, setUnitPriceRmb] = useState('');
  const [clientCurrency, setClientCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState('');
  const [specification, setSpecification] = useState('');
  const [packing, setPacking] = useState('');
  const [remark, setRemark] = useState('');
  const [qualityDetails, setQualityDetails] = useState('');
  const [unitWeight, setUnitWeight] = useState('');
  const [unitVolume, setUnitVolume] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

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
    setIsSubmitting(true);
    
    let photoUrl = null;
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `supplier-offers/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);

      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      photoUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from('supplier_offers').insert({
      id_demande_devis: quoteRequestId,
      id_agent: agentId,
      nom_fournisseur: supplierName,
      prix_unitaire_rmb: parseFloat(unitPriceRmb) || null,
      client_currency: clientCurrency,
      exchange_rate: parseFloat(exchangeRate) || null,
      product_specification: specification,
      packing: packing,
      remark: remark,
      details_qualite: qualityDetails,
      photo_url_fournisseur: photoUrl,
    });

    if (insertError) {
      alert(`Error creating offer: ${insertError.message}`);
      setIsSubmitting(false);
      return;
    }

    const { error: updateError } = await supabase.from('quote_requests').update({
        poids_estime_unitaire_kg: parseFloat(unitWeight) || null,
        volume_estime_unitaire_m3: parseFloat(unitVolume) || null,
      }).eq('id', quoteRequestId);
    
    if (updateError) {
      alert(`Error updating logistics: ${updateError.message}`);
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add Offer</Button></DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Add Supplier Offer</DialogTitle></DialogHeader>
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
                <Label>Exchange Rate (RMB to Currency)</Label>
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
            <Label>Factory Photo (Optional)</Label>
            <Input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <div className="mt-4 p-2 border rounded-md space-y-1 text-sm bg-slate-50">
            <div className="flex justify-between font-semibold"><span>Calculated Unit Price ({clientCurrency}):</span> <strong>{calculations.priceClient.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>Calculated Total (RMB):</span> <strong>{calculations.totalRmb.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>Calculated Total ({clientCurrency}):</span> <strong>{calculations.totalClient.toFixed(2)}</strong></div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}