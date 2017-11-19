var express= require ("express");
var Campground = require ("../models/campground");
var User=require("../models/user");
var router=express.Router();
// express router

// INDEX 
router.get("/",function(req,res){	
	console.log(req.user);
	// ini mengambil data user
	Campground.find({},function(err,allcampgrounds){
	// kalau mau cari spesifik isi objectnya
	if(err){
		console.log(err);
	}else{
		User.find({},function(err,foundBiodata){
			res.render("campgrounds/index",{campgrounds:allcampgrounds, currentUser : req.user,biodata:foundBiodata})
		})
	}
})
	// res.render("campgrounds",{campgrounds:campgrounds})
})
// CREATE
router.post("/",isLoggedIn,function(req,res){
	var name=req.body.name;
	var image=req.body.image;
	var description=req.body.description;
	var author = {
		id: req.user._id,
		username : req.user.username,
		image : req.user.image
	}
	var newCampgrounds={name:name,image:image,description:description,author:author};
	// simpan ke database
	Campground.create(newCampgrounds),function(err,newCampground){
		if(err){
			console.log(err)
		}else{
			res.redirect("/story")
			console.log(newCampground)
		}
	}
	res.redirect("/story")
})
// new
router.get("/new",isLoggedIn,function(req,res){
	res.render("campgrounds/new");
})
// show
router.get("/:id",function(req,res){
	// kalau : digunakan untuk paramenter /isinya boleh apa saja
	console.log(req.params.id)
	// untuk membuat comment nya berisi
	Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampgrounds){
		if(err){
			console.log(req.params.id);
			console.log(err);
		}else{
			console.log(foundCampgrounds)
			var commentCount = foundCampgrounds.comments.length;
			// console.log(commentCount);
			res.render("campgrounds/show",{campground:foundCampgrounds,commentCount:commentCount})
		}
	})
})

// EDIT ROUTES
router.get("/:id/edit",checkOwnership,function(req,res){
	// check if the user is logged in
	Campground.findById(req.params.id ,function(err,foundCampground){
		// tidak bisa pakai === karena satu object satu string
		res.render("campgrounds/edit",{campground : foundCampground});
	})
})
// UPDATE ROUTES
router.put("/:id",checkOwnership,function(req,res){
	Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
		if(err){
			res.redirect("/story");
		}else{
			res.redirect("/story/"+req.params.id);
		}
	})
});
// DELETE ROUTES
router.delete("/:id",checkOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/story");
		}else{
			req.flash("success","Delete Successfull!");
			res.redirect("/story");
		}
	})
});

// middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","Please Login First");
	res.redirect("/login");
}
function checkOwnership(req,res,next){
		// check if the user is logged in
		if(req.isAuthenticated()){
			Campground.findById(req.params.id ,function(err,foundCampground){
				if(err){
					res.redirect("back");
				}else{
				// is the user own the campgrounds?
				if(foundCampground.author.id.equals(req.user._id) || req.user._id.equals("59febe24cbb24828842a9780")){
					// tidak bisa pakai === karena satu object satu string
					next();
				}else{
					res.redirect("back");
				}
			}
		})
		}else{
			res.redirect("/login");
		}
	}

	module.exports= router;