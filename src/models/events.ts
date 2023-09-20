import Joi from "joi";
import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: String,
  description: String,
});

const eventSchemaJoi = Joi.object({
  name: Joi.string().required(),
  date: Joi.date().required(),
  location: Joi.string().required(),
  description: Joi.string().required(),
});


const Event = mongoose.model('Events', eventSchema);

export {Event,eventSchemaJoi};
