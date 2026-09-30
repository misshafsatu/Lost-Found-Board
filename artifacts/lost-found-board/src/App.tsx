import { type ReactNode, useEffect, useRef } from 'react';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/error-boundary';
import Home from '@/pages/home';
import Post from '@/pages/post';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: { logoPlacement: 'inside' as const, logoLinkUrl: basePath || '/', logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: '#24695e',
    colorForeground: '#294139',
    colorMutedForeground: '#6e7c73',
    colorDanger: '#b5483e',
    colorBackground: '#fffcf2',
    colorInput: '#f8f3e8',
    colorInputForeground: '#294139',
    colorNeutral: '#d9d0bd',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffcf2] rounded-[24px] w-[440px] max-w-full overflow-hidden shadow-[8px_8px_0_#e6be73]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#294139] font-semibold',
    headerSubtitle: 'text-[#6e7c73]',
    socialButtonsBlockButtonText: 'text-[#294139] font-semibold',
    formFieldLabel: 'text-[#294139] font-semibold',
    footerActionLink: 'text-[#24695e] font-semibold',
    footerActionText: 'text-[#6e7c73]',
    dividerText: 'text-[#6e7c73]',
    identityPreviewEditButton: 'text-[#24695e]',
    formFieldSuccessText: 'text-[#24695e]',
    alertText: 'text-[#b5483e]',
    logoBox: 'rounded-xl',
    logoImage: 'rounded-xl',
    socialButtonsBlockButton: 'border-[#d9d0bd] bg-[#f8f3e8] hover:bg-[#eee7d8]',
    formButtonPrimary: 'bg-[#24695e] hover:bg-[#1c554c] text-[#fffcf2] font-semibold',
    formFieldInput: 'border-[#d9d0bd] bg-[#f8f3e8] text-[#294139]',
    footerAction: 'border-t border-[#e6dfd0]',
    dividerLine: 'bg-[#d9d0bd]',
    alert: 'border-[#e8b9b3] bg-[#f9e8e5]',
    otpCodeFieldInput: 'border-[#d9d0bd] bg-[#f8f3e8] text-[#294139]',
    formFieldRow: 'gap-2',
    main: 'gap-5',
  },
};

function AuthPage({ kind }: { kind: 'sign-in' | 'sign-up' }) {
  return (
    <div className="paper-grain flex min-h-[100dvh] items-center justify-center bg-background px-4 py-10">
      <div className="w-full">
        {kind === 'sign-in' ? <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /> : <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />}
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== userId) client.clear();
    previous.current = userId;
  }), [addListener, client]);
  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Routes() {
  return <RoutedErrorBoundary><Switch>
    <Route path="/" component={Home} />
    <Route path="/post" component={Post} />
    <Route path="/sign-in/*?" component={() => <AuthPage kind="sign-in" />} />
    <Route path="/sign-up/*?" component={() => <AuthPage kind="sign-up" />} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary>;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} localization={{ signIn: { start: { title: 'Welcome back', subtitle: 'Your neighborhood is looking out.' } }, signUp: { start: { title: 'Join the board', subtitle: 'Good neighbors make good returns.' } } }} routerPush={(to) => setLocation(stripBase(to))} routerReplace={(to) => setLocation(stripBase(to), { replace: true })}>
    <QueryClientProvider client={queryClient}><ClerkQueryClientCacheInvalidator /><Routes /></QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <><WouterRouter base={basePath}><ClerkRoutes /></WouterRouter><TooltipProvider><Toaster /></TooltipProvider></>;
}

export default App;