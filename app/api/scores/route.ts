import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT player_name, score, level, time_seconds, created_at
       FROM scores
       ORDER BY score DESC
       LIMIT 10`
    );
    return NextResponse.json({ scores: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { player_name, score, level, time_seconds } = await req.json();

    if (!player_name || score == null || level == null || time_seconds == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof score !== "number" || score < 0 || score > 999999) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO scores (player_name, score, level, time_seconds)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [player_name.slice(0, 50), score, level, time_seconds]
    );

    return NextResponse.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
