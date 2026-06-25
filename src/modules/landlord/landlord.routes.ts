import { Router } from "express";
import { LandlordController } from "./landlord.controller";
import { PropertyValidation } from "../property/property.validation";
import { RentalValidation } from "../rental/rental.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.use(auth("LANDLORD"));

router.get("/properties", LandlordController.getMyProperties);
router.post("/properties", validateRequest(PropertyValidation.create), LandlordController.createProperty);
router.put("/properties/:id", validateRequest(PropertyValidation.update), LandlordController.updateProperty);
router.delete("/properties/:id", LandlordController.removeProperty);

router.get("/requests", LandlordController.getRequests);
router.patch("/requests/:id", validateRequest(RentalValidation.updateStatus), LandlordController.updateRequestStatus);

export const LandlordRoutes = router;
