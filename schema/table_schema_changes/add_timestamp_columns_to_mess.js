import pool from '../../config/db.config.js';

const addTimestampsToMess = async () => {
  try {
    const addColumnsQuery = `
      ALTER TABLE mess
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
    `;

    await pool.query(addColumnsQuery);
    console.log('✅ "created_at" and "updated_at" columns added to "mess" table successfully.');
  } catch (error) {
    console.error('❌ Error altering mess table:', error);
  } finally {
    await pool.end(); // close DB connection
  }
};

addTimestampsToMess();
