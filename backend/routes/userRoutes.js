import express from 'express';
const router = express.Router();
import { authUser, registerUser, logoutUser, getUserProfile, updateUserProfile, getUsers, deleteUser, getGroupUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';


router.post('/auth', authUser);
router.post(
  '/register',
  upload.single('avatar'), // 👈 MUST be before controller
  registerUser
);
router.post('/logout', logoutUser);
router.post('/delete', protect, deleteUser);
router.route('/profile')
    .get(protect, getUserProfile)
router.put(
    "/profile",
    protect,
    upload.single("avatar"),
    updateUserProfile
);
router.get('/', getUsers);
router.get('/group/:id', getGroupUsers)

export default router;