var express= require ("express");
var Campground = require ("../models/campground");
var Comment = require ("../models/comment");
var router=express.Router({mergeParams : true});
// untuk membuat halaman ini bisa mengambil parameter dari sebelumnya
// express router

// new comments 
router.get("/new",isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampgrounds){
		if(err){
			console.log(req.params.id);
			console.log(err);
		}else{
			console.log(foundCampgrounds)
			res.render("comments/new",{campgrounds:foundCampgrounds});
		}
	})
})
router.post("/",isLoggedIn,function(req,res){
	// look up campground using ID
	Campground.findById(req.params.id,function(err,campground){
		// untuk mengmbil req.params.id di kelas lain harus taruh di router {mergeParams : true}
		if(err){
			console.log(err);
			res.redirect("/story");
		}else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}else{
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					req.flash("success","Successfully Created New Comment!");
					res.redirect("/story/"+req.params.id);
				}
			})

		}
	})
})
// EDIT ROUTES
router.get("/:comment_id/edit",function(req,res){
	// Campground id langsung ambil karena tidak perlu isinya 
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err){
			res.redirect("back");
		}else{
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});		}
		})
})
// UPDATE ROUTES
router.put("/:comment_id",checkOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/story/"+req.params.id);
		}
	})
})
// DELETE ROUTES
router.delete("/:comment_id",checkOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log(err);
			res.redirect("back");
		}else{
			req.flash("success","Delete Successfull!");
			res.redirect("/story/"+req.params.id);
		}
	})
})
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
			Comment.findById(req.params.comment_id ,function(err,foundComment){
				if(err){
					res.redirect("back");
				}else{
				// is the user own the campgrounds?
				if(foundComment.author.id.equals(req.user._id) || req.user._id.equals("59febe24cbb24828842a9780")){
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