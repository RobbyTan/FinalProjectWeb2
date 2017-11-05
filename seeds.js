var mongoose = require ("mongoose");
var Campground = require ("./models/campground");
var Comment = require ("./models/comment");

var data=[
{
	name : "Captain America",
	image : "https://typeset-beta.imgix.net/rehost%2F2016%2F9%2F13%2F4a82ebfe-0a5d-476f-bc0c-de9ededd0eab.jpg",
	description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
},
{
	name : "Samsung",
	image : "https://souqcms.s3.amazonaws.com/spring/cms/en/ae/2017_LP/samsung/s8/display.jpg",
	description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
},
{
	name : "Iphone",
	image : "https://9to5mac.files.wordpress.com/2017/02/iphone-8-concept-embedded-fingerprint-reader.jpg?quality=82&strip=all&strip=all",
	description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
}
]

function seedDB(){
	Campground.remove({},function(err){
		if(err){
			console.log(err);
		}else{
			console.log("removed");
			// added a new campgrounds
			data.forEach(function(seed){
				Campground.create(seed,function(err,campground){
					if(err){
						console.log(err);
					}else {
						console.log(campground);
						// create comments
						Comment.create(
						{
							text :"Captain america the first super soldier is lame",
							author : "Robby"
						},function(err,comment){
							if(err){
								console.log(err);
							}else{
								campground.comments.push(comment);
								campground.save();
								console.log("created new comments");
							}
						}
						)
					}
				})
			});
		}
	});

}

module.exports = seedDB;
