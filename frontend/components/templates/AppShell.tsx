'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Users,
  Sparkles,
  Scissors,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from '@/components/atoms/Logo';
import { useAuth } from '@/lib/auth-context';
import type { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/servicos', label: 'Serviços', icon: Scissors },
  { href: '/equipe', label: 'Equipe', icon: Sparkles },
  { href: '/configuracoes', label: 'Ajustes', icon: Settings },
];

const emptySubscribe = () => () => {};

function DesktopSidebar({ pathname, mounted, user, logout }: { pathname: string | null; mounted: boolean; user: User | null; logout: () => void }) {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-outline-variant/50 bg-surface-container-low/60 backdrop-blur-md p-6 shrink-0 h-screen sticky top-0">
      <div className="pb-8">
        <Logo size="md" variant="full" />
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-on-surface-variant'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-outline-variant/40">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2 rounded-2xl hover:bg-surface-container transition-colors text-left cursor-pointer outline-none">
            <Avatar className="w-9 h-9 border border-outline-variant/60">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs" suppressHydrationWarning>
                {mounted && user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'CS'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-surface truncate" suppressHydrationWarning>
                {mounted && user?.nome ? user.nome : 'Profissional'}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate capitalize" suppressHydrationWarning>
                {mounted && user?.perfil ? user.perfil : 'Equipe'}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-lg border-outline-variant">
            <DropdownMenuLabel className="text-xs font-medium text-on-surface-variant" suppressHydrationWarning>
              {mounted && user?.email ? user.email : 'Minha Conta'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl text-xs gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

function TopHeader({ mounted, user, logout }: { mounted: boolean; user: User | null; logout: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-16 border-b border-outline-variant/50 bg-background/80 backdrop-blur-md">
      <div className="md:hidden">
        <Logo size="sm" variant="full" />
      </div>

      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs tracking-wider uppercase text-on-surface-variant font-medium">
          Studio Marilia Camilo Ateliê
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-on-surface" suppressHydrationWarning>
            {mounted ? user?.nome : ''}
          </p>
          <p className="text-[10px] text-primary font-semibold uppercase tracking-wider" suppressHydrationWarning>
            {mounted ? user?.perfil : ''}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer outline-none">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs" suppressHydrationWarning>
                {mounted && user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'CS'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-lg border-outline-variant">
            <DropdownMenuLabel className="text-xs text-on-surface-variant" suppressHydrationWarning>
              {mounted ? user?.email : ''}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer rounded-xl text-xs gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do sistema</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileBottomNav({ pathname }: { pathname: string | null }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/60 flex items-center justify-around py-2 px-3 shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-2xl transition-all ${
              isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive ? 'bg-primary/15 text-primary scale-105' : 'text-on-surface-variant'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/esqueci-senha') ||
    pathname?.startsWith('/redefinir-senha') ||
    pathname?.startsWith('/primeiro-acesso');

  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <DesktopSidebar pathname={pathname} mounted={mounted} user={user} logout={logout} />
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <TopHeader mounted={mounted} user={user} logout={logout} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
      <MobileBottomNav pathname={pathname} />
    </div>
  );
}
