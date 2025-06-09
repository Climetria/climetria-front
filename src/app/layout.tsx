import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AwsAuthProvider } from '@/components/AwsAuthProvider';
import './globals.css';
import '@aws-amplify/ui-react/styles.css';
import { CourseProvider } from '@/context/CourseContext';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/context/UserContext';
import { ReactQueryProvider } from '@/context/ReactQueryProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Climetria',
  description: 'Plataforma de gestión de pasantías',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReactQueryProvider>
          <AwsAuthProvider>
            <CourseProvider>
              <UserProvider>
                <Toaster />
                {children}
              </UserProvider>
            </CourseProvider>
          </AwsAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
