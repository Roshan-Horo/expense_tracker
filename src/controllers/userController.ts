import { Request, Response , NextFunction } from 'express'
import User from '../models/user.model'
import { CREATE_USER } from '../utils/apiTypeConstants';
import { validateRequest } from '../validators/validate';
import CONSTANTS from '../utils/constants'
import generateToken from '../utils/generateToken';
import bcrypt from 'bcryptjs'


export const createUser = async (req: Request, res: Response, next: NextFunction) => {

  // get data from frontend
  const { name, email, mobile, passcode} = req.body
  
  // validate data
  let validationResult = validateRequest({type: CREATE_USER, validateData: {name, email, mobile, passcode}})

  // save into db
  if(validationResult.status === true){

    try {

      // check if user already exists
      let isUserExist = await User.findOne({email});

      if(isUserExist){
        res.status(CONSTANTS.BADREQUEST).json({
          status: false,
          statusCode: 400,
          msg: "User Already Exists."
        })
      }else{

      // create user
      let user = await User.create({
        name,
        email,
        mobile,
        passcode
      })
 
      // send user info
      res.status(CONSTANTS.OK).json({
        status: true,
        statusCode: CONSTANTS.OK,
        msg: "User Successfully Created",
        data: {
          _id : user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id)
        }
      })
      }

    } catch (error) {
      console.log('error ', error)
       res.status(CONSTANTS.SERVERERROR).json({
        status: false,
        statusCode: CONSTANTS.SERVERERROR,
        msg: "User Creation Failed",
        data: error
       })
    }


  }else{
    res.status(CONSTANTS.BADREQUEST).json({
      status: false,
      statusCode: CONSTANTS.BADREQUEST,
      msg: "Input data Invalid",
      data: validationResult
      
    })
  }

}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {

  // get user id
  if(req.user){
  let userId = req.user.id

  if(!userId || userId === ""){
     res.status(CONSTANTS.BADREQUEST).json({
      status: false,
      msg: "User Id Not Found"
     })
  }else{
      // fetch data from db
      try {
        let user = await User.findById(userId).select('-passcode');

        if(user){
          // send user details
          res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile
          })
        }else{
          // user not found
          res.status(404).json({ msg: "User Not Found"})
        }

      } catch (error) {
          res.status(CONSTANTS.SERVERERROR).json({
            status: false,
            msg: "Getting Error while Fetching User.",
            data: error
          })
      }
  }

  }else{
      // user not found
      res.status(CONSTANTS.BADREQUEST).json({ msg: "User Id Not Found"})
  }

}

export const authUser = async (req: Request, res: Response, next: NextFunction) => {

  // get email and passcode
  let {email, passcode} = req.body
  
  // fetch data from db
  try {
    let user = await User.findOne({email});
    async function matchPasscode(enteredPasscode: string, hashedPasscode: string){
      return await bcrypt.compare(enteredPasscode, hashedPasscode)
    }

    if(user && ( await matchPasscode(passcode, user.passcode) )){
        // send user details
        res.status(CONSTANTS.OK).json({
          status: true,
          statusCode: CONSTANTS.OK,
          msg: 'login successfull',
          data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isAdmin: user.isAdmin,
          token: generateToken(user._id)
          }
        })

      }else{
      // send user details
      res.status(CONSTANTS.BADREQUEST).json({ status: CONSTANTS.BADREQUEST, msg: "User or Passcode Invalid"})
    }


  } catch (error) {
      res.status(CONSTANTS.SERVERERROR).json({
        status: false,
        statusCode: 400,
        msg: "Getting Error while Fetching User.",
        data: error
      })
  }

}

export const checkEmailAlreadyExists = async (req: Request, res: Response, next: NextFunction) => {
    // get data from frontend
  const { email } = req.body
  
  //
  if(email !== undefined || email !== null){

    try {

      // check if user already exists
      let isUserExist = await User.findOne({email});

      if(isUserExist){
        res.status(CONSTANTS.OK).json({
          status: true,
          msg: "Email Already Exists."
        })
      }else{
        res.status(CONSTANTS.OK).json({
          status: false,
          msg: "Email Not Exists."
        })
      }
    } catch (error) {
       res.status(CONSTANTS.SERVERERROR).json({
        status: false,
        msg: "Checking User Email exists failed",
        data: error
       })
    }


  }else{
    res.status(CONSTANTS.BADREQUEST).json({
      status: false,
      msg: "Email is undefined or null",
      
    })
  }
}