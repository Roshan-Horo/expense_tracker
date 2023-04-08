import express from 'express'
import { addExpenses, createUserAccount, getUserAccount} from '../controllers/userAccountController';
import { protect } from '../middlewares/authMiddleware'

const router = express.Router();

/**
 * METHOD - POST
 * PATH - /useraccount
 * ACCESS - public
 * desc - create user with name, email, phone
 */
router.post('/', protect, createUserAccount);

/**
 * METHOD - GET
 * PATH - /useraccount
 * ACCESS - protected
 * desc - get register user using id
 */
router.get('/', protect,  getUserAccount);

/**
 * METHOD - PUT
 * PATH - /useraccount
 * ACCESS - protected
 * desc - get register user using id
 */
router.put('/', protect,  addExpenses);

export default router