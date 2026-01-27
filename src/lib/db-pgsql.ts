import { Pool } from "pg";

export const client = new Pool({
  user: "postgres",
  host: "79.137.99.241",
  database: "AMD",
  password: "postgres",
  port: 52603,
});
