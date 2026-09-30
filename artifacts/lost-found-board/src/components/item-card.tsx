import { useEffect, useState } from 'react';
import { CalendarDays, Image as ImageIcon, MapPin, MessageCircle } from 'lucide-react';
import { getGetStorageObjectQueryKey, useGetStorageObject } from '@workspace/api-client-react';
import type { Item } from '@workspace/api-client-react';

function ItemPhoto({ path, name }: { path: string | null; name: string }) {
  const [src, setSrc] = useState('');
  const { data: blob, isLoading } = useGetStorageObject(path ?? '', {
    query: { enabled: Boolean(path), queryKey: getGetStorageObjectQueryKey(path ?? '') },
  });
  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  if (src) return <img src={src} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />;
  return (
    <div className={`grid h-full w-full place-items-center ${isLoading ? 'animate-pulse bg-muted' : 'bg-[#e7dfcc]'}`}>
      <ImageIcon className="size-8 text-muted-foreground/45" />
    </div>
  );
}

function toDate(value: unknown, dateOnly = false) {
  if (value instanceof Date) return value;
  const raw = String(value);
  return new Date(dateOnly && raw.length === 10 ? `${raw}T12:00:00` : raw);
}

function relativeDate(value: unknown) {
  const days = Math.max(0, Math.round((Date.now() - toDate(value).getTime()) / 86400000));
  if (days === 0) return 'posted today';
  if (days === 1) return 'posted yesterday';
  return `posted ${days} days ago`;
}

export function ItemCard({ item, index }: { item: Item; index: number }) {
  const isLost = item.type === 'lost';
  return (
    <article className={`group lift-card fade-up fade-up-delay-${Math.min(index + 1, 3)} overflow-hidden rounded-[24px] border border-border bg-card`} data-testid={`card-item-${item.id}`}>
      <div className="relative aspect-[1.18/1] overflow-hidden bg-muted">
        <ItemPhoto path={item.photoPath} name={item.itemName} />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 font-mono-ui text-[10px] font-medium uppercase tracking-[.15em] ${isLost ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`} data-testid={`status-item-${item.id}`}>
          {isLost ? 'Lost' : 'Found'}
        </span>
      </div>
      <div className="space-y-4 p-5 md:p-6">
        <div>
          <h3 className="font-display text-[1.55rem] font-semibold leading-[1.05] tracking-tight" data-testid={`text-item-name-${item.id}`}>{item.itemName}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground" data-testid={`text-item-description-${item.id}`}>{item.description}</p>
        </div>
        <div className="space-y-2 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> <span data-testid={`text-item-location-${item.id}`}>{item.location}</span></div>
           <div className="flex items-center gap-2"><CalendarDays className="size-3.5 text-primary" /> {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(toDate(item.itemDate, true))}</div>
        </div>
        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <span className="font-mono-ui text-[10px] uppercase tracking-wider text-muted-foreground">{relativeDate(item.postedAt)}</span>
          <a href={`mailto:${item.contactInformation}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-accent" data-testid={`link-contact-item-${item.id}`}><MessageCircle className="size-3.5" /> Reach out</a>
        </div>
      </div>
    </article>
  );
}

export function ItemSkeleton({ index }: { index: number }) {
  return <div className="overflow-hidden rounded-[24px] border border-border bg-card" data-testid={`skeleton-item-${index}`}>
    <div className="aspect-[1.18/1] animate-pulse bg-muted" />
    <div className="space-y-4 p-6"><div className="h-7 w-3/5 animate-pulse rounded bg-muted" /><div className="h-10 animate-pulse rounded bg-muted" /><div className="h-4 w-2/5 animate-pulse rounded bg-muted" /></div>
  </div>;
}