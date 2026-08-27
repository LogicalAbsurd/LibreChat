const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LibreChat';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const agents = await db
    .collection('agents')
    .find(
      { name: { $in: [/anax/i, /omega/i] } },
      { projection: { name: 1, instructions: 1, _id: 0 } },
    )
    .toArray();

  for (const a of agents) {
    const file = path.join(__dirname, `${a.name.replace(/\s+/g, '_')}.txt`);
    fs.writeFileSync(file, a.instructions ?? '');
    console.log(`Wrote ${file} (${(a.instructions ?? '').length} chars)`);
  }

  await client.close();
})();
