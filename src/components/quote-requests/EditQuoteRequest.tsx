'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from 'lucide-react'; // Import icon

type QuoteRequest = {
  id: string;
  nom_produit: string;
  quantite: number;
  details?: string;
  photo_url: string | null;
};

export default function EditQuoteRequest({ request }: { request: QuoteRequest }) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState(request.nom_produit);
  const [quantity, setQuantity] = useState(request.quantite.toString());
  const [details, setDetails] = useState(request.details || '');
  const [newFile, setNewFile] = useState<File | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedPhotoUrl = request.photo_url || '';

    if (newFile) {
      const fileExt = newFile.name.split('.').pop();
      const fileName = `quote-requests/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, newFile);

      if (uploadError) { console.error("Error d'upload:", uploadError.message); return; }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      updatedPhotoUrl = publicUrl;
    }

    await supabase.from('quote_requests').update({
        nom_produit: productName,
        quantite: parseInt(quantity, 10),
        details: details,
        photo_url: updatedPhotoUrl,
      }).eq('id', request.id);

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader><DialogTitle>Modifier la demande</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="productName">Produit</Label>
            <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />

            <Label htmlFor="quantity">Quantité</Label>
            <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

            <Label htmlFor="details">Détails (Optionnel)</Label>
            <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} />

              <Label htmlFor="photo">Changer la photo</Label>
              {request.photo_url && (
                <Image src={request.photo_url} alt="Photo actuelle" width={80} height={80} className="rounded-md object-cover my-2" />
              )}
              <Input id="photo" type="file" onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)} />
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}