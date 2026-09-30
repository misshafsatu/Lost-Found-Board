import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useAuth } from '@clerk/react';
import { Link, Redirect } from 'wouter';
import { ArrowLeft, ArrowRight, Check, FileImage, LoaderCircle, MapPin, ShieldCheck, Upload, X } from 'lucide-react';
import { ObjectUploader } from '@workspace/object-storage-web';
import { useCreateItem, useRequestUploadUrl } from '@workspace/api-client-react';
import { BrandMark, TrustNote } from '@/components/board-shell';

type PostType = 'lost' | 'found';
type FormState = { type: PostType; itemName: string; description: string; location: string; itemDate: string; contactInformation: string };

const initialForm: FormState = { type: 'lost', itemName: '', description: '', location: '', itemDate: new Date().toISOString().slice(0, 10), contactInformation: '' };

export default function Post() {
  const { isLoaded, isSignedIn } = useAuth();
  const [form, setForm] = useState<FormState>(initialForm);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);
  const pendingPath = useRef<string | null>(null);
  const createItem = useCreateItem();
  const requestUploadUrl = useRequestUploadUrl();

  if (!isLoaded) return <PostLoading />;
  if (!isSignedIn) return <Redirect to="/sign-in?redirect_url=%2Fpost" />;

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const getUploadParameters = async (file: { name?: string; size?: number | null; type?: string | null }) => {
    try {
      const upload = await requestUploadUrl.mutateAsync({ data: { name: file.name ?? 'item-photo', size: file.size ?? 0, contentType: file.type || 'application/octet-stream' } });
      pendingPath.current = upload.objectPath;
      return { method: 'PUT' as const, url: upload.uploadURL, headers: { 'Content-Type': file.type || 'application/octet-stream' } };
    } catch {
      setError('We couldn’t prepare that photo. Please try again.');
      throw new Error('Unable to prepare photo upload');
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.itemName.trim() || !form.description.trim() || !form.location.trim() || !form.contactInformation.trim()) {
      setError('Please fill in the highlighted details so neighbors can help.');
      return;
    }
    try {
      await createItem.mutateAsync({ data: { ...form, type: form.type, itemName: form.itemName.trim(), description: form.description.trim(), location: form.location.trim(), contactInformation: form.contactInformation.trim(), photoPath } });
      setPosted(true);
    } catch {
      setError('Something went wrong while posting. Your details are still here — please try again.');
    }
  };
  const isSubmitting = createItem.isPending || requestUploadUrl.isPending;
  if (posted) {
    return <div className="paper-grain min-h-[100dvh]"><div className="mx-auto max-w-2xl px-5 py-8 md:px-8 md:py-12"><BrandMark /><div className="mt-20 rounded-[30px] border border-border bg-card p-7 text-center shadow-[8px_8px_0_hsl(38_68%_72%)] md:p-14" data-testid="status-post-success"><div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-8" /></div><p className="mt-7 font-mono-ui text-[11px] uppercase tracking-[.2em] text-primary">It’s on the board</p><h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">A good neighbor move.</h1><p className="mx-auto mt-5 max-w-md leading-relaxed text-muted-foreground">Your {form.type} {form.itemName} post is live. Keep an eye out — we’re rooting for a happy return.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/" className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground" data-testid="link-success-board">See the board</Link><button type="button" onClick={() => { setForm(initialForm); setPhotoPath(null); setPhotoName(''); setPosted(false); }} className="rounded-full border border-border px-6 py-3 font-bold transition-colors hover:bg-muted" data-testid="button-post-another">Post another</button></div></div></div></div>;
  }
  return (
    <div className="paper-grain min-h-[100dvh]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8 md:py-7"><BrandMark /><Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-home"><ArrowLeft className="size-4" /> Back to board</Link></header>
      <main className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-12 md:grid-cols-[minmax(0,1fr)_280px] md:px-8 md:pt-20">
        <div className="max-w-2xl">
          <p className="font-mono-ui text-[11px] uppercase tracking-[.2em] text-primary">New board note</p>
          <h1 className="mt-3 font-display text-5xl font-semibold leading-[.95] tracking-tight md:text-7xl">Help it find<br /><span className="text-primary">its person.</span></h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">A few clear details are all a neighbor needs to recognize what you saw.</p>
          <form onSubmit={submit} className="mt-10 space-y-7" data-testid="form-create-item">
            <fieldset><legend className="mb-3 text-sm font-bold">What kind of note is this?</legend><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => update('type', 'lost')} className={`rounded-2xl border p-4 text-left transition-all ${form.type === 'lost' ? 'border-accent bg-accent/10 ring-2 ring-accent/20' : 'border-border bg-card hover:border-accent/50'}`} data-testid="button-type-lost"><span className="font-mono-ui text-[10px] uppercase tracking-wider text-accent">I lost something</span><span className="mt-1 block font-display text-xl font-semibold">Looking for it</span></button><button type="button" onClick={() => update('type', 'found')} className={`rounded-2xl border p-4 text-left transition-all ${form.type === 'found' ? 'border-secondary bg-secondary/20 ring-2 ring-secondary/30' : 'border-border bg-card hover:border-secondary/70'}`} data-testid="button-type-found"><span className="font-mono-ui text-[10px] uppercase tracking-wider text-primary">I found something</span><span className="mt-1 block font-display text-xl font-semibold">Holding onto it</span></button></div></fieldset>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Item name" value={form.itemName} onChange={(v) => update('itemName', v)} placeholder="e.g. Brass house keys" testId="input-item-name" />
              <Field label="Where?" value={form.location} onChange={(v) => update('location', v)} placeholder="e.g. Northside Market" testId="input-item-location" icon={<MapPin className="size-4" />} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label={form.type === 'lost' ? 'When did you last see it?' : 'When did you find it?'} type="date" value={form.itemDate} onChange={(v) => update('itemDate', v)} testId="input-item-date" />
              <Field label="How can someone reach you?" value={form.contactInformation} onChange={(v) => update('contactInformation', v)} placeholder="Email or phone number" testId="input-contact-information" />
            </div>
            <label className="block"><span className="mb-2 block text-sm font-bold">What should neighbors know?</span><textarea required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Color, brand, distinguishing marks, where it was left..." className="min-h-32 w-full resize-y rounded-2xl border border-input bg-card px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" data-testid="input-item-description" /></label>
            <div><span className="mb-2 block text-sm font-bold">Add a photo <span className="font-normal text-muted-foreground">(optional)</span></span>{photoPath ? <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 px-4 py-4"><span className="flex items-center gap-2 text-sm font-medium"><FileImage className="size-4 text-primary" /> {photoName || 'Photo uploaded'}</span><button type="button" onClick={() => { setPhotoPath(null); setPhotoName(''); pendingPath.current = null; }} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove photo" data-testid="button-remove-photo"><X className="size-4" /></button></div> : <div data-testid="button-upload-photo" onClick={(event) => event.preventDefault()}><ObjectUploader maxNumberOfFiles={1} maxFileSize={8 * 1024 * 1024} onGetUploadParameters={getUploadParameters} onComplete={(result) => { const uploaded = result.successful?.[0]; if (uploaded) { setPhotoPath(pendingPath.current); setPhotoName(uploaded.name ?? 'Photo uploaded'); setError(''); } }} buttonClassName="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-5 py-8 text-center transition-colors hover:bg-primary/10"><span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground"><Upload className="size-5" /></span><span className="font-bold">Drop in a photo, if you have one</span><span className="text-xs text-muted-foreground">JPG, PNG, or WEBP up to 8 MB</span></ObjectUploader></div>}</div>
            {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert" data-testid="status-post-error">{error}</div>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Your post will be visible to anyone browsing this neighborhood board.</p><button type="submit" disabled={isSubmitting} className="group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-[4px_4px_0_hsl(38_68%_72%)] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70" data-testid="button-submit-item">{isSubmitting ? <><LoaderCircle className="size-4 animate-spin" /> Posting...</> : <>Publish to the board <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></>}</button></div>
          </form>
        </div>
        <aside className="space-y-5 md:pt-28"><TrustNote /><div className="hidden rounded-2xl bg-secondary/25 p-5 md:block"><p className="font-mono-ui text-[10px] uppercase tracking-wider text-primary">Posting tip</p><p className="mt-3 font-display text-xl font-semibold leading-tight">Specific beats dramatic.</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">“Blue canvas tote with a red library book inside” gives a finder something useful to look for.</p></div></aside>
      </main>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', testId, icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; testId: string; icon?: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><span className="relative block">{icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary">{icon}</span>}<input required type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`h-13 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 ${icon ? 'pl-11' : ''}`} data-testid={testId} /></span></label>;
}

function PostLoading() {
  return <div className="min-h-[100dvh] bg-background"><div className="mx-auto max-w-6xl px-5 py-7"><BrandMark /><div className="mt-20 h-10 w-80 animate-pulse rounded bg-muted" /><div className="mt-5 h-32 max-w-lg animate-pulse rounded bg-muted" /></div></div>;
}