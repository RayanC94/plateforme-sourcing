'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Types for enterprises, projects and session
type Entreprise = { id: string; nom_entreprise: string };
type Project = { id: string; nom_groupe: string; entreprises: { nom_entreprise: string } | null };
type Session = { user: { id: string } };

interface ProjectsManagerProps {
  entreprises: Entreprise[];
  projects: Project[];
  session: Session;
}

export default function ProjectsManager({ entreprises, projects, session }: ProjectsManagerProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedEntreprise, setSelectedEntreprise] = useState<string | null>(entreprises[0]?.id || null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim() || !selectedEntreprise) return;

    const { error } = await supabase.from('quote_groups').insert({
      nom_groupe: newProjectName,
      id_client_session: session.user.id,
      id_entreprise: selectedEntreprise,
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
        <CardDescription>Créez des projets et associez-les à vos entreprises.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            placeholder="Nom du nouveau projet"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedEntreprise || ''} onValueChange={setSelectedEntreprise}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Entreprise" />
            </SelectTrigger>
            <SelectContent>
              {entreprises.map((entreprise) => (
                <SelectItem key={entreprise.id} value={entreprise.id}>
                  {entreprise.nom_entreprise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Ajouter</Button>
        </form>

        <div className="mt-4">
          <h3 className="font-semibold">Vos projets :</h3>
          {projects.length > 0 ? (
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/dashboard/groupe/${project.id}`} className="text-blue-600 hover:underline">
                    {project.nom_groupe} ({project.entreprises?.nom_entreprise || 'Sans entreprise'})
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Vous n'avez pas encore créé de projet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}