import { Router } from "express";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.use(auth("ADMIN"));

router.get("/users", AdminController.getAllUsers);
router.patch("/users/:id", validateRequest(AdminValidation.updateUserStatus), AdminController.updateUserStatus);
router.get("/properties", AdminController.getAllProperties);
router.get("/rentals", AdminController.getAllRentals);

export const AdminRoutes = router;
