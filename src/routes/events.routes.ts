import { ServerRoute } from "@hapi/hapi";
import dotenv from 'dotenv';
import { Event, eventSchemaJoi } from "../models/events";
import { Customer } from "../models/customers";
import { sendEmail } from "../utils/email.sender";
import { adminAuthMiddleware } from "../middleware/auth.check";

dotenv.config();

const api = process.env.API_URL;
const eventRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: api + '/addEvents',
    options: {
      auth: 'jwt',
      tags: ['api', 'admin'],
      description: 'Update user role',
      pre: [{ method: adminAuthMiddleware }],
      validate: {
        payload: eventSchemaJoi,
      },
    },
    handler: async (request, h) => {
      try {
        const { name, date, location, description }: any = request.payload;
        const existingEvent = await Event.findOne({ name });
        if (existingEvent) {
          return h.response({ message: 'Event with the same name already exists' }).code(409);
        }
        const newEvent = new Event({
          name,
          date,
          location,
          description,
        });
        await newEvent.save();
        return h.response('Event added successfully').code(200);
      } catch (error) {
        console.error('Error adding event:', error);
        return h.response('Error adding event').code(500);
      }
    },
  },

  {
    method: 'PATCH',
    path: api + '/event/{eventId}',
    handler: async (request, h) => {
      try {
        const { eventId } = request.params;
        const { name, date, location, description }: any = request.payload;
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
          return h.response({ message: 'Event not found' });
        }
        existingEvent.name = name;
        existingEvent.date = date;
        existingEvent.location = location;
        existingEvent.description = description;

        await existingEvent.save();
        return h.response('Event details updated successfully').code(200);
      } catch (error) {
        console.error('Error updating event details');
        return h.response('Error updating event details').code(500);
      }
    }
  },

  {
    method: 'GET',
    path: '/sendEventMails',
    handler: async (request, h) => {
      try {
        const events = await Event.find();
        for (const event of events) {
          const reminderDate = new Date(event.date.getTime() - 24 * 60 * 60 * 1000);
          const customers = await Customer.find();
          for (const customer of customers) {
            // Check if the current time is within the reminder window 
            const currentTime = new Date();
            if (currentTime < reminderDate) {
              await sendEmail(
                customer.email,
                `Dear ${customer.full_name}! Event Reminder`,
                `Don't forget! ${event.name} is happening at ${event.location} on ${event.date}.`
              );
            }
          }
        }
        console.log('Email notifications sent for upcoming events.');
      } catch (error) {
        console.error('Error sending event reminders:');
      }
    }
  },

  {
    method: 'GET',
    path: api + '/events',
    handler: async (request, h) => {
      try {
        const events = await Event.find();
        return h.response({ events }).code(200);
      } catch (error) {
        return h.response({ message: "Error while retrieving events" })
      }
    }
  }
  
]

export default eventRoutes;