import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import prisma from "./config/prisma.js";
import { authenticate } from "./middleware/authMiddleware.js";
import equbRoutes from "./routes/equbRoutes.js";
import equbMemberRoutes from "./routes/equbMemberRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ||
    "http://localhost:5173" ||
    "http://localhost:4000",
].filter(Boolean);

console.log(allowedOrigins);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.options(/.*/, cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Equb API Running" });
});
app.use("/api/auth", authRoutes);

app.use("/api/equbs", equbRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminUserRoutes);

app.get("/api/me", authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role === "ADMIN" ? "Admin" : "Member";

    return res.json({
      user: {
        id: String(user.id),
        name: user.name,
        phone: user.phone,
        role,
        created_at: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load user" });
  }
});

app.use("/api/equbs", equbMemberRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
