// src/app/dashboard/entreprise/[id]/CreateQuoteGroup.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CreateQuoteGroup({ entrepriseId }: { entrepriseId: string }) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('quote_groups').insert({
      nom_groupe: groupName,
      id_entreprise: entrepriseId,
      id_client_session: user.id, // ID de la session client
      cree_par_id: user.id,       // ID de l'utilisateur qui crée
    });

    if (!error) {
      setOpen(false); // Ferme la boîte de dialogue
      setGroupName('');
      router.refresh(); // Rafraîchit la page pour voir le nouveau groupe
    } else {
      console.error("Erreur création groupe:", error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Créer un groupe de devis</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouveau groupe de devis</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre projet ou groupe de demandes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Créer le groupe</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}