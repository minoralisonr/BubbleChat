import { Inter } from 'next/font/google';
import '../../styles/global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bubble Chat',
  description: 'Real-time chat application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}