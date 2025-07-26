import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CreateSellerProfileDialog from './CreateSellerProfileDialog';
import SellerProfileActions from './SellerProfileActions'; // <-- Import Actions

export default async function AgentSettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'agent') redirect('/login');

  const { data: sellerProfiles } = await supabase.from('seller_profiles').select('*');

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Manage your seller profiles.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/agent/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          <SignOutButton />
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Seller Profiles</CardTitle>
          <CreateSellerProfileDialog />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Actions</TableHead> {/* <-- Add Header */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellerProfiles?.map(profile => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.company_name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.bank_name}</TableCell>
                  <TableCell className="text-right"> {/* <-- Add Cell */}
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