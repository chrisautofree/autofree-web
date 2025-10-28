"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

// 🔹 Données fictives (mock)
const MOCK = [
  { id: 1, marque: "Volkswagen", modele: "Golf", canton: "GE", prix: 11900, energie: "Essence", km: 89000, annee: 2017 },
  { id: 2, marque: "Tesla", modele: "Model 3", canton: "VD", prix: 27900, energie: "Électrique", km: 120000, annee: 2019 },
  { id: 3, marque: "BMW", modele: "X1", canton: "VS", prix: 16900, energie: "Diesel", km: 155000, annee: 2016 },
  { id: 4, marque: "Toyota", modele: "Yaris", canton: "GE", prix: 8900, energie: "Hybride", km: 105000, annee: 2015 },
];

export default function Recherche() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.toLowerCase() ?? "";

  const [filtre, setFiltre] = useState({
    canton: "",
    energie: "",
    minPrix: "",
    maxPrix: "",
  });

  // 🔍 Filtrage dynamique des résultats
  const results = useMemo(() => {
    return MOCK.filter((x) =>
      (!q || `${x.marque} ${x.modele} ${x.canton}`.toLowerCase().includes(q)) &&
      (!filtre.canton || x.canton === filtre.canton) &&
      (!filtre.energie || x.energie === filtre.energie) &&
      (!filtre.minPrix || x.prix >= Number(filtre.minPrix)) &&
      (!filtre.maxPrix || x.prix <= Number(filtre.maxPrix))
    );
  }, [q, filtre]);

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {/* 🔸 Barre latérale des filtres */}
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

      {/* 🔹 Résultats */}
      <div className="md:col-span-2 space-y-3">
        <h1 className="text-xl font-semibold text-gray-800">
          {results.length} résultat(s)
        </h1>

        {results.map((x) => (
          <a
            key={x.id}
            href={`/voiture/${x.id}`}
            className="block p-4 bg-white rounded border hover:shadow-sm transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {x.marque} {x.modele} • {x.annee}
                </div>
                <div className="text-sm text-gray-600">
                  {x.canton} • {x.energie} • {x.km.toLocaleString()} km
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-700">
                CHF {x.prix.toLocaleString()}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
