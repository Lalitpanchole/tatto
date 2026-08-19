import db from '../config/db.js';

// User Model for MySQL Operations
export const UserModel = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    return rows[0] || null;
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT id, name, email, role, phone, instagram, bio, status, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Create new artist user
  createArtist: async ({ name, email, passwordHash, phone, instagram, bio }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, instagram, bio, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'artist', phone || null, instagram || null, bio || null, 'Active']
    );
    return result.insertId;
  },

  // Update user profile by ID or email (supports updating email address)
  updateProfileByIdOrEmail: async (id, email, { name, newEmail, phone, instagram, bio }) => {
    const targetEmail = (newEmail && newEmail.trim() !== '') ? newEmail.trim().toLowerCase() : email.trim().toLowerCase();
    let result;
    if (id) {
      [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, phone = ?, instagram = ?, bio = ? WHERE id = ?',
        [name, targetEmail, phone || null, instagram || null, bio || null, id]
      );
    } else {
      [result] = await db.query(
        'UPDATE users SET name = ?, email = ?, phone = ?, instagram = ?, bio = ? WHERE LOWER(email) = LOWER(?)',
        [name, targetEmail, phone || null, instagram || null, bio || null, email]
      );
    }
    return result.affectedRows;
  },

  updateProfileByEmail: async (email, data) => {
    return UserModel.updateProfileByIdOrEmail(null, email, data);
  },

  // Create new admin user
  createAdmin: async ({ name, email, passwordHash, phone }) => {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'admin', phone || null, 'Active']
    );
    return result.insertId;
  },

  // Update user password by email
  updatePasswordByEmail: async (email, newPasswordHash) => {
    const [result] = await db.query(
      'UPDATE users SET password_hash = ? WHERE LOWER(email) = LOWER(?)',
      [newPasswordHash, email]
    );
    return result.affectedRows;
  },

  // Fetch all users (Admin view)
  getAllUsers: async () => {
    const [rows] = await db.query('SELECT id, name, email, role, phone, instagram, bio, status, created_at FROM users ORDER BY created_at DESC');
    return rows;
  },

  // Delete user by ID
  deleteById: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

export default UserModel;
