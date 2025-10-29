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
  "Noir", "Blanc", "Gris", "Argent", "Bleu", "Rouge",
  "Vert", "Jaune", "Orange", "Marron", "Violet", "Autre"
] as const;
const ENERGIES = ["Essence", "Diesel", "Hybride", "Électrique"] as const;
const BOITES = ["Manuelle", "Automatique"] as const;
const TRACTIONS = ["Traction avant", "Propulsion", "4 roues motrices"] as const;

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

      const url = /api/impot?${params.toString()};
      const res = await fetch(url, { cache: "no-store" });
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
        <label className="block p-4