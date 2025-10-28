import { NextResponse } from "next/server";

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
  co2?: number;
  poids?: number;
  photos?: string[];
};

// ⚠️ Base en mémoire (réinitialisée à chaque redémarrage)
const DB: Annonce[] = [];

// GET /api/annonces  → liste toutes les annonces
export async function GET() {
  // tri du plus récent au plus ancien
  const items = [...DB].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return NextResponse.json(items);
}

// POST /api/annonces  → crée une annonce
export async function POST(req: Request) {
  const body = await req.json();

  // Validation ultra-simple (le strict sera fait plus tard)
  const required = ["marque", "modele", "energie", "annee", "km", "prix"];
  for (const k of required) {
    if (body[k] === undefined || body[k] === null || body[k] === "") {
      return NextResponse.json(
        { error: `Champ manquant: ${k}` },
        { status: 400 }
      );
    }
  }

  const annonce: Annonce = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    marque: String(body.marque),
    modele: String(body.modele),
    energie: String(body.energie),
    annee: String(body.annee),
    km: Number(body.km),
    prix: Number(body.prix),
    canton: body.canton ? String(body.canton) : undefined,
    co2: body.co2 ? Number(body.co2) : undefined,
    poids: body.poids ? Number(body.poids) : undefined,
    photos: Array.isArray(body.photos) ? body.photos : [],
  };

  DB.push(annonce);
  return NextResponse.json(annonce, { status: 201 });
}
