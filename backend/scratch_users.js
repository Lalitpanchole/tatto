import db from './config/db.js';

async function checkUsers() {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, status FROM users');
    console.log('=== ALL USERS IN MYSQL DB ===');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying users:', err);
    process.exit(1);
  }
}

checkUsers();
