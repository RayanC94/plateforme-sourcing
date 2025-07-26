import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SignOutButton from '../../../components/auth/SignOutButton';
import AddOfferDialog from './AddOfferDialog';
import ManageOffersDialog from './ManageOffersDialog';

export default async function AgentDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'agent') {
    return redirect('/dashboard');
  }

  const { data: requests, error } = await supabase
    .from('quote_requests')
    .select(`
      *, 
      quote_groups (
        nom_groupe,
        entreprises ( nom_entreprise )
      ),
      supplier_offers ( * )
    `);
    
  if (error) console.error("Error fetching requests:", error);

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-500">Welcome, {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/agent/validated-quotes">
            <Button variant="outline">Validated Quotes</Button>
          </Link>
          <Link href="/agent/settings">
            <Button variant="ghost">Settings</Button>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>All Client Requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Client Details</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map(request => (
                <TableRow key={request.id}>
                  <TableCell className="flex items-center gap-2">
                    <Image src={request.photo_url} alt={request.nom_produit} width={40} height={40} className="rounded-md object-cover"/>
                    {request.nom_produit}
                  </TableCell>
                  <TableCell>{request.details}</TableCell>
                  <TableCell>{(request.quote_groups as any)?.entreprises?.nom_entreprise}</TableCell>
                  <TableCell>{request.quantite}</TableCell>
                  <TableCell className="flex gap-2">
                    <AddOfferDialog agentId={user.id} quoteRequestId={request.id} quantity={request.quantite} />
                    <ManageOffersDialog request={request} />
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