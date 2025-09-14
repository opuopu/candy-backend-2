import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import eventControllers from './events.controller';
import eventValidationSchema from './events.validation';

const router = Router();
router.post(
  '/',
  auth(USER_ROLE.user, USER_ROLE.candyGiver),
  validateRequest(eventValidationSchema.insertEventSchema),
  eventControllers.insertEventIntoDb
);
router.get(
  '/',

  eventControllers.getAllEvents
);
router.get('/:id', eventControllers.getSingleEvent);
router.patch(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.candyGiver),
  validateRequest(eventValidationSchema.insertEventSchema),
  eventControllers.updateEvent
);
router.delete(
  '/:id',
  auth(USER_ROLE.user, USER_ROLE.candyGiver),
  eventControllers.deleteEvent
);
export const candyRoutes = router;
