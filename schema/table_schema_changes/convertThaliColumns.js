import pool from '../../config/db.config.js';

const convertThaliColumnsToBoolean = async () => {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting safe boolean migration...');

    await client.query('BEGIN');

    // 1️⃣ Add new boolean columns
    console.log('➕ Adding new temporary boolean columns...');
    await client.query(`
      ALTER TABLE thalis
      ADD COLUMN daal_boolean BOOLEAN,
      ADD COLUMN rice_boolean BOOLEAN,
      ADD COLUMN salad_boolean BOOLEAN,
      ADD COLUMN sweet_boolean BOOLEAN;
    `);

    // 2️⃣ Convert values safely
    console.log('🔁 Converting values correctly...');
    await client.query(`
      UPDATE thalis SET
        daal_boolean = CASE
            WHEN lower(daal::text) IN ('true', 'yes', '1', 't') THEN TRUE
            WHEN lower(daal::text) IN ('false', 'no', '0', 'f') THEN FALSE
            ELSE FALSE
        END,
        rice_boolean = CASE
            WHEN lower(rice::text) IN ('true', 'yes', '1', 't') THEN TRUE
            WHEN lower(rice::text) IN ('false', 'no', '0', 'f') THEN FALSE
            ELSE FALSE
        END,
        salad_boolean = CASE
            WHEN lower(salad::text) IN ('true', 'yes', '1', 't') THEN TRUE
            WHEN lower(salad::text) IN ('false', 'no', '0', 'f') THEN FALSE
            ELSE FALSE
        END,
        sweet_boolean = CASE
            WHEN lower(sweet::text) IN ('true', 'yes', '1', 't') THEN TRUE
            WHEN lower(sweet::text) IN ('false', 'no', '0', 'f') THEN FALSE
            ELSE FALSE
        END;
    `);

    // 3️⃣ Validate
    const check = await client.query(`
      SELECT COUNT(*) FROM thalis
      WHERE daal_boolean IS NULL
         OR rice_boolean IS NULL
         OR salad_boolean IS NULL
         OR sweet_boolean IS NULL;
    `);

    if (parseInt(check.rows[0].count) !== 0) {
      throw new Error('NULL values detected — aborting migration');
    }

    // 4️⃣ Drop old columns
    console.log('🗑 Dropping original text columns...');
    await client.query(`
      ALTER TABLE thalis
      DROP COLUMN daal,
      DROP COLUMN rice,
      DROP COLUMN salad,
      DROP COLUMN sweet;
    `);

    // 5️⃣ Rename
    console.log('✏ Renaming temp columns...');
    await client.query(`ALTER TABLE thalis RENAME COLUMN daal_boolean TO daal;`);
    await client.query(`ALTER TABLE thalis RENAME COLUMN rice_boolean TO rice;`);
    await client.query(`ALTER TABLE thalis RENAME COLUMN salad_boolean TO salad;`);
    await client.query(`ALTER TABLE thalis RENAME COLUMN sweet_boolean TO sweet;`);

    // 6️⃣ Defaults (only affects new rows)
    console.log('⚙ Applying defaults...');
    await client.query(`
      ALTER TABLE thalis
      ALTER COLUMN daal SET DEFAULT FALSE,
      ALTER COLUMN rice SET DEFAULT FALSE,
      ALTER COLUMN salad SET DEFAULT FALSE,
      ALTER COLUMN sweet SET DEFAULT FALSE;
    `);

    await client.query('COMMIT');
    console.log('✅ Boolean migration success.');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

convertThaliColumnsToBoolean();
