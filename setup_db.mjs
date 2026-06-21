import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = 'postgres://postgres.elruuiazzbhfnpejdfct:E8AEDdmlDdknda2A@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
})

async function setup() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
    
    const schema = fs.readFileSync('supabase_schema.sql', 'utf8');
    await client.query(schema);
    console.log("Schema applied successfully!");
    
  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await client.end();
  }
}

setup();
