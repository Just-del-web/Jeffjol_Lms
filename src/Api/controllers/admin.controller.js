import * as adminService from "../service/admin.service.js";
import { User } from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/helper.js";
import { Announcement } from "../models/announcement.model.js";

export const getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminStats();
    return res.status(200).json(successResponse(200, "System statistics fetched.", stats));
  } catch (error) {
    next(error);
  }
};


export const postAnnouncement = async (req, res, next) => {
  try {
    const { title, content, target, priority, expiresAt } = req.body;

    const announcement = await adminService.createAnnouncement(req.userId, {
      title,
      content,
      targetAudience: target, 
      priority,
      expiresAt: expiresAt ? new Date(Date.now() + expiresAt * 24 * 60 * 60 * 1000) : null
    });

    if (priority === 'emergency') {
      await adminService.broadcastEmail({
        subject: `URGENT: ${title}`,
        message: content,
        targetClass: 'all' 
      });
    }

    return res.status(201).json(
      successResponse(201, "Announcement dispatched across all channels.", announcement)
    );
  } catch (error) {
    next(error);
  }
};


export const getAnnouncements = async (req, res, next) => {
  try {
    const notices = await Announcement.find()
      .populate('author', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    return res.status(200).json(successResponse(200, "Notice history fetched.", notices));
  } catch (error) {
    next(error);
  }
};

export const addCourse = async (req, res, next) => {
  try {
    const course = await adminService.createCourse(req.body);
    return res.status(201).json(successResponse(201, "New course added to curriculum.", course));
  } catch (error) {
    next(error);
  }
};

export const triggerBroadcast = async (req, res, next) => {
  try {
    const { subject, message, targetClass } = req.body;

    if (!subject || !message) {
      return res.status(400).json(errorResponse(400, "Subject and message are required for broadcast."));
    }

    const result = await adminService.broadcastEmail({ subject, message, targetClass });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const linkStudentToParent = async (req, res, next) => {
  try {
    const { studentId, parentId } = req.body;

    const student = await User.findOneAndUpdate(
      { _id: studentId, role: 'student' },
      { parent: parentId },
      { new: true }
    );

    if (!student) return res.status(404).json(errorResponse(404, "Student not found."));

    return res.status(200).json(successResponse(200, "Parent linked to student successfully.", student));
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password') 
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return res.status(200).json(successResponse(200, "Users fetched.", {
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    }));
  } catch (error) {
    next(error);
  }
};