import prisma from "../config/prisma.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) return res.status(401).json({ message: "Invalid token" });

    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization failed" });
  }
};
