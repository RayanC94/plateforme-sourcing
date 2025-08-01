'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelection } from './SelectionContext';
import { Button } from '@/components/ui/button';
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  downloadQuote,
  requestCommonInvoice,
  deleteRequests,
  archiveRequests,
  moveRequests,
  modifyRequests,
} from '@/lib/bulk-actions';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ActionSidebar() {
  const { selectedRequests, selectedGroups, clearSelection } = useSelection();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [moveOpen, setMoveOpen] = useState(false);
  const [groups, setGroups] = useState<{ id: string; nom_groupe: string }[]>([]);
  const [targetGroup, setTargetGroup] = useState('');

  useEffect(() => {
    if (moveOpen) {
      supabase
        .from('quote_groups')
        .select('id, nom_groupe')
        .then(({ data }) => setGroups(data || []));
    }
  }, [moveOpen, supabase]);

  const handleMove = async () => {
    await moveRequests(selectedRequests, targetGroup);
    setMoveOpen(false);
    clearSelection();
    router.refresh();
  };

  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  const handleEdit = async () => {
    await modifyRequests(selectedRequests, {
      nom_produit: newName || undefined,
      quantite: newQuantity ? parseInt(newQuantity) : undefined,
    });
    setEditOpen(false);
    clearSelection();
    router.refresh();
  };

  const handleDelete = async () => {
    await deleteRequests(selectedRequests);
    clearSelection();
    router.refresh();
  };

  const handleArchive = async () => {
    await archiveRequests(selectedRequests);
    clearSelection();
    router.refresh();
  };

  const handleInvoice = async () => {
    await requestCommonInvoice(selectedRequests);
  };

  const handleDownload = async (fmt: 'pdf' | 'excel') => {
    await downloadQuote(selectedRequests, fmt);
  };

  if (selectedRequests.length === 0 && selectedGroups.length === 0) {
    return null;
  }

  return (
    <aside className="w-64 ml-4 p-4 border rounded h-fit space-y-4">
      <h2 className="font-semibold">Actions</h2>
      {selectedRequests.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm">
            {selectedRequests.length} requête(s) sélectionnée(s)
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => handleDownload('pdf')}>
              Télécharger (PDF)
            </Button>
            <Button className="w-full" onClick={() => handleDownload('excel')}>
              Télécharger (Excel)
            </Button>
            <Button className="w-full" onClick={handleInvoice}>
              Demander une facture commune
            </Button>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Modifier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modifier les requêtes</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  <Input
                    placeholder="Nom du produit"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Quantité"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleEdit}>Enregistrer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Déplacer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choisir le groupe cible</DialogTitle>
                </DialogHeader>
                <Select onValueChange={setTargetGroup} value={targetGroup}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.nom_groupe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button onClick={handleMove} disabled={!targetGroup}>
                    Déplacer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les requêtes ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Continuer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                  Archiver
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archiver les requêtes ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous pourrez les retrouver plus tard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>
                    Confirmer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {selectedGroups.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm">
            {selectedGroups.length} groupe(s) sélectionné(s)
          </p>
          <Button variant="destructive" className="w-full">
            Supprimer
          </Button>
        </div>
      )}

      <CreateQuoteRequest groupId={selectedGroups[0]} />

      <Button variant="secondary" className="w-full" onClick={clearSelection}>
        Annuler la sélection
      </Button>
    </aside>
  );
}

