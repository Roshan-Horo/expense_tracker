import { config } from '../config/config'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const generateToken = (id: mongoose.Types.ObjectId) => {
  return jwt.sign({id}, config.jwt_secret, {
    expiresIn: '7d'
  })
}

export default generateToken