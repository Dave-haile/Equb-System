import prisma from "../config/prisma.js";

export const addMember = async (req, res) => {
  try {
    const { equbId } = req.params;
    const { userId } = req.body;

    // check if equb exists
    const equb = await prisma.equb.findUnique({
      where: { id: Number(equbId) },
      include: { members: true },
    });

    if (!equb) {
      return res.status(404).json({ message: "Equb not found" });
    }

    // check if already full
    if (equb.members.length >= equb.totalMembers) {
      return res.status(400).json({ message: "Equb already full" });
    }

    // check if user already joined
    const existing = await prisma.equbMember.findFirst({
      where: {
        equbId: Number(equbId),
        userId,
      },
    });

    if (existing) {
      return res.status(400).json({ message: "User already in equb" });
    }

    // compute payout order as next available position
    const nextPayoutOrder = equb.members.length + 1;

    const member = await prisma.equbMember.create({
      data: {
        equbId: Number(equbId),
        userId: Number(userId),
        payoutOrder: nextPayoutOrder,
      },
    });

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
