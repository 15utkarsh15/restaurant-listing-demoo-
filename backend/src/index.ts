import express from 'express';
import cors from 'cors';
import restaurantsRouter from './routes/restaurants';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swiggy-web';

app.use(cors());
app.use(express.json());

app.use('/api/restaurants', restaurantsRouter);

app.get('/', (req, res) => res.send({ status: 'ok' }));

async function start() {
  if (process.env.MONGODB_URI !== 'DISABLE') {
    try {
      await mongoose.connect(MONGODB_URI, { dbName: 'swiggy-web' })
      console.log('Connected to MongoDB')
    } catch (err) {
      console.warn('Could not connect to MongoDB, continuing with in-memory JSON. Error:', err && (err as any).message)
    }
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

start()

/*
Optional MongoDB wiring (not enabled by default):
- Install mongoose and @types/mongoose
- Replace the in-memory route with a Mongoose model and connect using process.env.MONGODB_URI
*/
