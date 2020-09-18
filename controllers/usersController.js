const db = require("../models");
const bcrypt = require('bcrypt');

const createSessiontoken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const saltHash = (pass) => {
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(pass, salt);
  console.log("saltHash", salt, password)
  return { password, salt };
}

// Defining methods for the postsController
module.exports = {

  //////////////////////////////////////////////////////////////////
  create: async function (req, res) {
    console.log("create-func", req.body)
    console.log("userObj", req.body.userData.userName)
    let account = await db.User.findOne({ 'userData.userName': req.body.userData.userName });
    console.log("account", account)
    if (!account) {
      const creds = saltHash(req.body.password);
      const token = createSessiontoken();
      req.body.password = creds.password;
      req.body.salt = creds.salt;
      req.body.userData.sessionToken = token;
      await db.User.create(req.body)
        .then(result => res.json(result.userData))
        .catch(err => res.status(422).json(err));
    } else {
      res.json("User name already taken.")
    }
  },

  ////////////////////////////////////////////////////////////////////
  authenticate: async function (req, res) {
    console.log('request', req.params.id1)
    const password = req.params.id2;
    let account = await db.User
      .findOne({ 'userData.userName': req.params.id1 });
    console.log("account", account)
    if (account) {
      const passwordHash = account.password;
      let match = await bcrypt.compare(password, passwordHash);
      console.log("match", match)
      if (match) {
        const token = createSessiontoken()
        console.log("token", token)
        console.log("username", account.userData.userName);
        await db.User.findOneAndUpdate(
          { 'userData.userName': req.params.id1 },
          { 'userData.sessionToken': token },
          { new: true }    //Set new option to true to return the document AFTER update was applied.
        )
          .then(result => res.json(result.userData))
      } else {
        res.json("Wrong password.")
      }
    } else {
      res.json("User not found.")
    }
  },

  //////////////////////////////////////////////////////////////////
  findAll: async function (req, res) {
    await db.User
      .find({})
      .then(result => {
        let array2 = result.map(function (user) {
          return user.userData.userName
        })
        console.log("array2", array2);
        res.json(array2);
      })
      .catch(err => res.status(422).json(err))
  },

  /////////////////////////////////////////////////////////////////////
  findByName: async function (req, res) {
    console.log("findById");
    console.log("_id", req.params.id1);
    await db.User    
    .findOne({ 'userData.userName': req.params.id1})
    // await db.User
    //   .findOne({ '_id': req.params.id1 })
      //Sending only userData back
      .then(result =>res.json(result.userData)) 
      // .then(result => {
        // https://medium.com/@captaindaylight/get-a-subset-of-an-object-9896148b9c72
        // Sending _id and userData back ie. everything except password and salt
        // const subsetOfUser = (({ _id, userData }) => ({ _id, userData }))(result);
        // console.log("subset", subsetOfUser);
        // res.json(subsetOfUser);

      // })
      .catch(err => res.status(422).json(err))
  },

  /////////////////////////////////////////////////////////////////////
  updateByName: async function (req, res) {
    console.log("req", req.body);
    console.log("_id", req.params.id1);
    // const filter = { '_id': req.params.id1 };    // updating by user id
    const filter = { 'userData.userName': req.params.id1 };  //updating by user name
    const updatedUser = {
      // 'password': req.body.password,
      'userData.petName': req.body.userData.petName,
      'userData.breed': req.body.userData.breed,
      'userData.age': req.body.userData.age,
      'userData.park': req.body.userData.park,
      'userData.ball': req.body.userData.ball,
      'userData.frisbee': req.body.userData.frisbee,
      'userData.vaccinated': req.body.userData.vaccinated,
      'userData.trained': req.body.userData.trained,
      'userData.email': req.body.userData.email,
      'userData.petPhotoUrl': req.body.userData.petPhotoUrl,
      'userData.userPhotoUrl': req.body.userData.userPhotoUrl,
      'userData.info': req.body.userData.info,
      'userData.zipCode': req.body.userData.zipCode,
      'userData.city': req.body.userData.city
    };

    let updatedUser2 = {};
    for (x in updatedUser) {
      if (updatedUser[x] != null){   // field has been updated by frontend 
        if(updatedUser[x] === ""){  // field has been set to "" (deleted)
          updatedUser2[x] = null; 
        }
        else {
          updatedUser2[x] = updatedUser[x];
        }
      }
    }
    console.log("up", updatedUser2)

    await db.User.findOneAndUpdate(
      filter, updatedUser2,
      { new: true }    //You should set the new option to true to return the document after update was applied.    
    )   
      .then(result => res.json(result.userData))
      .catch(err => res.status(422).json(err));
  },

  //await db.User.updateOne(filter,{ $set: updatedUser }) 
  ///////////////////////////////////////////////////////////////////
  updateMatchesYesByName: async function (req, res) {
    console.log("id1", req.params.id1);
    console.log("id2", req.params.id2);
    // console.log("req", req.body);
    let account = await db.User
                  .findOne({ 'userData.userName': req.params.id1});   // To update by user name
    // let account = await db.User
    //   .findOne({ '_id': req.params.id1 });    // To update by user id
    console.log("account", account);
    let oldMatchesYes = account.userData.matchesYes;
    console.log("old", oldMatchesYes);
    var newMatchesYes = oldMatchesYes.concat(req.params.id2);
    console.log("updated", newMatchesYes);
    // const filter = { '_id': req.params.id1 };    // updating by user id
     const filter = { 'userData.userName': req.params.id1 };  //updating by user name    
    await db.User.updateOne(filter,
      { $set: { 'userData.matchesYes': newMatchesYes } }
    )
      .then(result => res.json("Your - Swiped Yes - Match Choice has been saved"))
      .catch(err => res.status(422).json(err));
  },
  
 ///////////////////////////////////////////////////////////////////
 updateMatchesNoByName: async function (req, res) {
  console.log("id1", req.params.id1);
  console.log("id2", req.params.id2);
  // console.log("req", req.body);
  let account = await db.User
                .findOne({ 'userData.userName': req.params.id1});   // To update by user name
  // let account = await db.User
  //   .findOne({ '_id': req.params.id1 });    // To update by user id
  console.log("account", account);
  let oldMatchesNo = account.userData.matchesNo;
  console.log("oldMatchesNo", oldMatchesNo);
  var newMatchesNo = oldMatchesNo.concat(req.params.id2);
  console.log("updated", newMatchesNo);
  // const filter = { '_id': req.params.id1 };    // updating by user id
   const filter = { 'userData.userName': req.params.id1 };  //updating by user name    
  await db.User.updateOne(filter,
    { $set: { 'userData.matchesNo': newMatchesNo } }
  )
    .then(result => res.json("Your - Swiped No - Match Choice has been saved"))
    .catch(err => res.status(422).json(err));
},

///////////////////////////////////////////////////////////////
  getMatchesYesByName: async function (req, res) {
    console.log("getMatchesYesByName");
    console.log("query", req.params.id1);
    //To Find by userName
    let account = await db.User 
     .findOne({ 'userData.userName': req.params.id1})
    // let account = await db.User
    //   .findOne({ '_id': req.params.id1 })
    console.log("account", account)
    let matchedYesUsers = account.userData.matchesYes;
    console.log("MatchYes", matchedYesUsers);
    await db.User.find({
        "userData.userName": {
        $in: matchedYesUsers
        }
    })
      // .then(result => res.json(result))
      .then(result => {
        let keys_to_keep = ['userData']
        const result2 = result.map(e => {
          const obj = {};
          keys_to_keep.forEach(k => obj[k] = e[k])
          return obj;
        });
        console.log("result2", result2);
        res.json(result2);
      })
      .catch(err => res.status(422).json(err));

    // for (i = 0; i < matchedYesUsers.length; i++) {
    //     console.log(matchedYesUsers[i]);
    //     let matchAccount = await db.User    
    //       .findOne({ '_id': matchedYesUsers[i]}) 
    //       .then(result => res.json(result))
    //       .catch(err => res.status(422).json(err));
    //     // matchedYesUsersData = matchedYesUsersData.concat(matchAccount);
    // }
    // // console.log(matchedUsersData); 

  },

///////////////////////////////////////////////////////////////
getMatchesNoByName: async function (req, res) {
  console.log("getMatchesNoByName");
  console.log("query", req.params.id1);
  //To Find by userName
  let account = await db.User 
   .findOne({ 'userData.userName': req.params.id1})
  // let account = await db.User
  //   .findOne({ '_id': req.params.id1 })
  console.log("account", account)
  let matchedNoUsers = account.userData.matchesNo;
  console.log("MatchNo", matchedNoUsers);
  await db.User.find({
      "userData.userName": {
      $in: matchedNoUsers
      }
  })
    // .then(result => res.json(result))
    .then(result => {
      let keys_to_keep = ['userData']
      const result2 = result.map(e => {
        const obj = {};
        keys_to_keep.forEach(k => obj[k] = e[k])
        return obj;
      });
      console.log("result2", result2);
      res.json(result2);
    })
    .catch(err => res.status(422).json(err));
},

////////////////////////////////////////////////////////////////

  getSessionToken: async function (req, res) {
    console.log("getSessionToken", req)
    if (req){
      return await db.User.findOne({ 'userData.sessionToken': req })
    } else {
      return null;
    }
  }

  ///////////////////////////////////////////////////////////////

};
  
//////////////////////////////////////////////////////////////////////
 
  // remove: function(req, res) {
  //   db.Post.findById({ _id: req.params.id })
  //     .then(dbModel => dbModel.remove())
  //     .then(dbModel => res.json(dbModel))
  //     .catch(err => res.status(422).json(err));
  // }


