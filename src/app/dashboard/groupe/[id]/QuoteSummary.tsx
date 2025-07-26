'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define types for the data we receive
type Offer = { prix_unitaire_rmb: number; exchange_rate: number; client_currency: string; };
type Request = { quantite: number; poids_estime_unitaire_kg: number; volume_estime_unitaire_m3: number; supplier_offers: Offer[]; };
type Formula = { id: string; methode: string; type_calcul: string; prix_par_unite: number; frais_fixes: number; };

interface QuoteSummaryProps {
  requests: Request[];
  groupId: string;
  groupStatus: string;
}

export default function QuoteSummary({ requests, groupId, groupStatus }: QuoteSummaryProps) {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchFormulas = async () => {
      const { data } = await supabase.from('shipping_formulas').select('*');
      if (data) setFormulas(data);
    };
    fetchFormulas();
  }, [supabase]);

  const { subtotal, totalWeight, totalVolume, clientCurrency } = useMemo(() => {
    let currency = 'EUR'; // Default
    const totals = requests.reduce((acc, req) => {
      const offer = req.supplier_offers?.[0];
      if (offer && offer.exchange_rate > 0) {
        acc.subtotal += (req.quantite * offer.prix_unitaire_rmb) / offer.exchange_rate;
        acc.totalWeight += req.quantite * (req.poids_estime_unitaire_kg || 0);
        acc.totalVolume += req.quantite * (req.volume_estime_unitaire_m3 || 0);
        currency = offer.client_currency;
      }
      return acc;
    }, { subtotal: 0, totalWeight: 0, totalVolume: 0 });
    return { ...totals, clientCurrency: currency };
  }, [requests]);

  const shippingOptions = useMemo(() => {
    return formulas.map(formula => {
      let cost = 0;
      if (formula.type_calcul === 'Poids') cost = totalWeight * formula.prix_par_unite + formula.frais_fixes;
      else if (formula.type_calcul === 'Volume') cost = totalVolume * formula.prix_par_unite + formula.frais_fixes;
      return { ...formula, cost };
    });
  }, [formulas, totalWeight, totalVolume]);

  const selectedShippingCost = shippingOptions.find(opt => opt.id === selectedShippingId)?.cost || 0;
  const grandTotal = subtotal + selectedShippingCost;

  const handleValidate = async () => {
    if (!selectedShippingId) {
      alert("Please select a shipping method.");
      return;
    }
    const selectedOption = shippingOptions.find(opt => opt.id === selectedShippingId);
    if (!selectedOption) return;

    const { error } = await supabase
      .from('quote_groups')
      .update({
        status: 'Validé',
        methode_transport_choisie: selectedOption.methode,
        cout_transport_estime: selectedOption.cost,
      })
      .eq('id', groupId);
    
    if (error) {
      alert(`Error validating quote: ${error.message}`);
    } else {
      alert('Quote validated successfully!');
      router.refresh();
    }
  };

  if (groupStatus === 'Validé') {
    return (
      <Card className="mt-6 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Quote Validated</CardTitle>
          <CardDescription>This quote has been approved and is now being processed.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
        <CardDescription>Review the costs and validate your quote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between font-medium">
          <span>Products Subtotal ({clientCurrency})</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        <div>
          <Label>Choose Shipping Method:</Label>
          <RadioGroup onValueChange={setSelectedShippingId} className="mt-2 space-y-1">
            {shippingOptions.map(option => (
              <div key={option.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.methode}</Label>
                </div>
                <span>+ {option.cost.toFixed(2)} {clientCurrency}</span>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-between text-xl font-bold border-t pt-4">
          <span>Grand Total</span>
          <span>{grandTotal.toFixed(2)} {clientCurrency}</span>
        </div>
        <Button onClick={handleValidate} disabled={!selectedShippingId} className="w-full">
          Validate Quote
        </Button>
      </CardContent>
    </Card>
  );
}