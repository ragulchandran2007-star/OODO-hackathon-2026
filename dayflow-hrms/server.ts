import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './server/db'
import router from './server/routes'
import authRouter from './server/routes/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRouter) // Auth module — mounted separately to avoid merge conflicts in routes.ts
app.use('/api', router)

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
