import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  listEqubGroups,
  listMembersByGroup,
  listContributionsByGroup,
  listDrawsByGroup,
  createContribution,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/groups", authenticate, listEqubGroups);
router.get("/groups/:groupId/members", authenticate, listMembersByGroup);
router.get(
  "/groups/:groupId/contributions",
  authenticate,
  listContributionsByGroup,
);
router.get("/groups/:groupId/draws", authenticate, listDrawsByGroup);

router.post("/contributions", authenticate, createContribution);

export default router;
