import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  await sequelize.sync();

  app.listen(PORT);
} catch (error) {
  console.error(error);
  process.exit(1);
}