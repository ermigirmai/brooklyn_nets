import type { PlayerEvaluation } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getPlayer(slug: string): Promise<PlayerEvaluation> {
  const response = await fetch(`${API_URL}/api/v1/players/${slug}`, { next: { revalidate: 300 } });
  if (!response.ok) throw new Error("Player unavailable");
  return response.json();
}

