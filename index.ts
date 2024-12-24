import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import productRoute from "./src/routes/productRoutes";
import handleError from "./src/middleware/errorHandler";
import AppError from "./src/utils/AppError";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());

app.use("/api/products", productRoute);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(handleError);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`💻 Server running on port ${PORT} 💻`);
});

export default app;
