var express= require ("express");
var passport=require("passport");
var User=require("../models/user");
var Campground = require ("../models/campground");
const { cloudinary, upload } = require('../middleware/cloudinary');
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
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
// FORGOT ROUTES
router.get("/forgot",function(req,res){
	res.render("forgot");
})
router.post('/forgot', function(req, res, next) {
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'help.sonder@gmail.com',
          pass: 'S0nd3rH3lp'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'help.sonder@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'help.sonder@gmail.com',
          pass: 'S0nd3rH3lp'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'help.sonder@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/story');
  });
});
// BIODATA ROUTES
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