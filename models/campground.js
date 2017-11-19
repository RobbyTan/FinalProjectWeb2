var mongoose   = require('mongoose');

var campgroundSchema=new mongoose.Schema({
	name: String,
	description : String,
	createdAt: { type: Date, default: Date.now },
	author : {
		id: {
			type : mongoose.Schema.Types.ObjectId,
			ref : "User"
			// model yang kita connect
		},
		username : String,
		image : String
	},
	comments : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref : "Comment"
			// model yang kita connect
		}

	]
});

var Campground= mongoose.model("Campground",campgroundSchema);

module.exports= Campground;