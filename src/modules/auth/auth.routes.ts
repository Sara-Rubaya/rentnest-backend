import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/register", validateRequest(AuthValidation.register), AuthController.register);
router.post("/login", validateRequest(AuthValidation.login), AuthController.login);
router.get("/me", auth(), AuthController.getMe);

export const AuthRoutes = router;
