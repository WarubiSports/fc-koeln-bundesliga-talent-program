import express from 'express';
import authRoutes from './auth.routes.mjs';
import eventsRoutes from './events.routes.mjs';
import choresRoutes from './chores.routes.mjs';
import groceryRoutes from './grocery.routes.mjs';
import playersRoutes from './players.routes.mjs';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/chores', choresRoutes);
router.use('/grocery', groceryRoutes);
router.use('/players', playersRoutes);

router.get('/profile', (req, res, next) => {
  req.url = '/players/profile';
  playersRoutes(req, res, next);
});

router.put('/profile', (req, res, next) => {
  req.url = '/players/profile';
  playersRoutes(req, res, next);
});

router.use('/admin/chores', choresRoutes);
router.use('/admin/grocery', groceryRoutes);

export default router;
