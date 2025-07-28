'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, Truck, Folder, Building2 } from 'lucide-react';
import SignOutButton from '../../components/auth/SignOutButton';

const navSections = [
  {
    title: 'Général',
    links: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Gestion',
    links: [
      { href: '/dashboard/projects', label: 'Projets', icon: Folder },
      { href: '/dashboard/orders', label: 'Commandes', icon: Truck },
      { href: '/dashboard/invoices', label: 'Factures', icon: FileText },
    ],
  },
  {
    title: 'Profil',
    links: [
      { href: '/dashboard/company-profile', label: 'Profil Entreprise', icon: Building2 },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Plateforme Sourcing</h1>
      </div>
      <nav className="flex-grow p-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase px-2">
              {section.title}
            </h2>
            {section.links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
}
