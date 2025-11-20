import { Router, Request, Response } from 'express';
import restaurantsData from '../data/restaurants.json';
import Restaurant from '../models/restaurant';
import mongoose from 'mongoose';

const router = Router();

// GET /api/restaurants?search=&cuisine=&minRating=
router.get('/', async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const cuisine = (req.query.cuisine as string) || '';
  const minRating = Number(req.query.minRating) || 0;

  const dataSource = mongoose.connection.readyState === 1 ? await Restaurant.find().lean() : (restaurantsData as any[])
  const filtered = (dataSource as any[]).filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchesCuisine = cuisine ? r.cuisine.toLowerCase() === cuisine.toLowerCase() : true;
    const matchesRating = r.rating >= minRating;
    return matchesSearch && matchesCuisine && matchesRating;
  });

  res.json(filtered);
});

// GET /api/restaurants/:id  -> returns single restaurant (with menu)
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (mongoose.connection.readyState === 1) {
    const found = await Restaurant.findOne({ id }).lean()
    if (!found) return res.status(404).json({ error: 'Not found' })
    return res.json(found)
  }
  const found = (restaurantsData as any[]).find(r => r.id === id)
  if (!found) return res.status(404).json({ error: 'Not found' })
  return res.json(found)
})

// In-memory favorites store
const favorites: string[] = []

// POST /api/restaurants/favorites  -> { id }
router.post('/favorites', async (req: Request, res: Response) => {
  const id = req.body && req.body.id
  if (!id) return res.status(400).json({ error: 'Missing id in body' })
  let exists = (restaurantsData as any[]).some(r => r.id === id)
  if (mongoose.connection.readyState === 1) {
    const doc = await Restaurant.findOne({ id }).lean()
    exists = !!doc
  }
  if (!exists) return res.status(404).json({ error: 'Restaurant not found' })
  if (!favorites.includes(id)) favorites.push(id)
  return res.json({ ok: true, favorites })
})

// GET favorites list
router.get('/favorites/list', async (req: Request, res: Response) => {
  if (mongoose.connection.readyState === 1) {
    const favs = await Restaurant.find({ id: { $in: favorites } }).lean()
    return res.json(favs)
  }
  const favs = (restaurantsData as any[]).filter(r => favorites.includes(r.id))
  return res.json(favs)
})

export default router;
