'use client';

import { DndContext, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import DraggableQuoteRequest from '@/components/quote-requests/DraggableQuoteRequest';
import ProjectsManager from './ProjectsManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type QuoteRequest = {
  id: string;
  nom_produit: string;
  quantite: number;
  photo_url: string | null;
};

type Group = {
  id: string;
  nom_groupe: string;
  quote_requests: QuoteRequest[];
};

type Session = { user: { id: string } };

interface DashboardDnDProps {
  groups: Group[];
  ungroupedRequests: QuoteRequest[];
  session: Session;
}

export default function DashboardDnD({ groups, ungroupedRequests, session }: DashboardDnDProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { setNodeRef: setFreeRef } = useDroppable({ id: 'ungrouped' });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const requestId = String(active.id);
    const overId = String(over.id);
    const newGroupId = overId.startsWith('group-') ? overId.replace('group-', '') : null;
    const { error } = await supabase
      .from('quote_requests')
      .update({ id_groupe_devis: newGroupId })
      .eq('id', requestId);
    if (!error) {
      router.refresh();
    } else {
      console.error('Erreur lors du déplacement:', error.message);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div>
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

        <section className="mb-8">
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Requêtes seules</h2>
            <CreateQuoteRequest />
          </header>
          <Card>
            <CardHeader>
              <CardTitle>Demandes de Devis</CardTitle>
            </CardHeader>
            <CardContent>
              <SortableContext id="ungrouped" items={ungroupedRequests.map((r) => r.id)}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody ref={setFreeRef}>
                    {ungroupedRequests.map((request) => (
                      <DraggableQuoteRequest key={request.id} request={request} />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
              {ungroupedRequests.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucune demande libre.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <ProjectsManager projects={groups} session={session} />
      </div>
    </DndContext>
  );
}

