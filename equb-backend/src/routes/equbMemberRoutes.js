import express from "express";
import { addMember } from "../controllers/equbMemberController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:equbId/members", authenticate, addMember);

export default router;
