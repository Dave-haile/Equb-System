import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

const mapRoleForClient = (role) => (role === "ADMIN" ? "Admin" : "Member");

const normalizeRole = (role) => {
  const normalized = role ? String(role).toUpperCase() : "MEMBER";
  if (normalized !== "ADMIN" && normalized !== "MEMBER") return null;
  return normalized;
};

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(
      users.map((u) => ({
        id: String(u.id),
        name: u.name,
        phone: u.phone,
        role: mapRoleForClient(u.role),
        created_at: u.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    return res.status(500).json({ message: "Failed to load users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body || {};

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "name, phone and password are required" });
    }

    const prismaRole = normalizeRole(role);
    if (!prismaRole) return res.status(400).json({ message: "Invalid role" });

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: prismaRole,
      },
      select: { id: true, name: true, phone: true, role: true, createdAt: true },
    });

    return res.json({
      user: {
        id: String(user.id),
        name: user.name,
        phone: user.phone,
        role: mapRoleForClient(user.role),
        created_at: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid user id" });

    const { name, phone, password, role } = req.body || {};

    const data = {};

    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;

    if (role !== undefined) {
      const prismaRole = normalizeRole(role);
      if (!prismaRole) return res.status(400).json({ message: "Invalid role" });
      data.role = prismaRole;
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, phone: true, role: true, createdAt: true },
    });

    return res.json({
      user: {
        id: String(user.id),
        name: user.name,
        phone: user.phone,
        role: mapRoleForClient(user.role),
        created_at: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return res.status(409).json({ message: "Phone already exists" });
    }
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid user id" });

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "User deleted" });
  } catch (error) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
