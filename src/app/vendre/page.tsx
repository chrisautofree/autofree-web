"use client";

import { useMemo, useState } from "react";

const YEARS = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= 1990; y--) years.push(y);
  return years;
})();

export default function VendrePage() {
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");

  const [canton, setCanton] = useState("");
  const [couleur, setCouleur] = useState("");
  const [energie, setEnergie] = useState("");
  const [boite, setBoite] = useState("");
  const [traction, setTraction] = useState("");
  const [annee, setAnnee] = useState("");
  const [km, setKm] = useState("");
  const [prix, setPrix] = useState("");

  const [puissance, setPuissance] = useState<string>(""); // en chevaux
  const [co2, setCo2] = useState("");
  const [poids, setPoids] = useState("");
  const [impotEstime, setImpotEstime] = useState<number | null>(null);

  const canEstimateTax = useMemo(
    () => Boolean(canton && energie && (co2 !== "" || poids !== "")),
    [canton, energie, co2, poids]
  );

  const onPreview = async () => {
    if (!canEstimateTax) {
      setImpotEstime(null);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("canton", canton);
      params.set("energie", energie);
      if (co2) params.set("co2", co2);
      if (poids) params.set("poids", poids);

      const url = `/api/impot?${params.toString()}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setImpotEstime(typeof data.value === "number" ? data.value : null);
    } catch {
      setImpotEstime(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!energie) return alert("Veuillez choisir l’énergie.");
    if (!traction) return alert("Veuillez choisir la traction.");
    if (!boite) return alert("Veuillez choisir la boîte de vitesses.");
    if (!couleur) return alert("Veuillez choisir la couleur.");
    if (!annee) return alert("Veuillez choisir l’année.");
    if (!puissance || Number(puissance) <= 0)
      return alert("Veuillez indiquer une puissance valide (en chevaux).");

    const annonce = {
      marque,
      modele,
      energie,
      annee,
      km: Number(km),
      prix: Number(prix),
      canton,
      couleur,
      boite,
      traction,
      puissance: Number(puissance),
      co2: co2 ? Number(co2) : null,
      poids: poids ? Number(poids) : null,
    };

    const res = await fetch("/api/annonces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annonce),
    });

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return alert("Erreur lors de la création de l’annonce. " + (e.error || ""));
    }

    alert("Annonce créée avec succès !");
    // reset form
    setMarque("");
    setModele("");
    setCanton("");
    setCouleur("");
    setEnergie("");
    setBoite("");
    setTraction("");
    setAnnee("");
    setKm("");
    setPrix("");
    setPuissance("");
    setCo2("");
    setPoids("");
    setImpotEstime(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Mettre en vente un véhicule
      </h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Marque et Modèle */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            placeholder="Marque *"
            className="border p-2 rounded"
            required
          />
          <input
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            placeholder="Modèle *"
            className="border p-2 rounded"
            required
          />
        </div>

        {/* Canton et Couleur */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Sélectionner le canton — *</option>
            <option value="GE">Genève</option>
            <option value="VD">Vaud</option>
            <option value="VS">Valais</option>
            <option value="FR">Fribourg</option>
            <option value="NE">Neuchâtel</option>
            <option value="JU">Jura</option>
          </select>

          <select
            value={couleur}
            onChange={(e) => setCouleur(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Sélectionner la couleur — *</option>
            <option value="Noir">Noir</option>
            <option value="Blanc">Blanc</option>
            <option value="Gris">Gris</option>
            <option value="Argent">Argent</option>
            <option value="Bleu">Bleu</option>
            <option value="Rouge">Rouge</option>
            <option value="Vert">Vert</option>
            <option value="Jaune">Jaune</option>
            <option value="Orange">Orange</option>
            <option value="Marron">Marron</option>
            <option value="Violet">Violet</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Boîte et Traction */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={boite}
            onChange={(e) => setBoite(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Boîte de vitesses — *</option>
            <option value="Manuelle">Boîte manuelle</option>
            <option value="Automatique">Boîte automatique</option>
          </select>

          <select
            value={traction}
            onChange={(e) => setTraction(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Traction — *</option>
            <option value="Traction avant">Traction avant</option>
            <option value="Propulsion">Propulsion</option>
            <option value="4 roues motrices">4 roues motrices</option>
          </select>
        </div>

        {/* Année + Énergie */}
        <div className="grid grid-cols-2 gap-4">
          <select
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Année — *</option>
            {YEARS.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={energie}
            onChange={(e) => setEnergie(e.target.value)}
            required
            className="border p-2 rounded"
          >
            <option value="">— Énergie — *</option>
            <option value="Essence">Essence</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybride">Hybride</option>
            <option value="Électrique">Électrique</option>
          </select>
        </div>

        {/* Km / Prix */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="Kilométrage *"
            className="border p-2 rounded"
            inputMode="numeric"
            required
          />
          <input
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            placeholder="Prix (CHF) *"
            className="border p-2 rounded"
            inputMode="numeric"
            required
          />
        </div>

        {/* Puissance en chevaux */}
        <div>
          <input
            value={puissance}
            onChange={(e) => setPuissance(e.target.value)}
            placeholder="Puissance (en chevaux) *"
            className="border p-2 rounded w-full"
            inputMode="numeric"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Indique la puissance du véhicule en chevaux (cv).
          </p>
        </div>

        {/* CO₂ / Poids */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={co2}
            onChange={(e) => setCo2(e.target.value)}
            placeholder="CO₂ (g/km)"
            className="border p-2 rounded"
            inputMode="numeric"
          />
          <input
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            placeholder="Poids (kg)"
            className="border p-2 rounded"
            inputMode="numeric"
          />
        </div>

        {/* Prévisualisation impôt */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onPreview}
            disabled={!canEstimateTax}
            className={`px-4 py-2 border rounded ${
              canEstimateTax ? "hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
            }`}
          >
            Prévisualisation impôt
          </button>

          {impotEstime !== null && (
            <p className="text-sm text-gray-700">
              Estimation : {impotEstime.toFixed(2)} CHF / an
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Publier l’annonce
        </button>
      </form>
    </div>
  );
}
