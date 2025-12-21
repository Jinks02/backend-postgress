import pool from './../config/db.config.js';
import { toIST } from '../utils/time.util.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

export const createIntents = async (orderData) => {
  const client = await pool.connect();
  
  try {
    const { messId, headCount, totalAmount, selectedItems, timestamp, userid } = orderData.body;

    await client.query('BEGIN');

    // Insert into orders table
    const intentInsertQuery = `
      INSERT INTO intents (mess_id, head_count, total_amount, order_time, user_id )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const intentResult = await client.query(intentInsertQuery, [messId, headCount, totalAmount, new Date(), userid ]);
    const intentId = intentResult.rows[0].id;

    // Insert order items
    const itemInsertQuery = `
      INSERT INTO order_items (order_id, item_name, quantity, price_per_unit)
      VALUES ($1, $2, $3, $4)
    `;

    for (const item of selectedItems) {
       const itemName = item.item.name;
       const quantity = item.quantity;
       const pricePerUnit = item.item.price;
      await client.query(itemInsertQuery, [intentId, itemName, quantity, pricePerUnit]);
    }

    await client.query('COMMIT');

    return { success: true, intentId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getIntentsByUserId = async (userId) => {
  try {
    // Fetch all orders along with mess name in one query
    const intentsResult = await pool.query(`
      SELECT o.id AS order_id, o.mess_id, m.name AS mess_name, o.head_count, o.total_amount, o.order_time
      FROM intents o
      JOIN mess m ON o.mess_id = m.id
      WHERE o.user_id = $1
      ORDER BY o.order_time DESC
    `, [userId]);

    const intents = intentsResult.rows;

    if (intents.length === 0) return [];

    // Fetch all items for all orders in one go
    const intentsIds = intents.map(order => order.order_id);

    const itemsResult = await pool.query(`
      SELECT order_id, item_name AS "itemName", quantity, price_per_unit AS "pricePerUnit"
      FROM order_items
      WHERE order_id = ANY($1)
    `, [intentsIds]);

    const itemsByIntents = {};
    for (const item of itemsResult.rows) {
      if (!itemsByIntents[item.order_id]) {
        itemsByIntents[item.order_id] = [];
      }
      itemsByIntents[item.order_id].push({
        itemName: item.itemName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit
      });
    }

    // Build final response
    const finalOrders = intents.map(intent => ({
      userId,
      messId: intent.mess_id,
      messName: intent.mess_name,
      headCount: intent.head_count,
      totalAmount: intent.total_amount,
      timestamp: toIST(intent.order_time),
      selectedItems: itemsByIntents[intent.order_id] || []
    }));

    return finalOrders;

  } catch (error) {
    console.error('Error fetching user Intents:', error);
    throw error;
  }
};

export const getIntentsByMessId = async (messId) => {
  try {
    // Fetch all orders for a specific mess along with user details
    const intentsResult = await pool.query(`
      SELECT o.id AS order_id, o.mess_id, o.user_id, u.name AS user_name, 
             o.head_count, o.total_amount, o.order_time
      FROM intents o
      JOIN users u ON o.user_id = u.id
      WHERE o.mess_id = $1
      ORDER BY o.order_time DESC
    `, [messId]);

    const intents = intentsResult.rows;
    if (intents.length === 0) return [];

    // Fetch all items for all orders in one go
    const intentsIds = intents.map(intent => intent.order_id);

    const itemsResult = await pool.query(`
      SELECT order_id, item_name AS "itemName", quantity, price_per_unit AS "pricePerUnit"
      FROM order_items
      WHERE order_id = ANY($1)
    `, [intentsIds]);

    const itemsByIntents = {};
    for (const item of itemsResult.rows) {
      if (!itemsByIntents[item.order_id]) {
        itemsByIntents[item.order_id] = [];
      }
      itemsByIntents[item.order_id].push({
        itemName: item.itemName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit
      });
    }

    // Build final response
    const finalIntents = intents.map(intent => ({
      orderId: intent.order_id,
      messId: intent.mess_id,
      userId: intent.user_id,
      userName: intent.user_name,
      headCount: intent.head_count,
      totalAmount: intent.total_amount,
      timestamp: toIST(intent.order_time),
      selectedItems: itemsByIntents[intent.order_id] || []
    }));

    return finalIntents;

  } catch (error) {
    console.error('Error fetching intents by mess ID:', error);
    throw error;
  }
};





