import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function HelpPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Help &amp; FAQ</h1>
      <div className="space-y-4">
        <p>If you have any questions, you might find the answer below.</p>
        <ul className="list-disc list-inside space-y-2">
          <li>How do I manage my company profiles?</li>
          <li>Where can I view my invoices and orders?</li>
          <li>Who do I contact for further assistance?</li>
        </ul>
      </div>
    </div>
  );
}