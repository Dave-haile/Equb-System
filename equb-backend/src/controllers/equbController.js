import prisma from "../config/prisma.js";

export const createEqub = async (req, res) => {
  try {
    const {
      name,
      description,
      totalMembers,
      contributionGoldGram,
      frequency,
      totalRounds,
      startDate,
    } = req.body;

    console.log(req.user);
    const equb = await prisma.equb.create({
      data: {
        name,
        description,
        contributionGoldGram,
        frequency,
        totalMembers,
        totalRounds,
        startDate: new Date(startDate),
        creatorId: req.user.userId,
      },
    });

    res.json(equb);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
