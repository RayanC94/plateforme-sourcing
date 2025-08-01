'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react"; // Import icons
import EditQuoteRequest from '@/components/quote-requests/EditQuoteRequest'
 
// Type for the request prop
type QuoteRequest = {
  id: string;
  nom_produit: string;
  quantite: number;
  details?: string;
  photo_url: string;
};

export default function QuoteRequestActions({ request }: { request: QuoteRequest }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleDelete = async () => {
    const { error } = await supabase.from('quote_requests').delete().eq('id', request.id);
    if (error) {
      console.error("Error deleting request:", error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-1 justify-end">
      <EditQuoteRequest request={request} />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}