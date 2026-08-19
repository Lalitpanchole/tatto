import db from '../config/db.js';

export const InquiryModel = {
  create: async ({ name, email, message, submittedDate }) => {
    const [result] = await db.query(
      'INSERT INTO inquiries (name, email, message, submitted_date) VALUES (?, ?, ?, ?)',
      [name || 'Newsletter Subscriber', email, message, submittedDate]
    );
    return result.insertId;
  },

  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    return rows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM inquiries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default InquiryModel;
