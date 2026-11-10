import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Vote } from "../engine/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey.length > 10
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export interface RemoteVoteRow {
  id: string;
  pool_id: string;
  a: string;
  b: string;
  result: "a" | "b" | "tie";
  session_id: string;
  created_at: string;
}

export function voteToRow(vote: Vote): RemoteVoteRow {
  return {
    id: vote.id || crypto.randomUUID(),
    pool_id: vote.poolId,
    a: vote.a,
    b: vote.b,
    result: vote.result,
    session_id: vote.sessionId,
    created_at: vote.createdAt,
  };
}

export function rowToVote(row: RemoteVoteRow): Vote {
  return {
    id: row.id,
    poolId: row.pool_id,
    a: row.a,
    b: row.b,
    result: row.result,
    sessionId: row.session_id,
    createdAt: row.created_at,
  };
}

