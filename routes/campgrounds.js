var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX -show all campgrounds
router.get("/", function(req, res){

    //Get All Campground From DB 
   Campground.find({}, function(err, campgrounds){
        if(err){
            console.log("DATABASE ERROR");
            console.log(err);
        }
        else{
           res.render("campground/index", {campgrounds: campgrounds, currentUser: req.user});
    
    }
    }); 
});

 //CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    //create a new campground and save it to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }
        else{
            //redirect back to campground
            res.redirect("/campgrounds");          
        }
    });
    
}); 

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campground/new"); 
});

//Show - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
            //render show template with that campground
            res.render("campground/show", {campground: foundCampground});
        }
    });
});

//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campground/edit", {campground: foundCampground}); 
    });
    });
 
//Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //Find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            res.redirect("/campgrounds/" + req.params.id);
    });
});    

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
            res.redirect("/campgrounds");
    });
});

module.exports = router;