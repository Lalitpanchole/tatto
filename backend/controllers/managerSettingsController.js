import db from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM manager_settings LIMIT 1');
    if (rows.length === 0) { return res.status(200).json(null); }
    const settings = rows[0];
    res.json({
      openingDays: typeof settings.opening_days === 'string' ? JSON.parse(settings.opening_days) : settings.opening_days,
      operatingHours: typeof settings.operating_hours === 'string' ? JSON.parse(settings.operating_hours) : settings.operating_hours,
      pricing: typeof settings.pricing === 'string' ? JSON.parse(settings.pricing) : settings.pricing
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Failed to fetch' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { openingDays, operatingHours, pricing } = req.body;
    const [rows] = await db.query('SELECT id FROM manager_settings LIMIT 1');
    if (rows.length === 0) {
      await db.query('INSERT INTO manager_settings (opening_days, operating_hours, pricing) VALUES (?, ?, ?)', [JSON.stringify(openingDays), JSON.stringify(operatingHours), JSON.stringify(pricing)]);
    } else {
      await db.query('UPDATE manager_settings SET opening_days = ?, operating_hours = ?, pricing = ? WHERE id = ?', [JSON.stringify(openingDays), JSON.stringify(operatingHours), JSON.stringify(pricing), rows[0].id]);
    }
    res.json({ message: 'Success' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Failed to update' });
  }
};
