import db from './config/db.js';
async function run() {
  try {
    await db.query('CREATE TABLE IF NOT EXISTS manager_settings (id INT AUTO_INCREMENT PRIMARY KEY, opening_days JSON, operating_hours JSON, pricing JSON, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)');
    console.log('Table created!');
    process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
}
run();
