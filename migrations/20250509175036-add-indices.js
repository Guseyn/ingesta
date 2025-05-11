module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db, client) {
    await db.collection('properties').createIndex({ id: 1 }, { unique: true });
    await db.collection('properties').createIndex({ name: 1 });
    await db.collection('properties').createIndex({ 'address.country': 1 });
    await db.collection('properties').createIndex({ 'address.city': 1 });
    await db.collection('properties').createIndex({ isAvailable: 1 });
    await db.collection('properties').createIndex({ priceForNight: 1 });

    await db.collection('cities').createIndex({ id: 1 }, { unique: true });
    await db.collection('cities').createIndex({ city: 1 });
    await db.collection('cities').createIndex({ availability: 1 });
    await db.collection('cities').createIndex({ priceSegment: 1 });
    await db.collection('cities').createIndex({ pricePerNight: 1 });
  },
};
