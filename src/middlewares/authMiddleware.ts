import jwt from 'jsonwebtoken'
import User from '../models/user.model'
import { Request, Response , NextFunction } from 'express'
import { config } from '../config/config'
import CONSTANTS from '../utils/constants'

type jwtPayload = {
  id: string,
  iat: number,
  exp: number
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    try{
      token = req.headers.authorization.split(' ')[1]

      const decoded : jwtPayload = jwt.verify(token, config.jwt_secret) as jwtPayload

      let user: any = await User.findById(decoded.id).select('name email mobile')

      if(user){
        req.user = {
          id: decoded.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile
        }
      }

      next();

    } catch(err){
      res.status(CONSTANTS.BADREQUEST).json({
        status: false,
        msg: "Not Authorized, token failed"
      })
    }
  }

  if(!token){
    res.status(CONSTANTS.BADREQUEST).json({
        status: false,
        msg: "Not Authorized, No Token"
    })
  }


}
