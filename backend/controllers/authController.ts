import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { SignupDTO, LoginDTO } from '../types/interfaces';
import { UserRole } from '../types/enums';

const generateToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
};

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new customer or freelancer account and returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, phone, role]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, freelancer]
 *               skills:
 *                 type: string
 *                 description: Optional; relevant for freelancers only
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       400:
 *         description: Validation error or duplicate email
 *       500:
 *         description: Server error
 */
export const signup = async (req: Request<{}, {}, SignupDTO>, res: Response) => {
  try {
    const { name, email, password, phone, role, skills } = req.body;

    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ success: false, message: "All fields (name, email, password, phone, role) are required" });
    }

    if (!Object.values(UserRole).includes(role as UserRole)) {
      return res.status(400).json({ success: false, message: "Role must be either 'customer' or 'freelancer'" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      skills: skills || null,
    });

    const token = generateToken(user._id as string, user.role);
    return res.status(201).json({ success: true, token, role: user.role, userId: user._id });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Validates credentials and role, then returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, role]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, freelancer]
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Invalid credentials or role mismatch
 *       500:
 *         description: Server error
 */
export const login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials or role mismatch" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials or role mismatch" });
    }

    if (user.role !== role) {
      return res.status(401).json({ success: false, message: "Invalid credentials or role mismatch" });
    }

    const token = generateToken(user._id as string, user.role);
    return res.status(200).json({ success: true, token, role: user.role, userId: user._id });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
