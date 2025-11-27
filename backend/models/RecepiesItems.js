const mongoose = require("mongoose");

const  recipeItemSchema = new mongoose.Schema({
    name:{type:String,required:true},
    quantity:{type:Number,required:true},
    category:{type:String,required:true},
    price:{type:Number,required:true},
    image:{type:String,required:true},
    description:{type:String,required:true},
    tax:{type:Number,required:true},
},{timestamps:true});
module.exports=mongoose.model("RecipeItem",recipeItemSchema);