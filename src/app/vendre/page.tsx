"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useState } from "react";

/* ---------------------------
   Listes déroulantes (options)
---------------------------- */
const CANTONS = ["GE", "VD", "VS", "FR", "NE", "JU"] as const;
const COULEURS = [
  "Noir","Blanc","Gris","Argent","Bleu","Rouge","Vert","Jaune","Orange","Marron","Violet","Autre"
] as const;
const ENERGIES = ["Essence","Diesel","Hybride","Électrique"] as const;
const BOITES = ["Manuelle","Automatique"] as const;
const TRACTIONS = ["Traction avant","Propulsion","4 roues motrices"] as const;

// années de l’année courante à 1990
const THIS_YEAR = new Date().getFullYear();
const ANNEES = Array.from({ length: THIS_YEAR - 1989 }, (_, i) => String(THIS_YEAR - i)) as const;

/* ---------------------------
   Schéma & types du formulaire
---------------------------- */
const schema = z.object({
  marque: z.string().min(1, "Obligatoire"),
  modele: z.string().min(1, "Obligatoire"),
  energie: z.enum(ENERGIES, { errorMap: () => ({ message: "Obligatoire" }) }),
  annee: z.enum(ANNEES, { errorMap: () => ({ message: "Obligatoire" }) }),
  km: z.coerce.number().min(0, "Valeur invalide"),
  prix: z.coerce.number().min(0, "Valeur invalide"),
  canton: z.enum(CANTONS, { errorMap: () => ({ message: "Obligatoire" }) }),
  couleur: z.enum(COULEURS, { errorMap: () => ({ message: "Obligatoire" }) }),
  boite: z.enum(BOITES, { errorMap: () => ({ message: "Obligatoire" }) }),
  traction: z.enum(TRACTIONS, { errorMap: () => ({ message: "Obligatoire" }) }),
  co2: z.coerce.number().optional(),
  poids: z.coerce.number().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Vendre() {
  const [impotEstime, setImpotEstime] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      energie: "Essence",
      canton: undefined,
      boite: undefined,
      traction: undefined,
      couleur: undefined,
      annee: String(THIS_YEAR) as (typeof ANNEES)[number],
    },
  });

  const energie = watch("energie");
  const co2 = watch("co2");
  const poids = watch("poids");
  const canton = (watch("canton") || "") as (typeof CANTONS)[number] | "";

  // Conditions minimales : canton + énergie + (CO2 ou Poids)
  const canEstimateTax = useMemo(
    () => Boolean(canton && energie && (co2 != null || poids != null)),
    [canton, energie, co2, poids]
  );

  /** OCR : préremplit depuis la carte grise */
  async function runOcr(file?: File) {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      if (!res.ok) {
        alert("Erreur lors de l'analyse OCR.");
        return;
      }
      const data = await res.json();

      if (data.marque) setValue("marque", data.marque);
      if (data.modele) setValue("modele", data.modele);
      if (data.energie && ENERGIES.includes(data.energie)) setValue("energie", data.energie);
      if (data.annee && ANNEES.includes(String(data.annee))) setValue("annee", String(data.annee) as any);
      if (data.co2 != null) setValue("co2", Number(data.co2) as any);
      if (data.poids != null) setValue("poids", Number(data.poids) as any);
      if (data.canton && CANTONS.includes(data.canton)) setValue("canton", data.canton);

      alert("Lecture terminée ✅ Les champs ont été remplis automatiquement.");
    } catch (err: any) {
      alert("Erreur réseau OCR : " + (err?.message || "inconnue"));
    }
  }

  /** Estimation impôt (selon canton) */
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

      const res = await fetch(/api/impot?${params.toString()}, { cache: "no-store" });
      const data = await res.json();
      setImpotEstime(typeof data.value === "number" ? data.value : null);
    } catch {
      setImpotEstime(null);
    }
  };

  /** Publication de l’annonce */
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

        {/* Upload carte grise */}
        <label className="block p-4 border rounded-lg bg-white">
          <div className="font-medium mb-2">Photo du permis de circulation (côté droit)</div>
          <input type="file" accept="image/*" onChange={(e) => runOcr(e.target.files?.[0] || undefined)} />
          <p className="text-sm text-gray-500 mt-2">Astuce : document bien éclairé, à plat. (OCR réel à venir)</p>
        </label>

        {/* Formulaire d’annonce */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Bloc 1 : Champs obligatoires principaux */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Marque</label>
              <input className="w-full border rounded px-3 py-2" {...register("marque")} />
              {errors.marque && <p className="text-xs text-red-600">{errors.marque.message}</p>}
            </div>

            <div>
              <label className="text-sm">Modèle</label>
              <input className="w-full border rounded px-3 py-2" {...register("modele")} />
              {errors.modele && <p className="text-xs text-red-600">{errors.modele.message}</p>}
            </div>

            <div>
              <label className="text-sm">Canton</label>
              <select className="w-full border rounded px-3 py-2" {...register("canton")}>
                <option value="">— Sélectionner —</option>
                {CANTONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.canton && <p className="text-xs text-red-600">{errors.canton.message}</p>}
            </div>

            <div>
              <label className="text-sm">Énergie</label>
              <select className="w-full border rounded px-3 py-2" {...register("energie")}>
                {ENERGIES.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              {errors.energie && <p className="text-xs text-red-600">{errors.energie.message}</p>}
            </div>

            <div>
              <label className="text-sm">Année</label>
              <select className="w-full border rounded px-3 py-2" {...register("annee")}>
                {ANNEES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              {errors.annee && <p className="text-xs text-red-600">{errors.annee.message}</p>}
            </div>

            <div>
              <label className="text-sm">Kilométrage</label>
              <input className="w-full border rounded px-3 py-2" type="number" {...register("km")} />
              {errors.km && <p className="text-xs text-red-600">{errors.km.message}</p>}
            </div>

            <div>
              <label className="text-sm">Prix (CHF)</label>
              <input className="w-full border rounded px-3 py-2" type="number" {...register("prix")} />
              {errors.prix && <p className="text-xs text-red-600">{errors.prix.message}</p>}
            </div>

            <div>
              <label className="text-sm">Couleur</label>
              <select className="w-full border rounded px-3 py-2" {...register("couleur")}>
                <option value="">— Sélectionner —</option>
                {COULEURS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.couleur && <p className="text-xs text-red-600">{errors.couleur.message}</p>}
            </div>

            <div>
              <label className="text-sm">Boîte de vitesses</label>
              <select className="w-full border rounded px-3 py-2" {...register("boite")}>
                <option value="">— Sélectionner —</option>
                {BOITES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              {errors.boite && <p className="text-xs text-red-600">{errors.boite.message as string}</p>}
            </div>

            <div>
              <label className="text-sm">Traction</label>
              <select className="w-full border rounded px-3 py-2" {...register("traction")}>
                <option value="">— Sélectionner —</option>
                {TRACTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.traction && <p className="text-xs text-red-600">{errors.traction.message as string}</p>}
            </div>
          </div>

          {/* Bloc 2 : Informations optionnelles */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <label className="text-sm">CO₂ (g/km) (optionnel)</label>
              <input className="w-full border rounded px-3 py-2" type="number" {...register("co2")} />
            </div>
            <div>
              <label className="text-sm">Poids à vide (kg) (optionnel)</label>
              <input className="w-full border rounded px-3 py-2" type="number" {...register("poids")} />
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Encadré impôt */}
      <aside className="space-y-3">
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-medium mb-1">Impôt annuel – Estimation cantonale</h2>
          <p className="text-sm text-gray-600">
            {canton ? <>Canton sélectionné : <span className="font-medium">{canton}</span></> : "Sélectionnez un canton"}
          </p>
          <p className="text-xs text-gray-500">
            Affiché uniquement si les données sont suffisantes (Canton + Énergie + CO₂ ou Poids).
          </p>
          <div className="text-2xl font-semibold mt-2">
            {canEstimateTax && impotEstime !== null ? ${impotEstime} CHF/an : "—"}
          </div>
        </div>
      </aside>
    </section>
  );
}