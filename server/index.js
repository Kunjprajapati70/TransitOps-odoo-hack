import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// DB Connection
connectDB()

// Routes (to be added)
app.get('/', (req, res) => {
  res.json({ message: 'TransitOps API running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
