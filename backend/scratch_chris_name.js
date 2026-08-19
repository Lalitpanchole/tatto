import db from './config/db.js';

async function updateChrisName() {
  try {
    const [res] = await db.query('UPDATE users SET name = "Chris" WHERE LOWER(email) = "chris@tattooplatz.ch" OR id = 1');
    console.log('✅ Updated admin user name to Chris in MySQL DB:', res.affectedRows, 'rows updated');
    process.exit(0);
  } catch (err) {
    console.error('Error updating Chris name:', err);
    process.exit(1);
  }
}

updateChrisName();
