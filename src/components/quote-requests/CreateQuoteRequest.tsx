'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assurez-vous que c'est importé
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CreateQuoteRequest({ groupId }: { groupId?: string | null }) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [details, setDetails] = useState(''); // <-- Nouvel état pour les détails
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !productName.trim() || !quantity.trim()) {
      alert("Le nom, la quantité et la photo sont requis.");
      return;
    }
    setIsSubmitting(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `quote-requests/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);

    if (uploadError) {
      console.error("Erreur d'upload:", uploadError.message);
      setIsSubmitting(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

    const { error: insertError } = await supabase.from('quote_requests').insert({
      id_groupe_devis: groupId || null,
      nom_produit: productName,
      quantite: parseInt(quantity, 10),
      photo_url: publicUrl,
      details: details, // <-- Enregistrer les détails
    });

    if (!insertError) {
      setOpen(false);
      setProductName('');
      setQuantity('');
      setDetails(''); // <-- Réinitialiser le champ
      setFile(null);
      router.refresh();
    } else {
      console.error("Erreur d'insertion:", insertError.message);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Ajouter une demande</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle demande de devis</DialogTitle>
            <DialogDescription>
              Renseignez les détails du produit que vous souhaitez sourcer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="productName" className="text-right">Produit</Label>
              <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantité</Label>
              <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">Photo</Label>
              <Input id="photo" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" required />
            </div>
            {/* Champ de détails ajouté */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="details" className="text-right">Détails</Label>
              <Textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} className="col-span-3" placeholder="Spécifications, couleur, matériaux... (Optionnel)" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Ajouter la demande'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}