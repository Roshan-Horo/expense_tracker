import mongoose from "mongoose"
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
   name: {
    first: {type: String, required: [true, "Enter your First Name"]},
    middle: {type: String},
    last: {type: String, required: [true, "Enter your Last Name"]},
   },
   mobile: {type: String, required: [true, "Enter your Mobile No."]},
   email: {type: String, unique: true, required: [true, "Enter your Email"]},
   isAdmin: {type: Boolean, default: false},
   passcode: {type: String, required: [true, "Enter your Passcode"]},
   userAccountId : {type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount'},
},{
  timestamps: true
})

userSchema.methods.matchPasscode = async function (enteredPasscode: string) {
    return await bcrypt.compare(enteredPasscode, this.passcode)
}

userSchema.pre('save', async function (next) {
    if(!this.isModified('passcode')){
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.passcode = await bcrypt.hash(this.passcode, salt)
})

const userModel = mongoose.model("User", userSchema)

export default userModel