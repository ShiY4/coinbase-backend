import app from "./app";
import { authMiddleware } from "./middlewares/auth";

const PORT = process.env.PORT || 3000;

app.get("/me", authMiddleware, (req: any, res) => {
  res.json({ userId: req.userId });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
