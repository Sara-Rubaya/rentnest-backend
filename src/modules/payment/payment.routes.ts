import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";
import validateRequest from "../../middlewares/validateRequest";
import { auth } from "../../middlewares/auth";

const router = Router();

router.post("/create", auth("TENANT"), validateRequest(PaymentValidation.createPayment), PaymentController.createPayment);
// Note: /confirm is mounted separately in app.ts with express.raw() for Stripe webhook signature verification
router.get("/verify/:sessionId", auth("TENANT"), PaymentController.verifySession);
router.get("/", auth("TENANT"), PaymentController.getMyPayments);
router.get("/:id", auth(), PaymentController.getById);

export const PaymentRoutes = router;
