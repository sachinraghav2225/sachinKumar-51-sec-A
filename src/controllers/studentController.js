const Student = require('../models/Student');
const User = require('../models/User');

// Fields each role is allowed to modify
const ADMIN_FIELDS = ['name', 'rollNumber', 'course', 'grade', 'phone', 'address', 'dateOfBirth'];
const STUDENT_FIELDS = ['name', 'phone', 'address', 'dateOfBirth']; // no course / grade / rollNumber

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

/* ---------------------------- ADMIN ONLY ---------------------------- */

// POST /api/students  -> creates login account + student record
exports.createStudent = async (req, res, next) => {
  let user;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const data = pick(req.body, ADMIN_FIELDS);

    user = await User.create({ name: data.name, email, password, role: 'student' });
    const student = await Student.create({ ...data, user: user._id });

    res.status(201).json({ message: 'Student created.', student });
  } catch (err) {
    if (user) await User.findByIdAndDelete(user._id); // rollback orphan account
    next(err);
  }
};

// GET /api/students?page=1&limit=10&search=john
exports.getAllStudents = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const filter = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { rollNumber: regex }, { course: regex }];
    }

    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('user', 'email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Student.countDocuments(filter),
    ]);

    res.json({ total, page, pages: Math.ceil(total / limit), students });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'email role');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res, next) => {
  try {
    const updates = pick(req.body, ADMIN_FIELDS);
    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Admin may also reset the student's password / change email
    if (req.body.password || req.body.email || updates.name) {
      const user = await User.findById(student.user).select('+password');
      if (user) {
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password;
        if (updates.name) user.name = updates.name;
        await user.save();
      }
    }

    res.json({ message: 'Student updated.', student });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await User.findByIdAndDelete(student.user);
    res.json({ message: 'Student deleted.' });
  } catch (err) {
    next(err);
  }
};

/* --------------------------- STUDENT (SELF) --------------------------- */

// GET /api/students/me
exports.getMyProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('user', 'email role');
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/me  (limited fields only)
exports.updateMyProfile = async (req, res, next) => {
  try {
    const updates = pick(req.body, STUDENT_FIELDS);
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: `Nothing to update. Allowed fields: ${STUDENT_FIELDS.join(', ')}` });
    }

    const student = await Student.findOneAndUpdate({ user: req.user._id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    if (updates.name) await User.findByIdAndUpdate(req.user._id, { name: updates.name });

    res.json({ message: 'Profile updated.', student });
  } catch (err) {
    next(err);
  }
};
