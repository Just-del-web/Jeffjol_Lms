import mongoose from 'mongoose';


const StudentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  studentId: { type: String, unique: true }, 
  
  currentClass: { 
    type: String, 
    enum: ['YEAR1', 'YEAR2', 'YEAR3', 'YEAR4', 'YEAR5','JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'], 
    required: true 
  },
  classArm: { type: String, required: true },
  academicYear: { type: String, required: true },
  term: { type: String, enum: ['First', 'Second', 'Third'], default: 'First' },
  formTeacher: { type: String, default: "Assigning..." },
  isClearedForExams: { type: Boolean, default: false },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }
}, { timestamps: true });

StudentProfileSchema.pre('save', async function (next) {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const prefix = "SCH"; 
    const lastStudent = await mongoose.model('StudentProfile').findOne(
      { studentId: new RegExp(`^${prefix}-${year}-`) },
      {},
      { sort: { 'createdAt': -1 } }
    );

    let nextNumber = 1;
    if (lastStudent && lastStudent.studentId) {
      const parts = lastStudent.studentId.split('-');
      nextNumber = parseInt(parts[2]) + 1;
    }

    const paddedNumber = nextNumber.toString().padStart(4, '0');
    this.studentId = `${prefix}-${year}-${paddedNumber}`;
  }
  next();
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);