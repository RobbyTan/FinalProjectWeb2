var express= require ("express");
var passport=require("passport");
var User=require("../models/user");
var Campground = require ("../models/campground");
const { cloudinary, upload } = require('../middleware/cloudinary');
var router=express.Router();
// express router

router.get("/",function(req,res){
	res.render("landing")
})
// AUTH ROUTES
router.get("/register",function(req,res){
	res.render("register");
})
router.post("/register", upload.single('image'),function(req,res){
	var password=req.body.password;
	var confirmPassword= req.body.confirmpassword;
	cloudinary.uploader.upload(req.file.path,function(result){
		console.log(result.secure_url);
		var newUser = new User({username:req.body.username,image:result.secure_url,email:req.body.email,birthday:req.body.birthday,gender:req.body.gender});
		if(password==confirmPassword){
			User.register(newUser,req.body.password,function(err,user){
				if(err){
					console.log(err);
					req.flash("error","Username Already Exist!");
					return res.redirect("/register");
				}
				passport.authenticate("local")(req,res,function(){
					console.log(req.body.image);
					req.flash("success","Welcome to No Judgement Zone "+req.body.username +"!")
					res.redirect("/story");
				});
			});
		}else{
			req.flash("error","Password don't match!")
			res.redirect("/register")
		}
	});

})
// LOGIN ROUTES
router.get("/login",function(req,res){
	res.render("login");
})
router.post("/login",passport.authenticate("local",{
	successRedirect : "/story",
	failureRedirect : "/login",
	failureFlash: true,
	successFlash: 'Welcome to No Jugment Zone!'
}),function(req,res){

})
// LOGOUT ROUTES
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged You Out!")
	res.redirect("/story")
});
router.get("/biodata/:id",function(req,res){
	User.findById(req.params.id ,function(err,foundBiodata){
		// tidak bisa pakai === karena satu object satu string
		if(err){
			res.redirect("/story");
		}else{
			Campground.find({"author.username": foundBiodata.username}, function(err, foundStory) {
				console.log(foundStory);
				res.render("biodata",{biodata:foundBiodata,story:foundStory});
			});
		}
	})

})
// middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login First");
	res.redirect("/login");
}

module.exports= router;