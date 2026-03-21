import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, phone, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    const normalizedRole = role ? String(role).toUpperCase() : "MEMBER";
    const allowedRoles = new Set(["ADMIN", "MEMBER"]);
    if (!allowedRoles.has(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: normalizedRole,
      },
    });

    const userRole = user.role === "ADMIN" ? "Admin" : "Member";
    const userForClient = {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      role: userRole,
      created_at: user.createdAt.toISOString(),
    };

    res.json({ message: "User registered successfully", user: userForClient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userRole = user.role === "ADMIN" ? "Admin" : "Member";
    const userForClient = {
      id: String(user.id),
      name: user.name,
      phone: user.phone,
      role: userRole,
      created_at: user.createdAt.toISOString(),
    };

    res.json({
      token,
      user: userForClient,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logout successful" });
};

