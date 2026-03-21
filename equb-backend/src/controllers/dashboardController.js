import prisma from "../config/prisma.js";

const mapEqubStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return "active";
    case "COMPLETED":
      return "completed";
    case "PENDING":
    case "CANCELLED":
    default:
      return "paused";
  }
};

const frequencyToIntervalDays = (frequency) => {
  const f = String(frequency || "").toLowerCase();
  if (f.includes("day")) return 1;
  if (f.includes("week")) return 7;
  if (f.includes("month")) return 30;
  const num = Number.parseInt(f, 10);
  if (Number.isFinite(num) && num > 0) return num;
  return 7;
};

const mapContributionStatus = (status) => {
  switch (status) {
    case "PAID":
      return "verified";
    case "LATE":
      return "rejected";
    case "PENDING":
    default:
      return "pending";
  }
};

const getEqubsForUser = async (userId) => {
  return prisma.equb.findMany({
    where: {
      OR: [{ creatorId: userId }, { members: { some: { userId } } }],
    },
    include: {
      members: true,
      rounds: {
        select: { roundNumber: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const computeCurrentRound = (equb) => {
  const maxRound = equb.rounds.reduce(
    (acc, r) => Math.max(acc, r.roundNumber || 0),
    0,
  );
  return Math.max(1, maxRound + 1);
};

const computeNextDrawDate = (equb, currentRound) => {
  const intervalDays = frequencyToIntervalDays(equb.frequency);
  const start = equb.startDate ? new Date(equb.startDate) : new Date();
  const next = new Date(start.getTime());
  next.setDate(start.getDate() + intervalDays * (currentRound - 1));
  return { next_draw_date: next.toISOString(), interval_days: intervalDays };
};

export const listEqubGroups = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const equbs = await getEqubsForUser(userId);

    const groups = equbs.map((e) => {
      const current_round = computeCurrentRound(e);
      const { next_draw_date, interval_days } = computeNextDrawDate(
        e,
        current_round,
      );

      return {
        id: String(e.id),
        name: e.name,
        status: mapEqubStatus(e.status),
        current_round,
        total_rounds: e.totalRounds,
        contribution_grams: Number(e.contributionGoldGram),
        contribution_karat: 24,
        next_draw_date,
        created_date: e.createdAt.toISOString(),
        members_count: e.members.filter((m) => m.isActive).length,
        interval_days,
      };
    });

    return res.json(groups);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load groups" });
  }
};

export const listMembersByGroup = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group" });

    const equb = await prisma.equb.findFirst({
      where: {
        id: groupId,
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!equb) return res.status(404).json({ message: "Group not found" });

    const members = await prisma.equbMember.findMany({
      where: { equbId: groupId },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        equb: {
          select: {
            rounds: { select: { roundNumber: true, receiverId: true } },
          },
        },
      },
      orderBy: { payoutOrder: "asc" },
    });

    const mapped = members.map((m) => {
      const winRound = m.equb.rounds.find((r) => r.receiverId === m.userId);

      return {
        id: String(m.id),
        full_name: m.user.name,
        group_id: String(m.equbId),
        has_won: Boolean(winRound),
        status: m.isActive ? "active" : "inactive",
        won_round: winRound ? winRound.roundNumber : undefined,
        phone_number: m.user.phone,
        email: m.user.email || undefined,
        joined_date: m.joinDate.toISOString(),
      };
    });

    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load members" });
  }
};

export const listContributionsByGroup = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group" });

    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const equb = await prisma.equb.findFirst({
      where: {
        id: groupId,
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    if (!equb) return res.status(404).json({ message: "Group not found" });

    const contributions = await prisma.contribution.findMany({
      where: { equbId: groupId },
      include: { round: { select: { roundNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const memberships = await prisma.equbMember.findMany({
      where: { equbId: groupId },
      select: { id: true, userId: true },
    });

    const memberIdByUserId = new Map(
      memberships.map((m) => [m.userId, String(m.id)]),
    );

    const mapped = contributions.map((c) => ({
      id: String(c.id),
      member_id: memberIdByUserId.get(c.userId) || String(c.userId),
      group_id: String(c.equbId),
      weight_grams: Number(c.goldGram),
      karat: 24,
      pure_gold_grams: Number(c.goldGram),
      status: mapContributionStatus(c.status),
      date_contributed: c.paymentDate ? c.paymentDate.toISOString() : undefined,
      created_date: c.createdAt.toISOString(),
      round_number: c.round.roundNumber,
    }));

    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load contributions" });
  }
};

export const listDrawsByGroup = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const groupId = Number(req.params.groupId);
    if (!groupId) return res.status(400).json({ message: "Invalid group" });

    const limit = Math.min(Number(req.query.limit) || 5, 50);

    const equb = await prisma.equb.findFirst({
      where: {
        id: groupId,
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true, contributionGoldGram: true, totalMembers: true },
    });

    if (!equb) return res.status(404).json({ message: "Group not found" });

    const rounds = await prisma.round.findMany({
      where: { equbId: groupId },
      include: { receiver: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const totalPool =
      Number(equb.contributionGoldGram) * Number(equb.totalMembers);

    const mapped = rounds.map((r) => ({
      id: String(r.id),
      group_id: String(r.equbId),
      round_number: r.roundNumber,
      winner_member_id: String(r.receiverId),
      winner_name: r.receiver.name,
      total_pool_grams: totalPool,
      draw_date: r.roundDate ? r.roundDate.toISOString() : undefined,
      created_date: r.createdAt.toISOString(),
    }));

    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load draws" });
  }
};

export const createContribution = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token" });

    const { member_id, group_id, round_number, weight_grams, date_contributed } =
      req.body || {};

    const equbId = Number(group_id);
    const roundNumber = Number(round_number);
    const memberId = Number(member_id);

    if (!equbId || !roundNumber || !memberId || !weight_grams) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const equb = await prisma.equb.findFirst({
      where: {
        id: equbId,
        OR: [{ creatorId: userId }, { members: { some: { userId } } }],
      },
      include: { members: true },
    });

    if (!equb) return res.status(404).json({ message: "Group not found" });

    const member = await prisma.equbMember.findFirst({
      where: { id: memberId, equbId },
      select: { userId: true },
    });

    if (!member) return res.status(404).json({ message: "Member not found" });

    const receiverMember = equb.members.find((m) => m.payoutOrder === roundNumber);
    const receiverId = receiverMember?.userId || equb.creatorId;

    const payoutGoldGram =
      Number(equb.contributionGoldGram) * Number(equb.totalMembers);

    const round = await prisma.round.upsert({
      where: { equbId_roundNumber: { equbId, roundNumber } },
      update: {},
      create: {
        equbId,
        roundNumber,
        receiverId,
        payoutGoldGram,
        roundDate: new Date(),
        status: "COLLECTING",
      },
      select: { id: true, roundNumber: true },
    });

    const created = await prisma.contribution.create({
      data: {
        equbId,
        roundId: round.id,
        userId: member.userId,
        goldGram: weight_grams,
        paymentDate: date_contributed ? new Date(date_contributed) : null,
        status: "PENDING",
      },
      include: { round: { select: { roundNumber: true } } },
    });

    return res.json({
      id: String(created.id),
      member_id: String(memberId),
      group_id: String(created.equbId),
      weight_grams: Number(created.goldGram),
      karat: 24,
      pure_gold_grams: Number(created.goldGram),
      status: "pending",
      date_contributed: created.paymentDate
        ? created.paymentDate.toISOString()
        : undefined,
      created_date: created.createdAt.toISOString(),
      round_number: created.round.roundNumber,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Contribution already exists" });
    }
    return res.status(500).json({ message: "Failed to create contribution" });
  }
};
