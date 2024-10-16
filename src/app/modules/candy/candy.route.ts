import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { candyControllers } from "./candy.controller";
import { candyValidaiton } from "./candy.validation";

const router = Router();

router.post(
  "/",
  auth(USER_ROLE.candyGiver),
  validateRequest(candyValidaiton.candySchema),
  candyControllers.insertCandyAddressIntoDb
);
router.get("/", candyControllers.getAllCandyAddress);
router.get(
  "/myaddress",
  auth(USER_ROLE.candyGiver),
  candyControllers.getMyCandyAddress
);
router.patch(
  "/:id",
  auth(USER_ROLE.candyGiver),
  candyControllers.updateCandyAddress
);
router.patch(
  "/delete/:id",
  auth(USER_ROLE.candyGiver),
  candyControllers.deleteCandyAddress
);

export const candyRoutes = router;
