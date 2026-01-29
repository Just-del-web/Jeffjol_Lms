import mongoose from "mongoose";

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    studentId: { type: String, unique: true, index: true },

    currentClass: {
      type: String,
      enum: [
        "YEAR1",
        "YEAR2",
        "YEAR3",
        "YEAR4",
        "YEAR5",
        "JSS1",
        "JSS2",
        "JSS3",
        "SS1",
        "SS2",
        "SS3",
      ],
      required: true,
    },
    classArm: { type: String },

    academicYear: { type: String, required: true },
    term: {
      type: String,
      enum: ["First", "Second", "Third"],
      default: "First",
    },
    formTeacher: { type: String, default: "Assigning..." },

    isClearedForExams: { type: Boolean, default: false },

    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

StudentProfileSchema.pre("save", async function (next) {
  if (this.isNew && !this.studentId) {
    const year = new Date().getFullYear();
    const prefix = "SCH";

    const lastStudent = await mongoose
      .model("StudentProfile")
      .findOne(
        { studentId: new RegExp(`^${prefix}-${year}-`) },
        { studentId: 1 },
        { sort: { studentId: -1 } },
      )
      .lean();

    let nextNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      const parts = lastStudent.studentId.split("-");
      const lastNum = parseInt(parts[2]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    const paddedNumber = nextNumber.toString().padStart(4, "0");
    this.studentId = `${prefix}-${year}-${paddedNumber}`;
  }
  next();
});

const StudentProfile = mongoose.model("StudentProfile", StudentProfileSchema);
export default StudentProfile;
