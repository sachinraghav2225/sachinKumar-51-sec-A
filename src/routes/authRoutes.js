const router = require('express').Router();
const { login, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.put('/change-password', protect, changePassword);

module.exports = router;
