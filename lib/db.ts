import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Schema } from "./schema";

config({ path: ".env" });

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle<typeof Schema>(pool, { schema: Schema });
