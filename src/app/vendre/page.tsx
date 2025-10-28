"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

/** ---------------------------
 *  Schéma & types du formulaire
 *  --------------------------- */
const schema = z.object({
  marque: z.string().min(1, "Obligatoire"),
  modele: z.string().min(1, "Obligatoire"),
  energie: z.string().min(1),
  annee: z.string().min(4, "AAAA").max(4, "AAAA"),
  km: z.coerce.number().min(0),
  prix: z.coerce.number().min(0),
  canton: z.string().optional(),
  co2: z.coerce.number().optional(),
  poids: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Vendre() {
  const [impotGE, setImpotGE] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { energie: "Essence", canton: "GE" },
  });

  const energie = watch("energie");
  const co2 = watch("co2");
  const poids = watch("poids");

  /** ---------------------------
   *  OCR : envoie la photo à /api/ocr et pré-remplit les champs
   *  --------------------------- */
  async function runOcr(file?: File) {
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        alert("Erreur lors de l'analyse OCR.");
        return;
      }

      const data = await res.json();

      if (data.marque) setValue("marque", data.marque);
      if (data.modele) setValue("modele", data.modele);
      if (data.energie) setValue("energie", data.energie);
      if (data.annee) setValue("annee", String(data.annee));
      if (data.co2) setValue("co2", Number(data.co2) as any);
      if (data.poids) setValue("poids", Number(data.poids) as any);
      if (data.canton) setValue("canton", data.canton);

      alert("Lecture terminée ✅ Les champs ont été remplis automatiquement.");
    } catch (err: any) {
      alert("Erreur réseau OCR : " + (err?.message || "inconnue"));
    }
  }

  /** ---------------------------
   *  IMPÔT GE : appelle /api/impot-ge pour une estimation
   *  --------------------------- */
  const onPreview = async () => {
    try {
      const params = new URLSearchParams();
      if (energie) params.set("energie", energie);
      if (co2) params.set("co2", String(co2));
      if (poids) params.set("poids", String(poids));

      const res = await fetch(`/api/impot-ge?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setImpotGE(typeof data.value === "number" ? data.value : null);
    } catch (e: any) {
      console.error(e);
      setImpotGE(null);
    }
  };

  /** ---------------------------
   *  SUBMIT : publie l’annonce via /api/annonces
   *  --------------------------- */
  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/annonces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        alert("Erreur: " + (e.error || res.statusText));
        return;
      }

      const created = await res.json();
      alert("Annonce publiée ✅\nID: " + created.id);
      window.location.href = "/recherche";
    } catch (err: any) {
      alert("Erreur réseau: " + (err?.message || "inconnue"));
    }
  };

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Vendre mon véhicule</h1>

        {/* Upload carte grise (appel OCR) */}
        <label className="block p-4 border rounded-lg bg-white">
          <div className="font-medium mb-2">
            Photo du permis de circulation (côté droit)
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => runOcr(e.target.files?.[0] || undefined)}
          />
          <p className="text-sm text-gray-500 mt-2">
            Astuce : document bien éclairé, à plat. (OCR réel à venir)
          </p>
        </label>

        {/* Formulaire d’annonce */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Marque</label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("marque")}
              />
              {errors.marque && (
                <p className="text-xs text-red-600">{errors.marque.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm">Modèle</label>
              <input
                className="w-full border rounded px-3 py-2"
                {...register("modele")}
              />
              {errors.modele && (
                <p className="text-xs text-red-600">{errors.modele.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm">Énergie</label>
              <select
                className="w-full border rounded px-3 py-2"
                {...register("energie")}
              >
                <option>Essence</option>
                <option>Diesel</option>
                <option>Hybride</option>
                <option>Électrique</option>
              </select>
            </div>

            <div>
              <label className="text-sm">Année</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="AAAA"
                {...register("annee")}
              />
              {errors.annee && (
                <p className="text-xs text-red-600">{errors.annee.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm">Canton (optionnel)</label>
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="GE, VD, VS…"
                {...register("canton")}
              />
            </div>

            <div>
              <label className="text-sm">CO₂ (g/km) (optionnel)</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="number"
                {...register("co2")}
              />
            </div>

            <div>
              <label className="text-sm">Poids à vide (kg) (optionnel)</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="number"
                {...register("poids")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Kilométrage</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="number"
                {...register("km")}
              />
              {errors.km && (
                <p className="text-xs text-red-600">{errors.km.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm">Prix (CHF)</label>
              <input
                className="w-full border rounded px-3 py-2"
                type="number"
                {...register("prix")}
              />
              {errors.prix && (
                <p className="text-xs text-red-600">{errors.prix.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPreview}
              className="px-4 py-2 border rounded"
            >
              Prévisualiser impôt GE
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-60"
            >
              {isSubmitting ? "Publication…" : "Publier l’annonce"}
            </button>
          </div>
        </form>
      </div>

      {/* Encadré impôt GE */}
      <aside className="space-y-3">
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-medium mb-2">Impôt des plaques – Genève (estimation)</h2>
          <p className="text-sm text-gray-600">
            Calcul indicatif basé sur énergie/CO₂/poids (non contractuel).
          </p>
          <div className="text-2xl font-semibold mt-2">
            {impotGE === null ? "—" : `${impotGE} CHF/an`}
          </div>
        </div>
      </aside>
    </section>
  );
}
