'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CompanyProfileForm from './CompanyProfileForm';

// On définit le type pour une entreprise et pour la session
type Entreprise = { id: string; nom_entreprise: string };
type Session = { user: { id: string } };

// On définit les props que le composant recevra
interface EntreprisesManagerProps {
  entreprises: Entreprise[];
  session: Session;
}

export default function EntreprisesManager({ entreprises, session }: EntreprisesManagerProps) {
  const router = useRouter();

  const handleSaved = () => {
    router.refresh();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Gérer les Entreprises</CardTitle>
        <CardDescription>Ajoutez ou visualisez les entreprises/marques de votre session.</CardDescription>
      </CardHeader>
      <CardContent>
        <CompanyProfileForm session={session} onSaved={handleSaved} />

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
