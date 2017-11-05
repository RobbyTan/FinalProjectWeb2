var mongoose   = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
	username : String,
	email : String,
	birthday: String,
	gender : String,
	image : String,
	password : String
})

userSchema.plugin(passportLocalMongoose);
// ini untuk memberikan userSchema method" dan function dari passport local mongoose
var User= mongoose.model("User",userSchema);

module.exports= User;