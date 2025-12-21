import pool from './../config/db.config.js'
import { nowIST, toIST, istStartOfDay } from '../utils/time.util.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

export const addThali = async (thaliData, userId) => {
  const client = await pool.connect();
  let messID = await getMessIdByUserId(userId);

  try {
    const {
      thali_name,
      type,
      published,
      editable,
      available_from,
      available_until,
      rotis,
      sabzi,
      daal,
      daal_replacement,
      rice,
      salad,
      sweet,
      sweet_info,
      other_items,
      price,
      image
    } = thaliData;

    await client.query('BEGIN');

    const available_date = dayjs()
      .tz('Asia/Kolkata')
      .format('YYYY-MM-DD');

    const afIST = `${available_date} ${available_from}`; // "2025-12-14 12:00"
    const auIST = `${available_date} ${available_until}`;

    const afUTC = dayjs
      .tz(afIST, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata')
      .utc()
      .toDate();

    const auUTC = dayjs
      .tz(auIST, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata')
      .utc()
      .toDate();

    // console.log('available_from:', available_from);
    // console.log('afIST string:', afIST);


    const insertQuery = `
      INSERT INTO thalis (
        mess_id, thali_name, type, published, editable, available_from,
        available_until, rotis, sabzi, daal, daal_replacement,
        rice, salad, sweet, sweet_info, other_items, price, image, available_date
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      messID,
      thali_name,
      type,
      published || false,
      editable || true,
      afUTC,
      auUTC,
      rotis,
      sabzi,
      Boolean(daal),
      daal_replacement,
      Boolean(rice),
      Boolean(salad),
      Boolean(sweet),
      sweet_info,
      other_items,
      price,
      image,
      available_date
    ]);

    await client.query('COMMIT');

    return { success: true, thaliId: result.rows[0].id };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const getMessIdByUserId = async (userId) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id FROM mess WHERE user_id = $1', [userId]);

    return result.rows[0].id;
  }
  catch (error) {
    console.error('Error fetching mess id by user id:', error);
    throw error;
  }
  finally {
    client.release();
  }
}

export const updateThali = async (thaliId, thaliData) => {
  const client = await pool.connect();

  try {
    const {
      thali_name,
      published,
      editable,
      available_from,
      available_until,
      rotis,
      sabzi,
      daal,
      daal_replacement,
      rice,
      salad,
      sweet,
      sweet_info,
      other_items,
      price,
      image
    } = thaliData;

    await client.query('BEGIN');
    const afUTC = dayjs.tz(available_from, 'Asia/Kolkata').utc().toDate();
    const auUTC = dayjs.tz(available_until, 'Asia/Kolkata').utc().toDate();

    const updateQuery = `
      UPDATE thalis 
      SET 
        thali_name = $1,
        published = $2,
        editable = $3,
        available_from = $4,
        available_until = $5,
        rotis = $6,
        sabzi = $7,
        daal = $8,
        daal_replacement = $9,
        rice = $10,
        salad = $11,
        sweet = $12,
        sweet_info = $13,
        other_items = $14,
        price = $15,
        image = $16,
        updated_at = NOW()
      WHERE id = $17 AND is_deleted = false
      RETURNING id
    `;

    const result = await client.query(updateQuery, [
      thali_name,
      published,
      editable,
      afUTC,
      auUTC,
      rotis,
      sabzi,
      Boolean(daal),
      daal_replacement,
      Boolean(rice),
      Boolean(salad),
      Boolean(sweet),
      sweet_info,
      other_items,
      price,
      image,
      thaliId
    ]);

    if (result.rows.length === 0) {
      throw new Error('Thali not found or already deleted');
    }

    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};


export const deleteThali = async (thaliId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Soft delete - set is_deleted to true
    const deleteQuery = `
      UPDATE thalis 
      SET is_deleted = true, updated_at = NOW() 
      WHERE id = $1 AND is_deleted = false
      RETURNING id
    `;

    const result = await client.query(deleteQuery, [thaliId]);

    if (result.rows.length === 0) {
      throw new Error('Thali not found or already deleted');
    }

    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getThalis = async (messId, type) => {
  // debugger;
  try {
    let query = `
  SELECT 
    t.id,
    t.mess_id,
    t.thali_name,
    t.type,
    t.published,
    t.editable,
    t.is_deleted,
    t.available_from,
    t.available_until,
    t.rotis,
    t.sabzi,
    t.daal,
    t.daal_replacement,
    t.rice,
    t.salad,
    t.sweet,
    t.sweet_info,
    t.other_items,
    t.price,
    t.image,
    t.created_at,
    t.updated_at,
    to_char(t.available_date, 'YYYY-MM-DD') as available_date, -- ✅ normalized
    m.name as mess_name,
    m.city as mess_city,
    m.address as mess_address
  FROM thalis t
  JOIN mess m ON t.mess_id = m.id
  WHERE t.is_deleted = false
`;




    let params = [];
    let paramCount = 0;

    if (messId) {
      paramCount++;
      query += ` AND t.mess_id = $${paramCount}`;
      params.push(messId);
    }

    if (type) {
      paramCount++;
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    // No date filtering on backend - we do it all client-side
    query += ' ORDER BY t.available_date DESC, t.type';

    const result = await pool.query(query, params);

    return result.rows.map(thali => ({
      ...thali,
      // available_from: thali.available_from,
      // available_until: thali.available_until,
      available_from: toIST(thali.available_from),
      available_until: toIST(thali.available_until),
      created_at: toIST(thali.created_at),
      updated_at: toIST(thali.updated_at)
    }));

  } catch (error) {
    console.error('Error fetching thalis:', error);
    throw error;
  }
};

// export function getTodayDate() {
//   const today = new Date();
//   const yyyy = today.getFullYear();
//   const mm = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
//   const dd = String(today.getDate()).padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// }

export function getTodayISTDate() {
  return dayjs()
    .tz('Asia/Kolkata')
    .format('YYYY-MM-DD');
}

export const getMessSpecificThali = async (messId, type) => {
  try {
    //  const result = await pool.query("SELECT * FROM thalis WHERE mess_id = $1 AND available_date = (NOW() AT TIME ZONE 'Asia/Kolkata');", [messId]);
    const today = getTodayISTDate();
    const result = await pool.query(
      "SELECT * FROM thalis WHERE mess_id = $1 AND available_date = $2 AND published = $3",
      [messId, today, true]
    );
    const thalis = result.rows.map(mapThaliToFrontend);

    return thalis;

  } catch (error) {
    console.error('Error fetching thalis:', error);
    throw error;
  }
};
function mapThaliToFrontend(thali) {
  const items = [];

  if (thali.rotis) items.push(`${thali.rotis} rotis`);
  if (thali.sabzi) items.push(`sabzi: ${thali.sabzi}`);
  if (thali.daal === "true") items.push("daal");
  if (thali.rice === "true") items.push("rice");
  if (thali.salad === "true") items.push("salad");
  if (thali.sweet === "true") {
    items.push(`sweet: ${thali.sweet_info || "included"}`);
  }
  if (thali.other_items) items.push(`other items: ${thali.other_items}`);

  return {
    id: thali.id,
    name: thali.thali_name,
    description: `Includes ${items.join(", ")}.`,
    price: parseFloat(thali.price),
    imageUrl: thali.image,
    isVegetarian: true, // hardcoded for now
    spicyLevel: 2       // hardcoded
  };
}

export const publishThali = async (thaliId, published) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateQuery = `
      UPDATE thalis 
      SET published = $1, updated_at = NOW()
      WHERE id = $2 AND is_deleted = false
      RETURNING id
    `;

    const result = await client.query(updateQuery, [published, thaliId]);

    if (result.rows.length === 0) {
      throw new Error('Thali not found or already deleted');
    }

    await client.query('COMMIT');

    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};