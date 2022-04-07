const mongoose = require("mongoose");


//Creating a author schema
const AuthorSchema = mongoose.Schema({
    
        id : Number,
        name : String,
        books : [String],
    
});

//Create a Author Model
const AuthorModel = mongoose.model(AuthorSchema);

module.exports = AuthorModel;