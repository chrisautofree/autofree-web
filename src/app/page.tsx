"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Annonce = {
  id: number;
  createdAt: string; // ISO string
  marque: string;
  modele: string;
  energie: string;
  annee: string;
  km: number;
  prix: number;
  canton?: string;
};

export default function Home() {
  const [items, setItems] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tri, setTri] = useState<"recent" | "top">("recent");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/annonces", { cache: "no-store" });
        const data: Annonce[] = await res.json();
        if (!alive) return;
        setItems(data);
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

  // Filtre + tri
  const results = useMemo(() => {
    const txt = q.trim().toLowerCase();
    const filtered = items.filter((x) =>
      !txt
        ? true
        : `${x.marque} ${x.modele} ${x.canton ?? ""} ${x.energie} ${x.annee}`
            .toLowerCase()
            .includes(txt)
    );

    const byRecent = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (tri === "recent") return byRecent;

    // "Top" très simple (temporaire) : proxy popularité = prix élevé et récent
    const byTop = [...filtered].sort((a, b) => {
      const score = (x: Annonce) =>
        (x.prix || 0) * 0.6 +
        (100000 - Math.min(x.km || 0, 100000)) * 0.1 +
        new Date(x.createdAt).getTime() / 1e10; // léger bonus fraîcheur
      return score(b) - score(a);
    });
    return byTop;
  }, [items, q, tri]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <section className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Vendez ou trouvez votre voiture d’occasion, simplement.
        </h1>
        <p className="mt-2 text-gray-600">
          AutoFree — publication rapide, recherche claire, gratuit pour démarrer.
        </p>

        {/* Actions principales */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Link
            href="/vendre"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition"
          >
            Vendre mon véhicule
          </Link>
          <Link
            href="/recherche"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg border hover:bg-gray-50 transition"
          >
            Voir toutes les annonces
          </Link>
        </div>

        {/* Barre de recherche directe */}
        <div className="mt-6">
          <label className="block text-sm text-gray-700 mb-2">
            Rechercher une annonce
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full max-w-xl border rounded-lg px-4 py-3"
            placeholder="Ex. Golf, Tesla, GE, diesel, 2018…"
          />
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button
              onClick={() => setTri("recent")}
              className={`px-3 py-1.5 rounded border ${
                tri === "recent"
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
            >
              Plus récentes
            </button>
            <button
              onClick={() => setTri("top")}
              className={`px-3 py-1.5 rounded border ${
                tri === "top"
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "hover:bg-gray-50"
              }`}
              title="Classement simple provisoire (prix + fraîcheur)"
            >
              Populaires
            </button>
          </div>
        </div>
      </section>

      {/* LISTE DES ANNONCES */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">
            {tri === "recent" ? "Annonces récentes" : "Annonces populaires"}
          </h2>
          <Link
            href="/recherche"
            className="text-sm text-blue-700 hover:underline"
          >
            Ouvrir la recherche avancée →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 bg-white border rounded-lg">Chargement…</div>
        ) : results.length === 0 ? (
          <div className="p-6 bg-white border rounded-lg text-gray-600">
            Aucune annonce ne correspond pour l’instant.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {results.slice(0, 10).map((x) => (
              <article
                key={x.id}
                className="p-4 bg-white rounded-lg border hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {x.marque} {x.modele} • {x.annee}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(x.canton ?? "—")} • {x.energie} •{" "}
                      {x.km.toLocaleString()} km
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-blue-700">
                    CHF {x.prix.toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Publiée le {new Date(x.createdAt).toLocaleDateString("fr-CH")}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
