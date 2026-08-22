import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { User } from '../models/mongooseSchemas'
import { signToken, requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'employee',
    })

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role as 'admin' | 'employee' })

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ message: 'Something went wrong during registration' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role as 'admin' | 'employee' })

    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Something went wrong during login' })
  }
})

// GET /api/auth/me  (verifies token, returns current user)
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-passwordHash')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.json({ user })
  } catch (err) {
    console.error('Me error:', err)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default router
