import db from './config/db.js';

async function updateRamToDev() {
  try {
    const [res] = await db.query('UPDATE users SET email = "dev@gmail.com", name = "DEV" WHERE id = 27 OR LOWER(email) = "ram@gmail.com"');
    console.log('✅ Updated DB row 27 to dev@gmail.com:', res.affectedRows, 'rows updated');
    process.exit(0);
  } catch (err) {
    console.error('Error updating DB:', err);
    process.exit(1);
  }
}

updateRamToDev();
