import { NextResponse } from "next/server";

// ⚠️ STUB : renvoie des valeurs plausibles après un léger délai.
// Remplace ensuite par un vrai OCR (Tesseract + OpenCV) côté serveur.
export async function POST(req: Request) {
  // const form = await req.formData();  // quand tu passeras un vrai fichier
  // const file = form.get('file') as File | null;

  await new Promise((r) => setTimeout(r, 600));

  return NextResponse.json({
    marque: "Volkswagen",
    modele: "Golf",
    energie: "Essence",
    annee: "2017",
    co2: 118,
    poids: 1250,
    canton: "GE",
    // score de confiance fictif
    confidence: 0.88
  });
}
