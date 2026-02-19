import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    studentId: {
      type: String,
      unique: true,
      sparse: true, 
      default: () => `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    },

    admissionNumber: {
      type: String,
      unique: true,
      sparse: true, 
      index: true
    },

    familyCode: {
      type: String,
      index: true,
    },

    currentClass: {
      type: String,
      required: true,
      enum: [
        "Playgroup", "Pre-Nursery", "Nursery 1", "Nursery 2", "Reception",
        "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
        "JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"
      ],
    },
    classArm: {
      type: String,
      required: true,
      uppercase: true,
      default: "A",
    },

    status: {
      type: String,
      enum: ["active", "graduated", "withdrawn", "suspended"],
      default: "active",
    },
    isClearedForExams: {
      type: Boolean,
      default: false, 
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    genotype: {
      type: String,
      enum: ["AA", "AS", "SS", "AC"],
    },
    allergies: [{ type: String }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentProfileSchema.virtual("fullClassName").get(function () {
  return `${this.currentClass}${this.classArm}`;
});

studentProfileSchema.pre("save", async function () {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const prefix = "JMS"; 

    if (!this.admissionNumber) {
      try {
        const lastStudent = await mongoose.model("StudentProfile")
          .findOne({ admissionNumber: new RegExp(`^${prefix}/${year}/`) })
          .sort({ createdAt: -1 });

        let nextSequence = 1;
        if (lastStudent && lastStudent.admissionNumber) {
          const parts = lastStudent.admissionNumber.split("/");
          const lastNumber = parseInt(parts[2], 10);
          if (!isNaN(lastNumber)) nextSequence = lastNumber + 1;
        }

        const paddedSequence = String(nextSequence).padStart(3, "0");
        this.admissionNumber = `${prefix}/${year}/${paddedSequence}`;
      } catch (err) {
        return next(err);
      }
    }

    if (!this.familyCode) {
      this.familyCode = `FAM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
  }
});

export default mongoose.models.StudentProfile || mongoose.model("StudentProfile", studentProfileSchema);