'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';

type Invoice = {
  id: string;
  status: string;
};

// English status options
const statusOptions = {
    PENDING: 'En attente de paiement',
    DOWN_PAYMENT: 'Acompte',
    PAID: 'Payée',
};

export default function UpdateInvoiceStatus({ invoice }: { invoice: Invoice }) {
  const [status, setStatus] = useState(invoice.status);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    setStatus(newStatus);
    const { error } = await supabase
      .from('invoices')
      .update({ status: newStatus })
      .eq('id', invoice.id);

    if (error) {
      console.error("Error updating status:", error);
      setStatus(invoice.status); // Revert on error
    } else {
      const { data: invoiceData } = await supabase.from('invoices').select('id_groupe_devis').eq('id', invoice.id).single();
      if (invoiceData) {
        // If payment is made, start production. If reverted, reset tracking.
        const newGroupStatus = (newStatus === statusOptions.DOWN_PAYMENT || newStatus === statusOptions.PAID)
      
          ? 'En production'
          : 'Facturé';
        
        await supabase
          .from('quote_groups')
          .update({ status: newGroupStatus })
          .eq('id', invoiceData.id_groupe_devis);
      }
    }

    setIsLoading(false);
    router.refresh();
  };
  
  const getBadgeVariant = (currentStatus: string) => {
    switch (currentStatus) {
      case statusOptions.PAID: return 'default';
      case statusOptions.DOWN_PAYMENT: return 'secondary';
      case statusOptions.PENDING: return 'outline';
      default: return 'secondary';
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Badge variant={getBadgeVariant(status)} className="min-w-[150px] text-center justify-center">{status}</Badge>
      <Select onValueChange={handleStatusChange} defaultValue={status} disabled={isLoading}>
        <SelectTrigger className="min-w-[180px]">
         <SelectValue placeholder="Changer le statut" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value={statusOptions.PENDING}>En attente de paiement</SelectItem>
          <SelectItem value={statusOptions.DOWN_PAYMENT}>Acompte</SelectItem>
          <SelectItem value={statusOptions.PAID}>Payée</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
