import mongoose, { Schema } from 'mongoose'

// TODO: Define your Mongoose schemas here

const EmployeeSchema = new Schema({
  // Add fields
}, { timestamps: true })

export const Employee = mongoose.model('Employee', EmployeeSchema)
