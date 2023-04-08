import { Request, Response , NextFunction } from 'express'
import User from '../models/user.model'
import UserAccount from '../models/useraccount.model';
import { CREATE_USER, CREATE_USER_ACCOUNT, ADD_EXPENSES } from '../utils/apiTypeConstants';
import { validateRequest } from '../validators/validate';
import CONSTANTS from '../utils/constants'
import generateToken from '../utils/generateToken';
import mongoose from 'mongoose';

type ExpenseType = {
  name: string,
  value: number,
  description?: string
}

type CategoryType = {
  name: string,
  valueInPercent: number,
  totalInitialBalance: number,
  fixedExpenses: ExpenseType[],
  variableExpenses: ExpenseType[]
}


export const createUserAccount = async (req: Request, res: Response, next: NextFunction) => {

  // get data from frontend
  if(req.user && req.user.id){
    let userId = req.user.id

    const { totalIncome, categories }: {totalIncome: number, categories: CategoryType[]} = req.body

    // check for total valueInPercent should be 100
    const valueShouldBe100 = categories?.reduce((acc, curVal) => {
      return acc + curVal.valueInPercent;
    }, 0)

    if(!(valueShouldBe100 === 100)){
      return  res.status(CONSTANTS.OK).json({
        status: false,
        msg: "Total value of Categories should be 100%"
      })
    }

    // add totalFixedAmount, totalVariableAmount, currentBalance 
    // const newCategories = categories?.map(category => {
    //   const totalFixedAmount = category.fixedExpenses?.reduce((acc, currVal) => {
    //     return acc + currVal.value
    //   },0 )

    //   const totalVariableAmount = category.variableExpenses?.reduce((acc, currVal) => {
    //     return acc + currVal.value
    //   },0 )

    //   const currentBalance = category.totalInitialBalance -  (totalFixedAmount + totalVariableAmount)

    //   return {...category, totalFixedAmount, totalVariableAmount, currentBalance}
    // })
  
  //validate data
  let validationResult = validateRequest({type: CREATE_USER_ACCOUNT, validateData: {userId, totalIncome, categories: categories}})

  //if validation successfull then save into db
  if(validationResult.status){

    try {
      //create user account
      let userAccount = await UserAccount.create({
        userId,
        totalIncome,
        categories
      })

      if(userAccount){
        let updatedUser = await User.updateOne({_id: userId}, {$set: { userAccountId: userAccount._id}})

         
        // send user info
        res.status(CONSTANTS.OK).json({
          status: true,
          msg: "User Account Created Successfully and it's Active.",
          data: {
            _id: userAccount._id,
            name: userAccount.name
          }
        })
      }else{
        res.status(CONSTANTS.SERVERERROR).json({
          status: false,
          msg: "User Account Creation Failed"
         })
      }


    } catch (error) {
       res.status(CONSTANTS.SERVERERROR).json({
        status: false,
        msg: "User Account Creation Failed",
        data: error
       })
    }

  }else{
    res.status(CONSTANTS.OK).json({
      status: false,
      msg: "Input data Invalid",
      data: validationResult.error
    })
  }

  }else{
    res.status(CONSTANTS.OK).json({
      status: false,
      msg: "User Id not Found",
    })
  }

}

