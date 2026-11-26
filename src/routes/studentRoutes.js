const router = require('express').Router();
const c = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Every route below requires a valid token
router.use(protect);

// Student: own profile  (must be declared BEFORE '/:id')
router.get('/me', authorize('student'), c.getMyProfile);
router.put('/me', authorize('student'), c.updateMyProfile);

// Admin: full CRUD
router.route('/').get(authorize('admin'), c.getAllStudents).post(authorize('admin'), c.createStudent);

router
  .route('/:id')
  .get(authorize('admin'), c.getStudentById)
  .put(authorize('admin'), c.updateStudent)
  .delete(authorize('admin'), c.deleteStudent);

module.exports = router;
