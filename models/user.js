const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema({
  // title: { type: String, required: true },
  password: String,
  salt: String,
  userData: {
    sessionToken: String,
    userName:  String,
    petName:  String,
    breed: String,
    age: Number,
    park: Boolean,
    ball: Boolean,
    frisbee: Boolean,
    vaccinated: Boolean,
    trained: Boolean,
    email: String,
    petPhotoUrl: String,
    userPhotoUrl: String,
    info: String,
    zipCode: String,
    city: String,
    matchesYes: [],
    matchesNo: [],
    date: { type: Date, default: Date.now }
  }
});

const User = mongoose.model("Users", usersSchema);

module.exports = User;
