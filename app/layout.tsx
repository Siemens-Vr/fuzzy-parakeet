import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'SideQuest - VR Apps & Games',
  description: 'Browse and download VR apps and games',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="header-content">
            <Link href="/" className="header-logo">
              🎮 VR App Store
            </Link>
            <nav className="header-nav">
              <span>Discover amazing VR experiences</span>
            </nav>
          </div>
        </header>
        <main className="main-container">{children}</main>
      </body>
    </html>
  );
}