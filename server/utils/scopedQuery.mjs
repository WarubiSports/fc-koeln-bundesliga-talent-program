import { pool } from '../db.cjs';

export class TenantScopedQuery {
  constructor(appId) {
    if (!appId) {
      throw new Error('TenantScopedQuery requires appId');
    }
    this.appId = appId;
  }

  async select(table, conditions = {}, options = {}) {
    const { columns = '*', orderBy, limit, offset } = options;
    
    const whereClause = ['app_id = $1'];
    const params = [this.appId];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        whereClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    let query = `SELECT ${columns} FROM ${table} WHERE ${whereClause.join(' AND ')}`;
    
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (limit) query += ` LIMIT ${limit}`;
    if (offset) query += ` OFFSET ${offset}`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async selectOne(table, conditions = {}, options = {}) {
    const rows = await this.select(table, conditions, { ...options, limit: 1 });
    return rows[0] || null;
  }

  async insert(table, data) {
    const dataWithAppId = { ...data, app_id: this.appId };
    const columns = Object.keys(dataWithAppId);
    const values = Object.values(dataWithAppId);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(table, id, data, idColumn = 'id') {
    const setClauses = [];
    const params = [this.appId, id];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'app_id' && key !== idColumn) {
        setClauses.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE app_id = $1 AND ${idColumn} = $2 RETURNING *`;
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  async delete(table, id, idColumn = 'id') {
    const query = `DELETE FROM ${table} WHERE app_id = $1 AND ${idColumn} = $2 RETURNING *`;
    const result = await pool.query(query, [this.appId, id]);
    return result.rows[0] || null;
  }

  async deleteWhere(table, conditions = {}) {
    const whereClause = ['app_id = $1'];
    const params = [this.appId];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        whereClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    const query = `DELETE FROM ${table} WHERE ${whereClause.join(' AND ')} RETURNING *`;
    const result = await pool.query(query, params);
    return result.rows;
  }

  async count(table, conditions = {}) {
    const whereClause = ['app_id = $1'];
    const params = [this.appId];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        whereClause.push(`${key} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    }

    const query = `SELECT COUNT(*) as count FROM ${table} WHERE ${whereClause.join(' AND ')}`;
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  async rawQuery(query, params = []) {
    if (!query.toLowerCase().includes('app_id')) {
      console.warn('[ScopedQuery] Warning: Raw query may not include app_id filter');
    }
    return pool.query(query, params);
  }
}

export function createScopedQuery(req) {
  if (!req.appCtx?.id) {
    throw new Error('Request missing appCtx - ensure attachAppContext middleware is applied');
  }
  return new TenantScopedQuery(req.appCtx.id);
}

export function scopedQuery(appId) {
  return new TenantScopedQuery(appId);
}
