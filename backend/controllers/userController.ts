import { Request, Response } from 'express';
import User from '../models/User';
import { UserRole } from '../types/enums';

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, phone, skills } = req.body;
    const user = await User.findById(req.user!.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Strict role-based filtering for skills
    if (skills !== undefined) {
      if (user.role === UserRole.FREELANCER) {
        user.skills = skills;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Only freelancers can update their skills' 
        });
      }
    }

    await user.save();
    
    // Return updated user without password
    const { password, ...updatedUser } = user.toObject();

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
