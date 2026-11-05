import { hasSupabaseConfig, supabase } from "./supabase";
import { demoGames } from "../data/categories";

export async function getGames() {
  if (!hasSupabaseConfig) return demoGames;
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAllGamesForAdmin() {
  const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveGame(game) {
  const payload = { ...game };
  delete payload.id;
  if (game.id) {
    const { data, error } = await supabase.from("games").update(payload).eq("id", game.id).select().single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("games").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGame(id) {
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) throw error;
}
