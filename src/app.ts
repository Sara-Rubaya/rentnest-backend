import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { openApiSpec } from "./docs/openapi";
import { PaymentController } from "./modules/payment/payment.controller";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Stripe webhook needs the RAW body (must be registered BEFORE express.json())
app.post("/api/payments/confirm", express.raw({ type: "application/json" }), PaymentController.confirmPayment);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "RentNest API is running", data: { docs: "/api-docs" } });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
