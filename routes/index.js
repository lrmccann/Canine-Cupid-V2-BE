const router = require("express").Router();
const usersController = require("../controllers/usersController");
const auth = require("../controllers/middlewere/session-trecker")

router
.route("/users")
    .post(usersController.create)   // create a user
    .get(auth.authentication, usersController.findAll)   // get all users
  
router
.route("/users/:id1/:id2")          //id1 is username, id2 is password
    .get(usersController.authenticate)
   
router
.route("/user/:id1")            
    .get(auth.authentication, usersController.findByName)    // get 1 user by name (:id1)   
    .put(auth.authentication, usersController.updateByName)      // update 1 user by userName (:id1)

// update :id1 user's matchesYes array be adding :id2 (Name of Yes matched user) in it
//:id1 is user Name, :id2 user Name of match
router
.route("/usersyesmatches/:id1/:id2")    
    .put(usersController.updateMatchesYesByName)   

// update :id1 user's matchesNo array be adding :id2 (Name of No matched user) in it
//:id1 is user Name, :id2 user Name of match
router
.route("/usersnomatches/:id1/:id2")    
    .put(usersController.updateMatchesNoByName)     
 
// get all info for all Yes matches (for all users in matchesYes array) of user by id (:id1) 
router
.route("/usersallyesmatches/:id1")            
    .get(auth.authentication, usersController.getMatchesYesByName)    //id1 is user Name

// get all info for all No matches (for all users in matchesNo array) of user by id (:id1) 
router
.route("/usersallnomatches/:id1")            
    .get(auth.authentication, usersController.getMatchesNoByName)    //id1 is user Name

module.exports = router;

////////////////////////////////////////////////////////////////////////
// Matches with "/api/posts/:id"
// router
//   .route("/:id")
//   .delete(usersController.remove);
