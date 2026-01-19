import mongoose, { Schema } from "mongoose"; 

const accountSchema = new mongoose.Schema({ 
    account_type: { type: String, required: true }, 
    account_content: { 
        type: Object, 
        email: { type: String }, 
        phone_number: { type: String }, 
        password: { type: String }, 
        status: { type: String }, 
        two_step: { type: String }, 
        note : { type: String } 
    }, 
    account_user : { 
        type: Schema.Types.ObjectId,
        ref: "User", 
    }, 
    del_flag: { type: Boolean, default: false } 
}, { 
    timestamps: true 
}); 

const Account = mongoose.model("Account", accountSchema);
 
export default Account;