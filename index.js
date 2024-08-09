import express from "express";
import cors from "cors";

import { router as rootRouter } from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", rootRouter);

app.listen(3000, () => {
  console.log("Server running at 3000");
});
