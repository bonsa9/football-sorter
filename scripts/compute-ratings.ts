import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { computeBradleyTerry } from "../src/engine/bradleyTerry.ts";
import type { Pool, Vote, RatingFile } from "../src/engine/types.ts";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_READ_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

async function main() {
  console.log("=== Football Sorter: Compute Community Ratings ===");

  const poolsPath = path.resolve("public/data/pools/index.json");
  if (!fs.existsSync(poolsPath)) {
    console.error(`Error: Pools index not found at ${poolsPath}`);
    process.exit(1);
  }

  const pools: Pool[] = JSON.parse(fs.readFileSync(poolsPath, "utf-8"));
  console.log(`Loaded ${pools.length} pools from static catalogue.`);

  let allVotes: Vote[] = [];

  if (SUPABASE_URL && SUPABASE_KEY) {
    console.log("Connecting to Supabase to fetch community votes...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });

    try {
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from("votes")
          .select("id, pool_id, a, b, result, session_id, created_at")
          .range(from, to);

        if (error) {
          throw new Error(`Supabase query failed: ${error.message}`);
        }

        if (data && data.length > 0) {
          const mappedVotes: Vote[] = data.map((row: any) => ({
            id: row.id,
            poolId: row.pool_id,
            a: row.a,
            b: row.b,
            result: row.result,
            sessionId: row.session_id,
            createdAt: row.created_at,
          }));
          allVotes.push(...mappedVotes);
          page++;
          if (data.length < pageSize) hasMore = false;
        } else {
          hasMore = false;
        }
      }

      console.log(`Successfully fetched ${allVotes.length} community votes from Supabase.`);
    } catch (err: any) {
      console.error("FATAL: Failed to fetch votes from Supabase:", err.message);
      // Fail loudly to avoid overwriting valid cached data with empty files
      process.exit(1);
    }
  } else {
    console.warn("Notice: No Supabase credentials configured in environment.");
    console.warn("Preserving existing rating files or initializing baseline.");
  }

  const ratingsDir = path.resolve("public/data/ratings");
  fs.mkdirSync(ratingsDir, { recursive: true });

  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const pool of pools) {
    const poolVotes = allVotes.filter((v) => v.poolId === pool.id);
    const ratingFilePath = path.join(ratingsDir, `${pool.id}.json`);

    // If no community votes exist and existing ratings file has votes, do not clobber
    if (poolVotes.length === 0 && fs.existsSync(ratingFilePath)) {
      try {
        const existing: RatingFile = JSON.parse(fs.readFileSync(ratingFilePath, "utf-8"));
        if (existing.totalVotes > 0) {
          console.log(`Skipping ${pool.id}: keeping existing ${existing.totalVotes} votes.`);
          continue;
        }
      } catch {
        // ignore parse error and recompute
      }
    }

    // Run Bradley-Terry with bootstrap confidence intervals
    const ratings = computeBradleyTerry(pool.id, pool.memberIds, poolVotes, {
      bootstrap: poolVotes.length > 0,
      bootstrapIterations: 200,
    });

    const ratingFile: RatingFile = {
      poolId: pool.id,
      computedAt: now,
      totalVotes: poolVotes.length,
      ratings,
    };

    fs.writeFileSync(ratingFilePath, JSON.stringify(ratingFile, null, 2));
    updatedCount++;
    console.log(
      `Updated ${pool.id}: ${poolVotes.length} votes, ${ratings.length} rated entities.`
    );
  }

  console.log(`\nCompleted! Successfully updated ${updatedCount} rating files at ${now}.`);
}

main().catch((err) => {
  console.error("Unhandled error in compute-ratings:", err);
  process.exit(1);
});
