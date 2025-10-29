import "./globals.css";
import Link from "next/link";
import { CarFront } from "lucide-react"; // 🚗 Icône voiture

export const metadata = {
  title: "AutoFree – Ventes de véhicules d’occasion en Suisse",
  description:
    "Achetez ou vendez votre voiture d’occasion en Suisse facilement et gratuitement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-100 text-gray-900">
        {/* ----- NAVBAR ----- */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
            {/* Logo / Nom du site */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-semibold text-blue-700 hover:opacity-90"
            >
              <CarFront size={26} className="text-blue-700" />
              <span>AutoFree</span>
            </Link>

            {/* Liens */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/recherche" className="hover:text-blue-600">
                Annonces
              </Link>
              <Link href="/vendre" className="hover:text-blue-600">
                Vendre
              </Link>
              <a
                href="https://autofree-web.vercel.app/api/annonces"
                className="hover:text-blue-600"
                target="_blank"
              >
                API
              </a>
            </div>
          </nav>
        </header>

        {/* ----- CONTENU ----- */}
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>

        {/* ----- PIED DE PAGE ----- */}
        <footer className="mt-10 border-t py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AutoFree.ch — Tous droits réservés
        </footer>
      </body>
    </html>
  );
}
