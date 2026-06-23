import { Router } from "express";
import { CategoryController } from "./category.controller";
import { CategoryValidation } from "./category.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.get("/", CategoryController.getAll);
router.post("/", auth("ADMIN"), validateRequest(CategoryValidation.create), CategoryController.create);

export const CategoryRoutes = router;
