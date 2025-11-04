import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Schema } from "./schema";

// Initialize the connection pool
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});
config({ path: ".env" }); // or .env.local
export const db = drizzle<typeof Schema>(pool, { schema: Schema });
