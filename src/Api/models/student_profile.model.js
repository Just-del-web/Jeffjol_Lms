import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  parents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  admissionNumber: { 
    type: String, 
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true 
  },

  familyCode: { 
    type: String, 
    index: true 
  },

  currentClass: { 
    type: String, 
    required: true, 
    enum: ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3'] 
  },
  classArm: { 
    type: String, 
    required: true, 
    uppercase: true,
    default: 'A' 
  },

  status: { 
    type: String, 
    enum: ['active', 'graduated', 'withdrawn', 'suspended'], 
    default: 'active' 
  },
  isClearedForExams: { 
    type: Boolean, 
    default: false 
  },
  house: { 
    type: String, 
    enum: ['Red', 'Blue', 'Yellow', 'Green'],
    required: false 
  },

  gender: { 
    type: String, 
    enum: ['Male', 'Female'], 
    required: true 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  genotype: { 
    type: String, 
    enum: ['AA', 'AS', 'SS', 'AC'] 
  },
  allergies: [{ type: String }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

studentProfileSchema.virtual('fullClassName').get(function() {
  return `${this.currentClass}${this.classArm}`;
});

studentProfileSchema.pre('save', async function () {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const prefix = "JHS"; 

    if (!this.admissionNumber) {
      const lastStudent = await mongoose.model('StudentProfile').findOne({
        admissionNumber: new RegExp(`^${prefix}/${year}/`)
      }).sort({ createdAt: -1 });

      let nextSequence = 1;

      if (lastStudent && lastStudent.admissionNumber) {
        const parts = lastStudent.admissionNumber.split('/');
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) {
          nextSequence = lastNumber + 1;
        }
      }

      const paddedSequence = String(nextSequence).padStart(3, '0');
      this.admissionNumber = `${prefix}/${year}/${paddedSequence}`;
    }

    if (!this.familyCode) {
      const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
      this.familyCode = `FAM-${randomString}`;
    }
  }
});

export default mongoose.model('StudentProfile', studentProfileSchema);