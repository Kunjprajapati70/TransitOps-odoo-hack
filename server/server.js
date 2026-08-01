import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import vehicleRoutes from './routes/vehicleRoutes.js'
import driverRoutes from './routes/driverRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import maintenanceRoutes from './routes/maintenanceRoutes.js'
import fuelRoutes from './routes/fuelRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/drivers', driverRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api/fuel', fuelRoutes)
app.use('/api/expenses', expenseRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
