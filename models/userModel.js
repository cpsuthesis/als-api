const mongoose = require("mongoose");

const studentsSchema = mongoose.Schema({
  username: {
    type: String,
  },
  
  firstName: {
    type: String,
  },

  middleName: {
    type: String,
  },

  lastName: {
    type: String,
  },
  
  lrn: {
    type: String,
  },

});

const Students = mongoose.model("students", studentsSchema);

module.exports = Students;
