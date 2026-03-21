import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/users", authenticate, requireAdmin, listUsers);
router.post("/users", authenticate, requireAdmin, createUser);
router.patch("/users/:id", authenticate, requireAdmin, updateUser);
router.delete("/users/:id", authenticate, requireAdmin, deleteUser);

export default router;
