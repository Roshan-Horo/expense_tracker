// create user Schema

export const createUserSchema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "object",
      "properties": {
        "first": {"type": "string", "minLength": 1},
        "middle": {"type": "string"},
        "last": {"type": "string", "minLength": 1}
      },
      "required": ["first", "last"]
    },
    "mobile": {"type": "string", "minLength": 10, "maxLength": 10 , "pattern": "^[789]{1}[0-9]{9}$"},
    "email": {"type": "string", "pattern": "^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$"},
    "isAdmin": {"type": "boolean"},
    "passcode": {"type": "string", "minLength": 6, "maxLength": 6 }

  },
  "required": ["name", "mobile", "email", "passcode"]
}

export const expenseSchema = {
  "id": "/Expense",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {"type": "string", "minLength": 1, "maxLength": 200},
      "value": {"type": "number", "minimum": 1},
      "description": {"type": "string",},

    },
    "required": ["name","value"]
  }

}

export const categoriesSchema = {
  "id": "/Categories",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "name": {"type": "string", "minLength": 1, "maxLength": 200},
      "valueInPercent": {"type": "number", "minimum": 1},
      "totalInitialBalance": {"type": "number", "minimum": 1},
      "totalFixedAmount": {"type": "number", "minimum": 1},
      "totalVariableAmount": {"type": "number", "minimum": 1},
      "currentBalance": {"type": "number", "minimum": 1},
      "fixedExpenses": {"$ref": "/Expense"},
      "variableExpenses": {"$ref": "/Expense"}
    },
    "required": ["name","valueInPercent", "totalInitialBalance"]
  }

}

export const addExpensesSchema = {
  "id": "/AddExpenses",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "_id": {"type": "string", "minLength": 1, "maxLength": 200},
      "fixedExpenses": {"$ref": "/Expense"},
      "variableExpenses": {"$ref": "/Expense"}
    },
    "required": ["_id"]
  }
}

export const createUserAccountSchema = {
  "type": "object",
  "properties": {
    "userId": {"type": "string", "minLength": 10},
    "totalIncome": {"type": "number"},
    "categories": {"$ref": "/Categories"}
  },
  "required": ["userId", "totalIncome", "categories"]
}

