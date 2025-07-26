'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// On définit le type pour une entreprise et pour la session
type Entreprise = { id: string; nom_entreprise: string };
type Session = { user: { id: string } };

// On définit les props que le composant recevra
interface EntreprisesManagerProps {
  entreprises: Entreprise[];
  session: Session;
}

export default function EntreprisesManager({ entreprises, session }: EntreprisesManagerProps) {
  const [newEntrepriseName, setNewEntrepriseName] = useState('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleAddEntreprise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEntrepriseName.trim()) return;

    const { error } = await supabase.from('entreprises').insert({
      nom_entreprise: newEntrepriseName,
      id_client_session: session.user.id,
    });

    if (!error) {
      setNewEntrepriseName('');
      router.refresh(); // Rafraîchit les données du serveur
    } else {
      console.error("Erreur lors de l'ajout de l'entreprise:", error.message);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gérer les Entreprises</CardTitle>
        <CardDescription>Ajoutez ou visualisez les entreprises/marques de votre session.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddEntreprise} className="flex items-center gap-2">
          <Input
            placeholder="Nom de la nouvelle entreprise"
            value={newEntrepriseName}
            onChange={(e) => setNewEntrepriseName(e.target.value)}
          />
          <Button type="submit">Ajouter</Button>
        </form>

        <div className="mt-4">
          <h3 className="font-semibold">Vos entreprises :</h3>
          {entreprises.length > 0 ? (
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {entreprises.map((entreprise) => (
                <li key={entreprise.id}>
                  <Link
                    href={`/dashboard/entreprise/${entreprise.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entreprise.nom_entreprise}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Vous n'avez pas encore ajouté d'entreprise.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}