import validate, { ValidationError } from 'jsonschema'
import {  ADD_EXPENSES, CREATE_USER, CREATE_USER_ACCOUNT} from '../utils/apiTypeConstants'

// Schema validators
import { createUserSchema, categoriesSchema, expenseSchema, createUserAccountSchema, addExpensesSchema } from './requestSchema';

const Validator = validate.Validator;
let v = new Validator();

// add schema
v.addSchema(expenseSchema, '/Expense')
v.addSchema(categoriesSchema, '/Categories')

type reqType = {
  type: string,
  validateData: {}
}

type resultResType = {
  status: boolean,
  msg: string,
  error?: ValidationError[]
}

// check validation result and crete response object
function createResultObj(validationResult: validate.ValidatorResult): resultResType {
  if(validationResult.errors.length > 0){

    console.log(`Total ${validationResult.errors.length} Errors`)
  
    validationResult.errors?.map(( err, index) => {
      console.log(`Error ${index + 1} : ${err}`)
    })
  
    return {
      status: false,
      msg: 'Request Object Invalid',
      error: validationResult.errors
    };
  }else{
    return {
      status: true,
      msg: 'Request Object Validated successfully'
    };
  }
}


export const validateRequest = ({ type, validateData} : reqType): resultResType => {

  switch(type){

    case CREATE_USER: return createResultObj(v.validate(validateData, createUserSchema));

    case CREATE_USER_ACCOUNT: return createResultObj(v.validate(validateData, createUserAccountSchema));

    case ADD_EXPENSES: return createResultObj(v.validate(validateData, addExpensesSchema));

    default: return {
      status: false,
      msg: 'Request Type Not Matched'
    }
  }

}