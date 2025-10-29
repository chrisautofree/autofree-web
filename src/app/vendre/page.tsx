"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  marque: z.string().min(1, "Requis"),
  modele: z.string().min(1, "Requis"),
  energie: z.string().min(1, "Requis"),
  annee: z.string().min(1, "Requis"),
  km: z.coerce.number().min(0, "Nombre invalide"),
  prix: z.coerce.number().min(0, "Nombre invalide"),
  canton: z.string().min(1, "Requis"),
  couleur: z.string().min(1, "Requis"),
  boite: z.string().min(1, "Requis"),
  traction: z.string().min(1, "Requis"),
  co2: z.coerce.number().optional(),
  poids: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function VendrePage() {
  const [impotEstime, setImpotEstime] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      energie: "Essence",
      canton: "GE",
      couleur: "Noir",
      boite: "Manuelle",
      traction: "Avant",
    },
  });

  const energie = watch("energie");
  const canton = watch("canton");
  const co2 = watch("co2");
  const poids = watch("poids");

  const canEstimateTax =
    Boolean(canton && energie && (co2 != null || poids != null));

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/annonces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("✅ Annonce enregistrée avec succès !");
    } else {
      alert("❌ Erreur lors de l’enregistrement.");
    }
  };

  const onPreview = async () => {
    if (!canEstimateTax) {
      setImpotEstime(null);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.set("canton", String(canton));
      if (energie) params.set("energie", String(energie));
      if (co2 != null) params.set("co2", String(co2));
      if (poids != null) params.set("poids", String(poids));

      const url = /api/impot?${params.toString()}; // ✅ corrigé
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setImpotEstime(typeof data.value === "number" ? data.value : null);
    } catch {
      setImpotEstime(null);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Mettre en vente un véhicule
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* --- Champs principaux --- */}
        <div>
          <label>Marque *</label>
          <input {...register("marque")} className="w-full border p-2" />
          {errors.marque && <p className="text-red-600">{errors.marque.message}</p>}
        </div>

        <div>
          <label>Modèle *</label>
          <input {...register("modele")} className="w-full border p-2" />
          {errors.modele && <p className="text-red-600">{errors.modele.message}</p>}
        </div>

        <div>
          <label>Énergie *</label>
          <select {...register("energie")} className="w-full border p-2">
            <option>Essence</option>
            <option>Diesel</option>
            <option>Hybride</option>
            <option>Électrique</option>
          </select>
        </div>

        <div>
          <label>Année *</label>
          <select {...register("annee")} className="w-full border p-2">
            {Array.from({ length: 30 }, (_, i) => {
              const year = 2025 - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label>Kilométrage (km) *</label>
          <input
            type="number"
            {...register("km")}
            className="w-full border p-2"
          />
        </div>

        <div>
          <label>Prix (CHF) *</label>
          <input
            type="number"
            {...register("prix")}
            className="w-full border p-2"
          />
        </div>

        <div>
          <label>Canton *</label>
          <select {...register("canton")} className="w-full border p-2">
            <option value="GE">Genève</option>
            <option value="VD">Vaud</option>
            <option value="VS">Valais</option>
            <option value="FR">Fribourg</option>
            <option value="NE">Neuchâtel</option>
            <option value="JU">Jura</option>
          </select>
        </div>

        {/* --- Nouveaux champs --- */}
        <div>
          <label>Couleur *</label>
          <select {...register("couleur")} className="w-full border p-2">
            <option>Noir</option>
            <option>Blanc</option>
            <option>Gris</option>
            <option>Bleu</option>
            <option>Rouge</option>
            <option>Vert</option>
            <option>Autre</option>
          </select>
        </div>

        <div>
          <label>Boîte de vitesse *</label>
          <select {...register("boite")} className="w-full border p-2">
            <option>Manuelle</option>
            <option>Automatique</option>
          </select>
        </div>

        <div>
          <label>Traction *</label>
          <select {...register("traction")} className="w-full border p-2">
            <option>Avant</option>
            <option>Propulsion</option>
            <option>4 roues motrices</option>
          </select>
        </div>

        {/* --- Champs optionnels --- */}
        <div>
          <label>CO₂ (g/km)</label>
          <input type="number" {...register("co2")} className="w-full border p-2" />
        </div>

        <div>
          <label>Poids (kg)</label>
          <input type="number" {...register("poids")} className="w-full border p-2" />
        </div>

        {/* --- Impôt estimé --- */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onPreview}
            disabled={!canEstimateTax}
            className={`px-4 py-2 border rounded ${
              canEstimateTax ? "hover:bg-gray-50" : "opacity-60 cursor-not-allowed"
            }`}
            title={
              canEstimateTax
                ? "Calculer l’estimation basée sur Canton + Énergie + (CO₂ ou Poids)"
                : "Renseignez Canton, Énergie et CO₂ ou Poids pour estimer l’impôt"
            }
          >
            Prévisualisation impôt
          </button>
          {impotEstime !== null && (
            <p className="mt-2 text-green-700">
              Estimation annuelle : {impotEstime} CHF
            </p>
          )}
        </div>

        {/* --- Bouton principal --- */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Publier mon annonce
        </button>
      </form>
    </main>
  );
}