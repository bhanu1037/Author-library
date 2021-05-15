const mongoose = require('mongoose');
const path = require('path');

const coverImageBasePath = 'uploads/bookCovers'
//schema
const bookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    publishDate:{
        type: Date,
        required: true
    },
    pageCount:{
        type: Number,
        required: true        
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    coverImageName:{ //Why coverImageName?
        type: String,
        required: true
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    }
});
//Creating a virtual property
//it will act as the same as normal properties but it will derive its value 
//from other normal properties
bookSchema.virtual('coverImagePath').get(function(){
    if(this.coverImageName != null){
        return path.join('/',coverImageBasePath,this.coverImageName);
    }
});


module.exports = mongoose.model('Book',bookSchema);
module.exports.coverImageBasePath = coverImageBasePath;