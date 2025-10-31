import bcrypt from 'bcrypt';
import { pool } from '../db.js';

async function testPassword() {
  try {
    const email = 'max.bisinger@warubi-sports.com';
    const password = 'ITP2024';
    const appId = 'fckoln';

    // Get user from database
    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1 AND app_id = $2',
      [email, appId]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.email);
    console.log('Password hash length:', user.password.length);
    console.log('Hash starts with:', user.password.substring(0, 10));

    // Test password comparison
    const match = await bcrypt.compare(password, user.password);
    console.log('');
    console.log('Password to test:', password);
    console.log('Bcrypt compare result:', match);

    if (match) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does NOT match!');
      
      // Try creating a new hash to verify bcrypt is working
      console.log('');
      console.log('Testing bcrypt functionality...');
      const testHash = await bcrypt.hash(password, 10);
      const testMatch = await bcrypt.compare(password, testHash);
      console.log('Test hash created successfully');
      console.log('Test comparison result:', testMatch);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPassword();
