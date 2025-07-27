'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface GenerateInvoiceDialogProps {
  groupId: string;
  totalAmount: number;
}

type SellerProfile = {
  id: string;
  company_name: string;
};

export default function GenerateInvoiceDialog({ groupId, totalAmount }: GenerateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerProfiles, setSellerProfiles] = useState<SellerProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const fetchProfiles = async () => {
        const { data } = await supabase.from('seller_profiles').select('id, company_name');
        if (data) setSellerProfiles(data);
      };
      fetchProfiles();
    }
  }, [open, supabase]);

  const handleGenerate = async () => {
    if (!selectedProfileId) {
      alert('Please select a seller profile.');
      return;
    }
    setIsLoading(true);

    const invoiceNumber = `INV-${Date.now()}`;
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30);

    const { error: insertError } = await supabase.from('invoices').insert({
      id_groupe_devis: groupId,
      id_seller_profile: selectedProfileId,
      numero_facture: invoiceNumber,
      montant_total: totalAmount,
      date_emission: today.toISOString(),
      date_echeance: dueDate.toISOString(),
      status: 'En attente de paiement',
    });

    if (insertError) {
      alert(`Error creating invoice: ${insertError.message}`);
      setIsLoading(false);
      return;
    }

    await supabase
      .from('quote_groups')
      .update({ status: 'Facturé' })
      .eq('id', groupId);

    alert('Invoice generated successfully!');
    setOpen(false);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Generate Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader>
        <div className="py-4">
          <Label htmlFor="seller-profile">Select Seller Profile to use on this invoice:</Label>
          <Select onValueChange={setSelectedProfileId}>
            <SelectTrigger id="seller-profile">
              <SelectValue placeholder="Select a profile..." />
            </SelectTrigger>
            <SelectContent>
              {sellerProfiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isLoading || !selectedProfileId}>
            {isLoading ? 'Generating...' : 'Confirm & Generate Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
