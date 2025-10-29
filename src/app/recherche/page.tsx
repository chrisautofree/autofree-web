"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

// Empêche le prerender statique (évite l'erreur au build)
export const dynamic = "force-dynamic";

type Annonce = {
  id: number;
  createdAt: string;
  marque: string;
  modele: string;
  energie: string;
  annee: string;
  km: number;
  prix: number;
  canton?: string;
};

export default function Page() {
  // On enveloppe le composant qui utilise useSearchParams dans <Suspense>
  return (
    <Suspense fallback={<div className="p-6">Chargement…</div>}>
      <RechercheClient />
    </Suspense>
  );
}

function RechercheClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").toLowerCase();

  const [filtre, setFiltre] = useState({
    canton: "",
    energie: "",
    minPrix: "",
    maxPrix: "",
  });

  const [items, setItems] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/annonces", { cache: "no-store" });
        const data = await res.json();
        if (alive) setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    return items.filter((x) =>
      (!q || `${x.marque} ${x.modele} ${x.canton ?? ""}`.toLowerCase().includes(q)) &&
      (!filtre.canton || x.canton === filtre.canton) &&
      (!filtre.energie || x.energie === filtre.energie) &&
      (!filtre.minPrix || x.prix >= Number(filtre.minPrix)) &&
      (!filtre.maxPrix || x.prix <= Number(filtre.maxPrix))
    );
  }, [q, filtre, items]);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {/* Filtres */}
      <aside className="space-y-3">
        <div className="p-4 bg-white border rounded">
          <div className="font-medium mb-2 text-lg">Filtres</div>

          <label className="block mb-2 text-sm">
            Canton
            <select
              className="w-full border rounded px-2 py-2"
              value={filtre.canton}
              onChange={(e) => setFiltre({ ...filtre, canton: e.target.value })}
            >
              <option value="">Tous</option>
              <option>GE</option>
              <option>VD</option>
              <option>VS</option>
              <option>FR</option>
              <option>NE</option>
              <option>JU</option>
            </select>
          </label>

          <label className="block mb-2 text-sm">
            Énergie
            <select
              className="w-full border rounded px-2 py-2"
              value={filtre.energie}
              onChange={(e) => setFiltre({ ...filtre, energie: e.target.value })}
            >
              <option value="">Toutes</option>
              <option>Essence</option>
              <option>Diesel</option>
              <option>Hybride</option>
              <option>Électrique</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <input
              placeholder="Min CHF"
              className="border rounded px-2 py-2"
              value={filtre.minPrix}
              onChange={(e) => setFiltre({ ...filtre, minPrix: e.target.value })}
            />
            <input
              placeholder="Max CHF"
              className="border rounded px-2 py-2"
              value={filtre.maxPrix}
              onChange={(e) => setFiltre({ ...filtre, maxPrix: e.target.value })}
            />
          </div>
        </div>
      </aside>

      {/* Résultats */}
      <div className="md:col-span-2 space-y-3">
        <h1 className="text-xl font-semibold text-gray-800">
          {loading ? "Chargement..." : `${results.length} résultat(s)`}
        </h1>

        {!loading && results.length === 0 && (
          <div className="p-6 border rounded bg-white text-gray-600">
            Aucune annonce ne correspond pour l’instant.
          </div>
        )}

        {results.map((x) => (
          <div
            key={x.id}
            className="p-4 bg-white rounded border hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {x.marque} {x.modele} • {x.annee}
                </div>
                <div className="text-sm text-gray-600">
                  {(x.canton ?? "—")} • {x.energie} • {x.km.toLocaleString()} km
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-700">
                CHF {x.prix.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
