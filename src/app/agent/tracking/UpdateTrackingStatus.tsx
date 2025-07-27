'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statuses = ["En production", "Expédié", "En transit", "Livré", "Archivé"];

export default function UpdateTrackingStatus({ quoteGroup }: { quoteGroup: { id: string, status: string } }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    await supabase
      .from('quote_groups')
      .update({ status: newStatus })
      .eq('id', quoteGroup.id);
    router.refresh();
  };

  return (
    <Select defaultValue={quoteGroup.status} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map(status => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}