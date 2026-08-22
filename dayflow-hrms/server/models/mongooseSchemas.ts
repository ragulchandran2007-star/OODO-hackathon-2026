import mongoose, { Schema } from 'mongoose'

// TODO: Define your Mongoose schemas here

const EmployeeSchema = new Schema({
  // Add fields
}, { timestamps: true })

export const Employee = mongoose.model('Employee', EmployeeSchema)

// ---------------------------------------------------------------------------
// Auth: User schema (owned by Auth module — please don't edit outside Auth)
// ---------------------------------------------------------------------------
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee', required: true },
    // Optional link to an Employee record once that module exists/merges in
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
  },
  { timestamps: true }
)

export const User = mongoose.model('User', UserSchema)
