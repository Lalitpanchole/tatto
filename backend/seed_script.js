import db from './config/db.js';
import bcrypt from 'bcryptjs';

const seedDefaultUsers = async () => {
  try {
    const defaultArtists = [
      { name: 'Joao Otereze', email: 'artist@tattooplatz.ch', pass: 'artist123', phone: '+41 79 123 45 67', ig: '@artist_instagram' },
      { name: 'Marco V.', email: 'marco.v@gmail.com', pass: 'marco2026', phone: '+41 78 234 56 78', ig: '@marco_tats' },
      { name: 'Alina R.', email: 'alina.r@gmail.com', pass: 'alina2026', phone: '+41 77 345 67 89', ig: '@alina_ink' },
      { name: 'Jonas K.', email: 'jonas.k@tattooplatz.ch', pass: 'jonas2026', phone: '+41 76 456 78 90', ig: '@jonas_tattoos' },
      { name: 'Sofia M.', email: 'sofia.m@gmail.com', pass: 'sofia2026', phone: '+41 75 567 89 01', ig: '@sofia_tattoos' }
    ];

    for (const artist of defaultArtists) {
      const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [artist.email]);
      if (existing.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(artist.pass, salt);
        await db.query(
          'INSERT INTO users (name, email, password_hash, role, status, phone, instagram) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [artist.name, artist.email, passwordHash, 'artist', 'Active', artist.phone, artist.ig]
        );

        console.log(`✅ Seeded: ${artist.email}`);
      } else {
        console.log(`ℹ️ Already exists: ${artist.email}`);
      }
    }
    await db.query(
      'UPDATE users SET phone = ?, instagram = ? WHERE email = ?',
      ['+41 44 123 45 67', '@tattooplatz_zurich', 'chris@tattooplatz.ch']
    );
    console.log('✅ Admin Chris updated with phone & instagram');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
};

seedDefaultUsers();
