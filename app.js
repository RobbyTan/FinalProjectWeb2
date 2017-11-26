var express	 		  = require("express"),
app	      			  = express(),
bodyParser 			  = require("body-parser"),
passport  			  = require("passport"),
LocalStrategy         = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose");
User				  = require("./models/user"),
methodOverride   	  = require("method-override"),
flash				  = require("connect-flash"),
mongoose   			  = require('mongoose');
mongoose.Promise = global.Promise; 
mongoose.connect('mongodb://localhost/final_project',{useMongoClient: true});
require('dotenv').config();

// REQUIRE ROUTES
var campgroundRoutes=require("./routes/campgrounds"),
	commentRoutes=require("./routes/comments"),
	aboutUs=require("./routes/about"),
	indexRoutes=require("./routes/index");
	helpRoutes=require("./routes/help");

var Campground = require ("./models/campground");
var Comment = require ("./models/comment");
var seedDB = require("./seeds")
// seedDB();
// start dr awal untuk membuat komen bekerja
// PASSPORT 
app.use(require("express-session")({
	secret : "Robby is the best",
	resave : false,
	saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.locals.moment = require('moment');
// untuk mengukur waktu
app.use(express.static(__dirname+"/public"));
// __dirname untuk mencari path projectnya
app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.static("public"));
// supaya mencari ke public
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error= req.flash("error");
	res.locals.success= req.flash("success");
	next();
	// untuk memberikan akses current User ke semua
})
app.use(indexRoutes);
app.use("/story",campgroundRoutes);
// untuk menaruh "/campgrounds di dpn semua routes campgrounds"
app.use("/story/:id/comments",commentRoutes);
// untuk memberitahu express untuk menggunakan routes
app.use("/about",aboutUs)
app.use("/help",helpRoutes)

app.listen(3000,function(){
	console.log("Server has started")
})
// restful routes terdiri dari 4 yaitu : index (display all),new (form untuk buat baru),create(POST),show(get new dogs)