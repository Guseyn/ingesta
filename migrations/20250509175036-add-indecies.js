module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection('properties').createIndex({ id: 1 }, { unique: true });
    await db.collection('properties').createIndex({ name: 1 });
    await db.collection('cities').createIndex({ id: 1 }, { unique: true });
    await db.collection('cities').createIndex({ name: 1 });
  },
};
