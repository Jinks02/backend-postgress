import pool from '../../config/db.config.js';

const migrateIntentsOrderTime = async () => {
  const client = await pool.connect();

  try {
    console.log('⏳ Starting migration: intents.order_time → TIMESTAMPTZ');

    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE intents
      ALTER COLUMN order_time TYPE TIMESTAMPTZ
      USING order_time AT TIME ZONE 'UTC';
    `);

    await client.query('COMMIT');

    console.log('✅ Migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

migrateIntentsOrderTime();
