import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../db.js';

async function createAdmin() {
  try {
    const email = 'max.bisinger@warubi-sports.com';
    const password = 'ITP2024';
    const firstName = 'Max';
    const lastName = 'Bisinger';
    const role = 'admin';
    const appId = 'fckoln';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate UUID
    const userId = crypto.randomUUID();

    // Check if user already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND app_id = $2',
      [email, appId]
    );

    if (existing.rows.length > 0) {
      console.log('❌ User already exists. Updating password...');
      
      // Update existing user
      await pool.query(
        `UPDATE users 
         SET password = $1, role = $2, first_name = $3, last_name = $4, 
             approved = 'true', status = 'active', updated_at = NOW()
         WHERE email = $5 AND app_id = $6`,
        [hashedPassword, role, firstName, lastName, email, appId]
      );
      
      console.log('✅ Admin user updated successfully!');
    } else {
      // Insert new user
      await pool.query(
        `INSERT INTO users (
          id, app_id, email, password, first_name, last_name, role,
          approved, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [userId, appId, email, hashedPassword, firstName, lastName, role, 'true', 'active']
      );
      
      console.log('✅ Admin user created successfully!');
    }

    console.log('');
    console.log('Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
