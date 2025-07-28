import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">Account Settings</h2>
          <p>Manage your personal information and change your password.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Company Profiles</h2>
          <p className="mb-2">Update details for the companies you manage.</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            View your companies
          </Link>
        </section>
      </div>
    </div>
  );
}