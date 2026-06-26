import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`🚀 RentNest API running on port ${env.port}`);
  console.log(`📄 API docs available at http://localhost:${env.port}/api-docs`);
});
