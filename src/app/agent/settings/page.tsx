import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CreateSellerProfileDialog from './CreateSellerProfileDialog';
import SellerProfileActions from './SellerProfileActions';

export default async function AgentSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'agent') redirect('/login');

  const { data: sellerProfiles } = await supabase.from('seller_profiles').select('*');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Paramètres</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profils Vendeur</CardTitle>
          <CreateSellerProfileDialog />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Entreprise</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Banque</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellerProfiles?.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.company_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.bank_name}</TableCell>
                  <TableCell className="text-right">
                    <SellerProfileActions profile={profile} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
