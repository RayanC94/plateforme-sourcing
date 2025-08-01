'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import DraggableQuoteRequest from '@/components/quote-requests/DraggableQuoteRequest';
import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSelection } from '@/components/selection/SelectionContext';

// Types for projects and session
type QuoteRequest = { id: string; nom_produit: string; quantite: number; photo_url: string | null };
type Project = { id: string; nom_groupe: string; quote_requests: QuoteRequest[] };
type Session = { user: { id: string } };

interface ProjectsManagerProps {
  projects: Project[];
  session: Session;
}

export default function ProjectsManager({ projects, session }: ProjectsManagerProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const { error } = await supabase.from('quote_groups').insert({
      nom_groupe: newProjectName,
      id_client_session: session.user.id,
      id_entreprise: null, // désassociation entreprise
      cree_par_id: session.user.id,
    });

    if (!error) {
      setNewProjectName('');
      router.refresh();
    } else {
      console.error("Erreur lors de l'ajout du projet:", error.message);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gérer les Projets</CardTitle>
        <CardDescription>Créez des projets sans les associer à une entreprise.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            placeholder="Nom du nouveau projet"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Ajouter</Button>
        </form>

        <div className="mt-4">
          <h3 className="font-semibold">Vos projets :</h3>
          {projects.length > 0 ? (
            <div className="space-y-4 mt-2">
              {projects.map((project) => (
                <ProjectGroup key={project.id} project={project} />
              ))}
            </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Vous n&apos;avez pas encore créé de projet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectGroup({ project }: { project: Project }) {
  const { setNodeRef } = useDroppable({ id: `group-${project.id}` });
  const { selectedGroups, toggleGroup } = useSelection();

  return (
    <details className="border rounded">
      <summary className="cursor-pointer select-none p-2 font-medium flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedGroups.includes(project.id)}
          onChange={() => toggleGroup(project.id)}
          onClick={(e) => e.stopPropagation()}
        />
        {project.nom_groupe}
      </summary>
      <div className="p-2">
        <div className="flex justify-end mb-2">
          <CreateQuoteRequest groupId={project.id} />
        </div>
        <SortableContext id={`group-${project.id}`} items={project.quote_requests?.map((r) => r.id) || []}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-4"></TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody ref={setNodeRef}>
              {project.quote_requests && project.quote_requests.map((request) => (
                <DraggableQuoteRequest key={request.id} request={request} />
              ))}
            </TableBody>
          </Table>
        </SortableContext>
        {(project.quote_requests?.length ?? 0) === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">Aucune demande.</p>
        )}
      </div>
    </details>
  );
}
