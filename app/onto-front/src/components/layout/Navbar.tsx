'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, BarChart3, Database, Link as LinkIcon } from 'lucide-react';

const navItems = [
  { href: '/graph', label: 'Graph View', icon: Network },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/data-manager', label: 'Data Manager', icon: Database },
  { href: '/relationship', label: 'Relationship Editor', icon: LinkIcon },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">🏭 Manufacturing Ontology</h1>
        </div>
        <div className="flex flex-wrap gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

