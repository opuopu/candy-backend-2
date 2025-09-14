import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';

import { candyRoutes } from '../modules/candy/candy.route';
import { eventRoutes } from '../modules/events/events.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/candy',
    route: candyRoutes,
  },
  {
    path: '/events',
    route: eventRoutes,
  },
];
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
