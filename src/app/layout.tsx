
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'AI Agent Chat',
  description: 'A Proof of Concept for an AI Agent Chat Interface',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layout = cookies().get('sidebar_state');
  const defaultOpen = layout ? layout.value === 'true' : true;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <SidebarProvider defaultOpen={defaultOpen}>
            {children}
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
