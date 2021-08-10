var mongoose = require("mongoose");
//create log schema
var passwordSchema = new mongoose.Schema({
    password: {
        type: String
    }
});
var passwordModel = mongoose.model("password", passwordSchema);
module.exports = passwordModel;
