import mongoose from "mongoose"

const userAccountSchema = new mongoose.Schema({

   userId : {type: mongoose.Schema.Types.ObjectId, required: [true, "Enter your user Id"], ref: 'User'},
   totalIncome: {type: Number, required: [true, "Enter your Total Income"], default: 20000},
   name: {type: String, required: [true, "Enter your Account Name"], default: "50/30/20 - Expenses/Needs/Savings"},
   categories: [{
      name: {type: String, required: [true, "Enter your category name"]},
      valueInPercent: {type: Number, required: [true, "Enter category value in percent"]},
      totalInitialBalance: {type: Number, required: [true, "Enter your Init balance"]},
      totalFixedAmount: {type: Number, required: true, default: 0},
      totalVariableAmount: {type: Number, required: true, default: 0},
      currentBalance: {type: Number, required: true, default: 0},
      fixedExpenses: [
        {
          name: {type: String},
          value: {type: Number},
          description: {type: String}
        }
      ],
      variableExpenses: [
        {
          name: {type: String},
          value: {type: Number},
          description: {type: String}
        }
      ]
   }],


},{
  timestamps: true
})

const UserAccount = mongoose.model("UserAccount", userAccountSchema)

export default UserAccount