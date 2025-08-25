import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
  ip: String,
  country: String,
  countryCode: String,
  region: String,
  city: String,
  latitude: Number,
  longitude: Number,
  timezone: String,
  postal: String,
  continent: String,
}, { _id: false });

const checkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  Details: [detailsSchema]
});

const Check = mongoose.model("Check", checkSchema);
export default Check;