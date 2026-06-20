import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        level INTEGER NOT NULL,
        time_seconds INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    return NextResponse.json({ ok: true, message: "scores table ready" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
