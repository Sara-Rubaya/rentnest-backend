import { Router } from "express";
import { RentalController } from "./rental.controller";
import { RentalValidation } from "./rental.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("TENANT"), validateRequest(RentalValidation.create), RentalController.create);
router.get("/", auth("TENANT"), RentalController.getMyRequests);
router.get("/:id", auth(), RentalController.getById);

export const RentalRoutes = router;
