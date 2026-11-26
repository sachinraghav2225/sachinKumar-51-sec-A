const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Link to the login account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    course: { type: String, required: true, trim: true },
    grade: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
