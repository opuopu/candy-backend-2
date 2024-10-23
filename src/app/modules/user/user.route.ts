import { Router } from "express";
import auth from "../../middleware/auth";
import fileUpload from "../../middleware/fileUpload";
import parseData from "../../middleware/parseData";
import { USER_ROLE } from "./user.constant";
import { userControllers } from "./user.controller";
const upload = fileUpload("./public/uploads/profile/");
const router = Router();
router.post(
  "/signup",
  upload.single("file"),
  parseData(),
  userControllers.insertuserIntoDb
);
router.patch(
  "/update/:id",
  auth(USER_ROLE.super_admin),
  upload.single("file"),
  parseData(),
  userControllers.updateUser
);
router.patch(
  "/",
  auth(USER_ROLE.super_admin, USER_ROLE.sub_admin),
  upload.single("file"),
  parseData(),
  userControllers.updateProfile
);
router.get(
  "/all",
  auth(USER_ROLE.super_admin, USER_ROLE.sub_admin),
  userControllers.getAllUsers
);
router.get(
  "/",
  auth(USER_ROLE.super_admin, USER_ROLE.sub_admin),
  userControllers.getme
);

router.get(
  "/:id",
  auth(USER_ROLE.super_admin, USER_ROLE.sub_admin),
  userControllers.getsingleUser
);
router.patch(
  "/update/:id",
  auth(USER_ROLE.super_admin),
  upload.single("file"),
  parseData(),
  userControllers.updateUser
);
router.patch(
  "/:id",
  auth(
    USER_ROLE.super_admin,
    USER_ROLE.sub_admin,
    USER_ROLE.candyGiver,
    USER_ROLE.user
  ),
  upload.single("file"),
  parseData(),
  userControllers.updateProfile
);
router.delete("/", auth(USER_ROLE.super_admin), userControllers.deleteAccount);
export const userRoutes = router;
