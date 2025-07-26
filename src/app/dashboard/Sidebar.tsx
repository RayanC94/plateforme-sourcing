'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, LayoutDashboard } from 'lucide-react'; // Icons
import SignOutButton from '../../components/auth/SignOutButton';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  // Add more links here later (Orders, Shipments, etc.)
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Plateforme Sourcing</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </aside>
  );
}