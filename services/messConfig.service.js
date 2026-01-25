
import pool from '../config/db.config.js';
import { toIST } from '../utils/time.util.js';
export const getMessaLocation = async (body) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mess order by id desc`
    );
     const messLocations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      distance: parseFloat(row.distance),
      rating: parseFloat(row.ratings), 
      city: row.city,
      coordinates: {
        lat: parseFloat(row.latitude),
        lng: parseFloat(row.longitude)
      },
      image: row.image
    }));

    return messLocations;
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

export const saveMess = async (body) => {
  try {
    const {
      name,
      description,
      type,
      city,
      latitude,
      longitude,
      ownerId,
      address,
      image
    } = body;

    const result = await pool.query(
      `INSERT INTO mess (
        name,
        description,
        type,
        city,
        latitude,
        longitude,
        user_id,
        address,
        image,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        name,
        description,
        type,
        city,
        latitude,
        longitude,
        ownerId,
        address,
        image
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error(err.message);
    throw new Error('Error saving mess: ' + err.message);
  }
};


export const isMessExistForUser = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mess WHERE user_id = $1`,
      [userId]
    );
    console.log(result);
    return result.rows.length > 0;
  } catch (err) {
    throw new Error('Error checking if mess exists: ' + err.message);
  }
}

export const getMessData = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM mess WHERE user_id = $1`,
      [userId]
    );

    if (!result.rows.length) return null;

    const mess = result.rows[0];

    return {
      ...mess,
      created_at: mess.created_at ? toIST(mess.created_at) : null,
      updated_at: mess.updated_at ? toIST(mess.updated_at) : null
    };
  } catch (error) {
    console.error('Error fetching mess:', error.message);
    throw new Error('Error fetching mess data');
  }
};

export const updatemessProfile = async (
  userId,
  name,
  description,
  type,
  city,
  address,
  image
) => {
  try {
    const result = await pool.query(
      `UPDATE mess
       SET
         name = $1,
         description = $2,
         type = $3,
         city = $4,
         address = $5,
         image = $6,
         updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      [name, description, type, city, address, image, userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error updating mess:', error.message);
    throw new Error('Error updating mess data');
  }
};

