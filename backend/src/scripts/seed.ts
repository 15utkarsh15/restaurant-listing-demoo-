import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swiggy-web'
  await mongoose.connect(MONGODB_URI, { dbName: 'swiggy-web' })
  console.log('Connected to MongoDB for seeding')

  // resolve data file relative to project root (cwd) to avoid ESM/__dirname issues
  const file = path.join(process.cwd(), 'src', 'data', 'restaurants.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const docs = JSON.parse(raw) as any[]

  const col = mongoose.connection.db.collection('restaurants')
  for (const d of docs) {
    await col.updateOne({ id: d.id }, { $set: d }, { upsert: true })
    console.log('Upserted', d.id)
  }

  console.log('Seeding complete')
  await mongoose.disconnect()
}

seed().catch(err => { console.error(err); process.exit(1) })
