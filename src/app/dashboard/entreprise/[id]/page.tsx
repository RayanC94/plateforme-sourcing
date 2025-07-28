import { createClient } from '@/lib/supabase/server'; // <-- MODIFIÉ
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateQuoteGroup from './CreateQuoteGroup';

export default async function EntreprisePage({ params: { id: entrepriseId } }: { params: { id: string } }) {
  const supabase = createClient(); // <-- MODIFIÉ

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entreprise } = await supabase
    .from('entreprises')
    .select('nom_entreprise, address, country, business_registration')
    .eq('id', entrepriseId)
    .single();
  const { data: quoteGroups } = await supabase.from('quote_groups').select('id, nom_groupe, status, created_at').eq('id_entreprise', entrepriseId).order('created_at', { ascending: false });

  if (!entreprise) { return <div>Entreprise non trouvée.</div>; }

  return (
    <div className="container mx-auto p-4">
      {/* ... reste du JSX ... */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{entreprise.nom_entreprise}</h1>
        <CreateQuoteGroup entrepriseId={entrepriseId} />
      </header>
      <Card>
        <CardHeader><CardTitle>Groupes de Devis</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nom du Groupe</TableHead><TableHead>Statut</TableHead><TableHead>Créé le</TableHead></TableRow></TableHeader>
            <TableBody>
              {quoteGroups && quoteGroups.map(group => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/groupe/${group.id}`} className="text-blue-600 hover:underline">
                      {group.nom_groupe}
                    </Link>
                  </TableCell>
                  <TableCell>{group.status}</TableCell>
                  <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!quoteGroups || quoteGroups.length === 0) && (
            <p className="text-center text-gray-500 py-4">Aucun groupe de devis pour le moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}