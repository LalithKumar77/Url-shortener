import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
  ip: { type: String, default: null },
  country: { type: String, default: null },
  countryCode: { type: String, default: null },
  region: { type: String, default: null },
  city: { type: String, default: null },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  timezone: { type: String, default: null },
  postal: { type: String, default: null },
  continent: { type: String, default: null },
  deviceType: { type: String, default: null },
  os: { type: String, default: null },
  browser: { type: String, default: null },
  location: { type: String, default: null },
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