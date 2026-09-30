import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { AlertCircle, ArrowDown, ArrowRight, MapPin, Search, Sparkles } from 'lucide-react';
import { useListItems, getListItemsQueryKey } from '@workspace/api-client-react';
import { ItemCard, ItemSkeleton } from '@/components/item-card';
import { Header } from '@/components/board-shell';

export default function Home() {
  const [searchInput, setSearchInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [filters, setFilters] = useState({ search: '', location: '' });
  const params = useMemo(() => ({ search: filters.search || undefined, location: filters.location || undefined }), [filters]);
  const { data: items, isLoading, isError, refetch } = useListItems(params, { query: { queryKey: getListItemsQueryKey(params) } });
  const shownItems = items ?? [];
  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setFilters({ search: searchInput.trim(), location: locationInput.trim() });
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="paper-grain min-h-[100dvh] overflow-hidden">
      <Header />
      <main>
        <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-24">
          <div className="absolute -right-32 top-10 -z-10 size-[28rem] rounded-full bg-secondary/30 blur-3xl" />
          <div className="max-w-3xl">
            <p className="fade-up mb-7 flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[.2em] text-primary"><Sparkles className="size-4" /> A better kind of bulletin board</p>
            <h1 className="fade-up fade-up-delay-1 font-display text-[clamp(3.7rem,10vw,8rem)] font-semibold leading-[.88] tracking-[-.06em] text-foreground">
              Lost things<br /><span className="text-primary">find their way</span> home.
            </h1>
            <p className="fade-up fade-up-delay-2 mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">A trusted corner of the neighborhood for the wallet on the sidewalk, the keys on the park bench, and the small acts of looking out for one another.</p>
            <div className="fade-up fade-up-delay-3 mt-9 flex flex-wrap items-center gap-4">
              <Link href="/post" className="group inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-[5px_5px_0_hsl(38_68%_72%)] transition-transform hover:-translate-y-1" data-testid="link-post-hero">Post a lost or found item <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
              <a href="#browse" className="inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary" data-testid="link-scroll-browse">See the latest <ArrowDown className="size-4" /></a>
            </div>
          </div>
          <div className="mt-16 grid max-w-4xl grid-cols-2 gap-3 border-t border-border/70 pt-6 md:grid-cols-4">
            <div><p className="font-display text-3xl font-semibold">local</p><p className="mt-1 text-xs text-muted-foreground">neighborhood first</p></div>
            <div><p className="font-display text-3xl font-semibold">human</p><p className="mt-1 text-xs text-muted-foreground">no faceless listings</p></div>
            <div><p className="font-display text-3xl font-semibold">recent</p><p className="mt-1 text-xs text-muted-foreground">fresh posts rise up</p></div>
            <div><p className="font-display text-3xl font-semibold">kind</p><p className="mt-1 text-xs text-muted-foreground">good neighbors welcome</p></div>
          </div>
        </section>

        <section id="browse" className="bg-primary py-16 text-primary-foreground md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="font-mono-ui text-[11px] uppercase tracking-[.2em] text-secondary">The board</p><h2 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Recent sightings & searches</h2></div>
              <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">Search a name, a place, or both. A small lead can make a big difference.</p>
            </div>
            <form onSubmit={submitSearch} className="mb-10 grid gap-3 rounded-[22px] bg-primary-foreground/10 p-3 md:grid-cols-[1.2fr_1fr_auto]" data-testid="form-search-items">
              <label className="flex items-center gap-3 rounded-xl bg-primary-foreground px-4 text-foreground"><Search className="size-4 text-muted-foreground" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="What are you looking for?" aria-label="Search item name" data-testid="input-search-item" /></label>
              <label className="flex items-center gap-3 rounded-xl bg-primary-foreground px-4 text-foreground"><MapPin className="size-4 text-muted-foreground" /><input value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Near where?" aria-label="Search location" data-testid="input-search-location" /></label>
              <button type="submit" className="rounded-xl bg-secondary px-6 font-bold text-secondary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-search-items">Search board</button>
            </form>
            {isLoading && <div className="grid gap-5 md:grid-cols-3"><ItemSkeleton index={0} /><ItemSkeleton index={1} /><ItemSkeleton index={2} /></div>}
            {isError && <div className="flex flex-col items-center rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 px-6 py-14 text-center" data-testid="status-items-error"><AlertCircle className="mb-4 size-8 text-secondary" /><h3 className="font-display text-2xl">The board is taking a breather.</h3><p className="mt-2 text-sm text-primary-foreground/70">We couldn’t load recent posts right now.</p><button type="button" onClick={() => refetch()} className="mt-5 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground" data-testid="button-retry-items">Try again</button></div>}
            {!isLoading && !isError && shownItems.length === 0 && <div className="rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 px-6 py-16 text-center" data-testid="status-items-empty"><p className="font-display text-3xl">No matching notes yet.</p><p className="mt-2 text-sm text-primary-foreground/70">Try a broader search, or be the first neighbor to post.</p><Link href="/post" className="mt-6 inline-flex rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground" data-testid="link-post-empty">Post an item</Link></div>}
            {!isLoading && !isError && shownItems.length > 0 && <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{shownItems.map((item, index) => <ItemCard key={item.id} item={item} index={index} />)}</div>}
          </div>
        </section>
        <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-12 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8"><p className="font-display text-xl font-semibold text-foreground">returning <span className="text-primary">things</span> to people.</p><p>Built for the neighbors who notice.</p></footer>
      </main>
    </div>
  );
}