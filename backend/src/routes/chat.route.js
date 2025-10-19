import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js'
import { getStreamToken } from '../controllers/chatController.js'

const router = express.Router()

// allow both GET and POST for token so frontend examples work with either method
router.get('/token', protectRoute, getStreamToken)
router.post('/token', protectRoute, getStreamToken)

export default router

