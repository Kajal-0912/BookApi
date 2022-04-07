const mongoose = require("mongoose");


//Creating a author schema
const PublicationSchema = mongoose.Schema({
    
        id : Number,
        name : String,
        books : [String],
    
});

//Create a Author Model
const PublicationModel = mongoose.model(PublicationSchema);

module.exports = PublicationModel;