import { useClerk, useUser } from '@clerk/react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, LogOut, Plus, Search, ShieldCheck } from 'lucide-react';

export function BrandMark() {
  return (
    <Link href="/" className="group flex items-center gap-3" data-testid="link-home">
      <span className="relative grid size-10 place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-[4px_4px_0_hsl(38_68%_72%)] transition-transform group-hover:-rotate-3">
        <span className="font-display text-2xl leading-none">r</span>
      </span>
      <span>
        <span className="block font-display text-[1.35rem] font-semibold leading-none tracking-tight">returning</span>
        <span className="font-mono-ui text-[9px] uppercase tracking-[.24em] text-muted-foreground">the neighborhood board</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [location] = useLocation();
  const { isSignedIn } = useUser();
  const { signOut } = useClerk();
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 md:px-8 md:py-7">
      <BrandMark />
      <nav className="flex items-center gap-2 md:gap-5">
        <Link href="/#browse" className="hidden items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground md:flex" data-testid="link-browse">
          <Search className="size-4" /> Browse the board
        </Link>
        {isSignedIn ? (
          <>
            <Link href="/post" className="group flex items-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5" data-testid="link-post-header">
              <Plus className="size-4" /> Post an item <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className="hidden size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:grid" aria-label="Sign out" data-testid="button-sign-out">
              <LogOut className="size-4" />
            </button>
          </>
        ) : (
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(location === '/' ? '/post' : location)}`} className="rounded-full border border-primary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground" data-testid="link-sign-in">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

export function TrustNote() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card/65 p-4 text-sm text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
      <p><strong className="text-foreground">A little care goes a long way.</strong> Share only the contact details you’re comfortable making public. We’re neighbors, after all.</p>
    </div>
  );
}