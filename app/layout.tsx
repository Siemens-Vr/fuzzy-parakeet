import './globals.css';
import Link from 'next/link';


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
  <html lang="en">
    <body className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold">APK Downloads</Link>
          <nav className="text-sm text-gray-600">Fast direct downloads</nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </body>
  </html>
);
}