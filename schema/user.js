
import pool from '../config/db.config.js';

const createUserTable = async () => {
  try {
    const query = `
      CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

    `;

    await pool.query(query);
    console.log('✅ "user" table created successfully.');
  } catch (error) {
    console.error('❌ Error creating products user:', error);
  } finally {
    await pool.end(); // close DB connection
  }
};

createUserTable();
