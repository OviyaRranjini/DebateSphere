const db = require('../config/db');

exports.cleanupOldDebates = async () => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Get expired debates
    const [oldDebates] = await db.query(
      `SELECT id FROM debates 
       WHERE CONCAT(event_date, ' ', event_time) < ?`,
      [now]
    );

    console.log('🧹 Expired Debate IDs:', oldDebates);

    const expiredIds = oldDebates.map(d => d.id);

    if (expiredIds.length === 0) {
      console.log('✅ No old debates to clean up.');
      return;
    }

    // Delete related registrations
    await db.query(`DELETE FROM registrations WHERE debate_id IN (?)`, [expiredIds]);

    // Delete debates
    await db.query(`DELETE FROM debates WHERE id IN (?)`, [expiredIds]);

    console.log(`✅ Cleaned up ${expiredIds.length} expired debate(s).`);

  } catch (err) {
    console.error('❌ Auto cleanup error:', err);
  }
};
