import express from "express";
import { createEqub } from "../controllers/equbController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, createEqub);

export default router;
