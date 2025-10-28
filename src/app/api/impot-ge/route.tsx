import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const energie = searchParams.get("energie") || "";
  const co2 = Number(searchParams.get("co2") || "0");
  const poids = Number(searchParams.get("poids") || "0");

  // ⚠️ STUB simplifié — remplace par la formule officielle plus tard
  let value = 0;
  const isElec = /élec|elec|electric/i.test(energie);
  if (!isElec) {
    const base = 200;
    const co2p = Math.max(0, co2 - 120) * 1.2;
    const w = Math.max(0, poids - 1100) * 0.05;
    value = Math.round(base + co2p + w);
  }
  return NextResponse.json({
    value,
    currency: "CHF",
    canton: "GE",
    disclaimer:
      "Estimation non contractuelle — remplacez par la formule officielle GE."
  });
}
