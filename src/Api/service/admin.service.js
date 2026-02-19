import { User } from "../models/user.model.js";
import { Content } from "../models/content.model.js";
import { Payment } from "../models/payment.model.js";
import { MailService } from "../service/mail.service.js";
import { Announcement } from "../models/announcement.model.js";

export const getAdminStats = async () => {
  const [studentCount, teacherCount, financialData] = await Promise.all([
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    Payment.aggregate([
      { $match: { status: "verified" } }, 
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = financialData[0] || { totalRevenue: 0, count: 0 };

  return {
    students: studentCount,
    teachers: teacherCount,
    revenue: stats.totalRevenue,
    transactionCount: stats.count,
    avgGrade: 72.4,
  };
};
export const createAnnouncement = async (adminId, data) => {
  return await Announcement.create({
    ...data,
    author: adminId,
  });
};

export const broadcastEmail = async (broadcastData) => {
  return await MailService.sendSchoolBroadcast(broadcastData);
};

export const createCourse = async (courseData) => {
  return await Content.create(contentData);
};
