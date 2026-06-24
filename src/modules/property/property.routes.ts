import { Router } from "express";
import { PropertyController } from "./property.controller";
import { PropertyValidation } from "./property.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

// Public
router.get("/", PropertyController.getAll);
router.get("/:id", PropertyController.getById);

export const PropertyRoutes = router;
