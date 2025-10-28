export const metadata = {
  title: "AutoFree",
  description: "Vendez votre voiture simplement, sans stress – AutoFree.ch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-blue-700">AutoFree</a>
            <nav className="flex gap-4 text-sm">
              <a href="/vendre" className="hover:underline">Vendre</a>
              <a href="/recherche" className="hover:underline">Rechercher</a>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>

        <footer className="border-t text-sm text-gray-500 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4">
            © {new Date().getFullYear()} AutoFree.ch – Simplicité & liberté automobile
          </div>
        </footer>
      </body>
    </html>
  );
}
