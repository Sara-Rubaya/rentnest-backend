import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { openApiSpec } from "./docs/openapi";
import { PaymentController } from "./modules/payment/payment.controller";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";

const app: Application = express();

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

// Stripe webhook needs the RAW body (must be registered BEFORE express.json())
app.post("/api/payments/confirm", express.raw({ type: "application/json" }), PaymentController.confirmPayment);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, message: "RentNest API is running", data: { docs: "/api-docs" } });
});

// Serve the raw OpenAPI spec as JSON
app.get("/api-docs/openapi.json", (req: Request, res: Response) => {
  res.json(openApiSpec);
});

// Swagger UI loaded from a CDN (avoids serving swagger-ui-express's local static
// assets, which Vercel's serverless functions can't reliably serve)
app.get("/api-docs", (req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html>
  <head>
    <title>RentNest API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/api-docs/openapi.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        });
      };
    </script>
  </body>
</html>`);
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;