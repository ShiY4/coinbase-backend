import express from "express";
import userRoutes  from "@/routes/userRoutes";
import accessRoutes  from "@/routes/accessRoutes";

const app = express();

app.use(express.json());
app.use("/user", userRoutes);
app.use("/access", accessRoutes);

export default app;
