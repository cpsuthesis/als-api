const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please enter username"],
  },

  password: {
    type: String,
    required: [true, "Please enter password"],
  },
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
