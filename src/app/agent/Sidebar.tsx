'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, Truck } from 'lucide-react';
import SignOutButton from '../../components/auth/SignOutButton';

const navLinks = [
  { href: '/agent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agent/invoices', label: 'Factures', icon: FileText },
  { href: '/agent/tracking', label: 'Suivi', icon: Truck },
  { href: '/agent/settings', label: 'Profils Vendeur', icon: FileText },
];

export default function AgentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b"><h1 className="text-xl font-bold">Panneau Agent</h1></div>
      <nav className="flex-grow p-4 space-y-2">
        {navLinks.map(link => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 p-2 rounded-md ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}>
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t"><SignOutButton /></div>
    </aside>
  );
}