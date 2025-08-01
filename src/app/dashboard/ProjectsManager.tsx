'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import QuoteRequestActions from '@/components/quote-requests/QuoteRequestActions';
import CreateQuoteRequest from '@/components/quote-requests/CreateQuoteRequest';
import ImageLightbox from '@/components/ui/ImageLightbox';

// Types for projects and session
type QuoteRequest = { id: string; nom_produit: string; quantite: number; photo_url: string };
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
                <details key={project.id} className="border rounded">
                  <summary className="cursor-pointer select-none p-2 font-medium">
                    {project.nom_groupe}
                  </summary>
                  <div className="p-2">
                    <div className="flex justify-end mb-2">
                      <CreateQuoteRequest groupId={project.id} />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Photo</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead>Qté</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.quote_requests && project.quote_requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              {request.photo_url && (
                                <ImageLightbox src={request.photo_url} alt={request.nom_produit} />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{request.nom_produit}</TableCell>
                            <TableCell>{request.quantite}</TableCell>
                            <TableCell className="text-right">
                              <QuoteRequestActions request={request} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {(project.quote_requests?.length ?? 0) === 0 && (
                      <p className="text-sm text-gray-500 py-4 text-center">Aucune demande.</p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Vous n'avez pas encore créé de projet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
