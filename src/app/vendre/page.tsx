"use client";

import { useState } from "react";

export default function VendrePage() {
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [energie, setEnergie] = useState("Essence");
  const [annee, setAnnee] = useState("");
  const [km, setKm] = useState("");
  const [prix, setPrix] = useState("");
  const [canton, setCanton] = useState("");
  const [couleur, setCouleur] = useState("Inconnue");
  const [boite, setBoite] = useState("Manuelle");
  const [traction, setTraction] = useState("Avant");
  const [co2, setCo2] = useState("");
  const [poids, setPoids] = useState("");
  const [impotEstime, setImpotEstime] = useState<number | null>(null);

  const canEstimateTax =
    canton &&
    energie &&
    (co2 !== "" || poids !== "");

  // ✅ Fonction de prévisualisation d’impôt corrigée
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

      const url = `/api/impot?${params.toString()}`; // ✅ backticks obligatoires
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setImpotEstime(typeof data.value === "number" ? data.value : null);
    } catch {
      setImpotEstime(null);
    }
  };

  // ✅ Soumission du formulaire
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      co2: co2 ? Number(co2) : null,
      poids: poids ? Number(poids) : null,
    };

    const res = await fetch("/api/annonces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annonce),
    });

    if (res.ok) {
      alert("Annonce créée avec succès !");
      setMarque("");
      setModele("");
      setEnergie("Essence");
      setAnnee("");
      setKm("");
      setPrix("");
      setCanton("");
      setCouleur("Inconnue");
      setBoite("Manuelle");
      setTraction("Avant");
      setCo2("");
      setPoids("");
      setImpotEstime(null);
    } else {
      alert("Erreur lors de la création de l’annonce.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Mettre en vente un véhicule</h1>

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
          <select value={canton} onChange={(e) => setCanton(e.target.value)} required className="border p-2 rounded">
            <option value="">Canton *</option>
            <option value="GE">Genève</option>
            <option value="VD">Vaud</option>
            <option value="VS">Valais</option>
            <option value="FR">Fribourg</option>
            <option value="NE">Neuchâtel</option>
            <option value="JU">Jura</option>
          </select>

          <select value={couleur} onChange={(e) => setCouleur(e.target.value)} className="border p-2 rounded">
            <option value="Inconnue">Couleur *</option>
            <option value="Noir">Noir</option>
            <option value="Blanc">Blanc</option>
            <option value="Gris">Gris</option>
            <option value="Bleu">Bleu</option>
            <option value="Rouge">Rouge</option>
            <option value="Vert">Vert</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Boîte et Traction */}
        <div className="grid grid-cols-2 gap-4">
          <select value={boite} onChange={(e) => setBoite(e.target.value)} className="border p-2 rounded">
            <option value="Manuelle">Boîte manuelle</option>
            <option value="Automatique">Boîte automatique</option>
          </select>

          <select value={traction} onChange={(e) => setTraction(e.target.value)} className="border p-2 rounded">
            <option value="Avant">Traction avant</option>
            <option value="Arrière">Propulsion</option>
            <option value="4x4">4 roues motrices</option>
          </select>
        </div>

        {/* Année / Énergie */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            placeholder="Année *"
            className="border p-2 rounded"
            required
          />
          <select value={energie} onChange={(e) => setEnergie(e.target.value)} className="border p-2 rounded">
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
            required
          />
          <input
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            placeholder="Prix (CHF) *"
            className="border p-2 rounded"
            required
          />
        </div>

        {/* CO₂ et Poids */}
        <div className="grid grid-cols-2 gap-4">
          <input
            value={co2}
            onChange={(e) => setCo2(e.target.value)}
            placeholder="CO₂ (g/km)"
            className="border p-2 rounded"
          />
          <input
            value={poids}
            onChange={(e) => setPoids(e.target.value)}
            placeholder="Poids (kg)"
            className="border p-2 rounded"
          />
        </div>

        {/* Bouton prévisualisation impôt */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onPreview}
            disabled={!canEstimateTax}
            className={`px-4 py-2 border rounded ${
              canEstimateTax ? "hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
            }`}
            title={
              canEstimateTax
                ? `Calculer l’estimation basée sur Canton + Énergie + (CO₂ ou Poids)`
                : `Renseignez Canton, Énergie et CO₂ ou Poids pour estimer l’impôt`
            }
          >
            Prévisualisation impôt
          </button>

          {impotEstime !== null && (
            <p className="text-sm text-gray-700">Estimation : {impotEstime.toFixed(2)} CHF / an</p>
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Publier l’annonce
        </button>
      </form>
    </div>
  );
}
