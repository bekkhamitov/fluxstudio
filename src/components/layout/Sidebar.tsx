'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userName?: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-56 h-screen bg-[#111111] border-r border-[#2a2a2a] flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-[#2a2a2a]">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-medium text-white">flux studio</span>
        </Link>
      </div>

      {/* Image Section */}
      <div className="p-2">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-[#666] uppercase tracking-wider">Image</span>
        </div>
        <nav className="space-y-1">
          <Link
            href="/"
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('/')
                ? 'bg-[#254130] text-white font-medium'
                : 'text-[#999] hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Generate
          </Link>
        </nav>
      </div>

      {/* Library Section */}
      <div className="p-2">
        <div className="px-3 py-2">
          <span className="text-xs font-medium text-[#666] uppercase tracking-wider">Library</span>
        </div>
        <nav className="space-y-1">
          <Link
            href="/history"
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('/history')
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </Link>
          <Link
            href="/assets"
            prefetch={true}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive('/assets')
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#888] hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Assets
          </Link>
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User Section */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#254130] flex items-center justify-center">
            <span className="text-sm text-white">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{userName || 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
