import { User } from '../models/user.model.js';
import { Course } from '../models/courses.model.js';
import { Payment } from '../models/payment.model.js';
import { Announcement } from '../models/announcement.model.js';

export const getAdminStats = async () => {
  const [studentCount, teacherCount, totalRevenue] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);

  return {
    students: studentCount,
    teachers: teacherCount,
    revenue: totalRevenue[0]?.total || 0
  };
};

export const createAnnouncement = async (adminId, data) => {
  return await Announcement.create({
    ...data,
    author: adminId
  });
};

export const createCourse = async (courseData) => {
  return await Course.create(courseData);
};