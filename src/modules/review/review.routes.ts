import { Router } from "express";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/", auth("TENANT"), validateRequest(ReviewValidation.create), ReviewController.create);

export const ReviewRoutes = router;
