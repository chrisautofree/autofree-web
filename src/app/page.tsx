"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const r = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">
        Trouvez votre prochaine voiture d’occasion en Suisse
      </h1>

      <div className="flex gap-2 items-center">
        <input
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Marque, modèle, canton…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg bg-blue-700 text-white"
          onClick={() => r.push(`/recherche?q=${encodeURIComponent(q)}`)}
        >
          Rechercher
        </button>
        <a href="/vendre" className="px-4 py-2 rounded-lg border">
          Vendre
        </a>
      </div>

      <p className="text-gray-600 text-sm">
        Déposez votre annonce <strong>gratuitement</strong> sur AutoFree.ch et
        touchez des acheteurs près de chez vous.
      </p>
    </section>
  );
}