export const getUserAccount = async (req: Request, res: Response, next: NextFunction) => {

  // get user id
  if(req.user){
  let userId = req.user.id

  if(!userId || userId === ""){
     res.status(CONSTANTS.BADREQUEST).json({
      status: false,
      msg: "User Id Not Found"
     })
  }else{

      try {
        // fetch active userAccount Id
        let activeUserAccountId = await User.findById(userId).select('userAccountId')
        console.log('id : ', activeUserAccountId)
        if(activeUserAccountId){
          let userAccount = await UserAccount.findById(activeUserAccountId.userAccountId)

          if(userAccount){
            // send user details
            res.status(CONSTANTS.OK).json({
              status: true,
              statusCode: CONSTANTS.OK,
              msg: "Successfully found User Account.",
              data: userAccount
            })
          }else{
            // user not found
            res.status(CONSTANTS.BADREQUEST).json({ 
              status: false,
              statusCode: CONSTANTS.NOTFOUND,
              msg: "User Account Not Found"
            })
          }
        }else{
          res.status(CONSTANTS.BADREQUEST).json({ 
            status: false,
            statusCode: CONSTANTS.NOTFOUND,
            msg: "Active UserAccount Id Not Found."
          })
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

export const addExpenses = async (req: Request, res: Response, next: NextFunction) => {

  // get data from frontend
  if(req.user && req.user.id){
    let userId = req.user.id

    const { data }: {data: [{_id: string,fixedExpenses : ExpenseType[], variableExpenses: ExpenseType[]}] } = req.body

  
  //validate data
  let validationResult = validateRequest({type: ADD_EXPENSES, validateData: data})

  //if validation successfull then save into db
  if(validationResult.status){
    try {

    // if more than one category update, loop through and update each
    if(data.length > 1){

    }else{
      // updte single category
      const {_id, fixedExpenses, variableExpenses} = data[0]
      let userAccount = await UserAccount.findOne({userId}).select('userId name totalIncome categories._id categories.name categories.valueInPercent categories.totalInitialBalance categories.totalFixedAmount categories.totalVariableAmount categories.currentBalance')

      let newTotalFixedAmount = fixedExpenses.reduce((accumulator, current) => {
        return accumulator + (current.value || 0)
      },0)

      let newTotalVariableAmount = variableExpenses.reduce((accumulator, current) => {
        return accumulator + (current.value || 0)
      },0)

      let selectedCategory = userAccount?.categories.find(category => {
        if( category && "_id" in category ){
          return String(category._id) === _id
        }
        
      })

      if(userAccount && selectedCategory){
        let updatedFixedBal = selectedCategory.totalFixedAmount + newTotalFixedAmount
        let updatedVarBal = selectedCategory.totalVariableAmount + newTotalVariableAmount
        let updatedCurrentBalance = selectedCategory.totalInitialBalance - (updatedFixedBal + updatedVarBal)
        let updatedUserAccount = await UserAccount.updateOne(
          { _id : userAccount._id},
          {
            $addToSet: {
              "categories.$[item].fixedExpenses": fixedExpenses,
              "categories.$[item].variableExpenses": variableExpenses,
            },
            $set: {
              "categories.$[item].totalFixedAmount": updatedFixedBal,
              "categories.$[item].totalVariableAmount": updatedVarBal,
              "categories.$[item].currentBalance": updatedCurrentBalance,
            }
          },
          {
            arrayFilters: [{ "item._id": _id }]
          }

        )

        // send user info
        res.status(CONSTANTS.OK).json({
          status: true,
          msg: "User Account Updated Successfully",
          data: updatedUserAccount
        })
      }else{
        res.status(CONSTANTS.OK).json({
          status: false,
          msg: "User Account Not Found"
         })
      }
    }

    } catch (error) {
      console.log('error : ', error)
       res.status(CONSTANTS.SERVERERROR).json({
        status: false,
        msg: "User Account Creation Failed",
        data: error
       })
    }

  }else{
    res.status(CONSTANTS.OK).json({
      status: false,
      msg: "Input data Invalid",
      data: validationResult.error
    })
  }

  }else{
    res.status(CONSTANTS.OK).json({
      status: false,
      msg: "User Id not Found",
    })
  }

}

{/**
function init(total_income){
   // create caterogies and save
   categories.push(firstCategory);

   console.log(`Total num of categories : ${categories.length}`)

   categories.map(category => {
    // calculate total initial balance

    category.totalInitialBal = (category.valueInPercent * total_income) / 100.0;
    
    let totalFixedAmount = category.fixedAmount.reduce((accumulator, current) => {
        return accumulator + current.value
    },0)

    category.currentBal = (category.totalInitialBal - totalFixedAmount);
   }) 

}
*/}

async function updateBalance(userAccountId: string){

  try{
      // get the current userAccount details
  let userAccount = await UserAccount.findById(userAccountId)

  if(userAccount && userAccount.categories){
    let updateArray = [];


    userAccount.categories.map(category => {
      let totalFixedAmount,totalVariableAmount, currentBalance : number;
      //calculate fixed and variable total expenses
      totalFixedAmount = category.fixedExpenses.reduce((accumulator, current) => {
          return accumulator + (current.value || 0)
      },0)

      totalVariableAmount = category.variableExpenses.reduce((accumulator, current) => {
        return accumulator + (current.value || 0)
      },0)
  
      currentBalance = (category.totalInitialBalance - (totalFixedAmount + totalVariableAmount));

     }) 

     // update balance
  }

  } catch (error) {
    return {
     status: false,
     msg: "User Account Creation Failed",
     data: error
    }
 }
 
}