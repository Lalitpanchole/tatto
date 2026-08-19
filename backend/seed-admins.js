/**
 * seed-admins.js
 * Run this script ONCE to create all studio admin accounts in the MySQL database.
 * 
 * Usage: node seed-admins.js
 */

import bcrypt from 'bcryptjs';
import db from './config/db.js';

// All studio admin team members
const adminTeam = [
  { name: 'Chris (Co-Founder)', email: 'chris@tattooplatz.ch' },
  { name: 'Bea',                email: 'bea@tattooplatz.ch'   },
  { name: 'Lucy',               email: 'lucy@tattooplatz.ch'  },
  { name: 'Tuli',               email: 'tuli@tattooplatz.ch'  },
  { name: 'Dani',               email: 'dani@tattooplatz.ch'  },
  { name: 'Leonie',             email: 'leonie@tattooplatz.ch'},
];

// Default password all new admins will use on first login
const DEFAULT_PASSWORD = 'TattoPlatz@2026';

async function seedAdmins() {
  console.log('\n🚀 Tattooplatz — Admin Team Seeder\n');
  console.log(`Default password for new admins: ${DEFAULT_PASSWORD}\n`);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  for (const admin of adminTeam) {
    try {
      // Check if user already exists
      const [existing] = await db.query(
        'SELECT id, role FROM users WHERE LOWER(email) = LOWER(?)',
        [admin.email]
      );

      if (existing.length > 0) {
        const user = existing[0];
        if (user.role !== 'admin') {
          // Exists but is not admin — upgrade role
          await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
          console.log(`✅ UPGRADED to admin: ${admin.email}`);
        } else {
          console.log(`⏭️  Already admin:   ${admin.email}`);
        }
      } else {
        // Create new admin account
        await db.query(
          'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
          [admin.name, admin.email, passwordHash, 'admin', 'Active']
        );
        console.log(`✅ CREATED admin:   ${admin.email}`);
      }
    } catch (err) {
      console.error(`❌ ERROR for ${admin.email}: ${err.message}`);
    }
  }

  console.log('\n✅ Seeding complete! All admin accounts are ready.\n');
  console.log('📌 Login credentials:');
  console.log('   Emails:   bea@tattooplatz.ch, lucy@tattooplatz.ch, tuli@tattooplatz.ch, dani@tattooplatz.ch, leonie@tattooplatz.ch');
  console.log(`   Password: ${DEFAULT_PASSWORD}`);
  console.log('\n💡 Tip: After first login, each admin can change their password (Step 2 — coming soon)\n');

  await db.end();
  process.exit(0);
}

seedAdmins().catch((err) => {
  console.error('Fatal seeder error:', err);
  process.exit(1);
});
