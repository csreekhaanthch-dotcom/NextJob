import Providers from './components/Providers';
import './globals.css';

export const metadata = {
  title: 'NextJob',
  description: 'Find your next job with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}