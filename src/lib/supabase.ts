// Supabase 클라이언트 — 키 설정 시에만 생성. Firebase ID 토큰을 accessToken으로 주입(RLS).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabase, supabaseConfig } from "./env";

let cached: SupabaseClient | null = null;

export function getSupabase(accessToken?: string): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (cached && !accessToken) return cached;
  const client = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false },
  });
  if (!accessToken) cached = client;
  return client;
}
