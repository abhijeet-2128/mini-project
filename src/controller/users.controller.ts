import Hapi from '@hapi/hapi';
import bcrypt from 'bcrypt';
import { Customer, customerSignupJoiSchema ,customerLoginJoiSchema} from '../models/customers';
import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import Session from '../models/sessions';


dotenv.config();
const secretKey = process.env.SECRET_KEY ;




//------------------- User signup ------------
export const signup = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const { error, value } = customerSignupJoiSchema.validate(request.payload);

    if (error) {
      return h.response({ message: 'Invalid payload', error }).code(400);
    }

    const { email, password ,full_name} = value;

    // Check if the customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return h.response({ message: 'Email already registered' }).code(409);
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new customer
    const newCustomer = new Customer({ email, password: hashedPassword ,full_name});
    await newCustomer.save();

    return h.response({ message: 'Signup successful' }).code(201);
  } catch (error) {
    return h.response({ message: 'Error signing up', error }).code(500);
  }
};


//------------------- User login ------------------------
export const login = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const { error, value } = customerLoginJoiSchema.validate(request.payload);

    if (error) {
      return h.response({ message: 'Invalid payload', error }).code(400);
    }

    const { email, password } = value;

    // Check if the customer exists
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return h.response({ message: 'Customer not found' }).code(404);
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, customer.password);
    if (!passwordMatch) {
      return h.response({ message: 'Invalid credentials' }).code(401);
    }

    // Create a JWT token with the customer's ID as the payload
    const secretKey = process.env.SECRET_KEY as Secret;
    console.log(secretKey);
    
    const token = jwt.sign({ customerId: customer._id, role: customer.role }, secretKey, { expiresIn: '1h' });
  
    const expirationTime = new Date(Date.now() + (60 * 60 * 1000)); 
    // Create a new session entry
    const session = new Session({
      customerId: customer._id,
      isActive: true,
      expiresAt: expirationTime,
    });
    await session.save();
  


    return h.response({ message: 'Login successful', token });
  } catch (error) {
    return h.response({ message: 'Error logging in', error }).code(500);
  }
};

//--------------------- user logout -- -  -- -- - - - -- 
export const logout = async (request:Hapi.Request, h:Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId;

    // Update the session to mark it as inactive
    await Session.updateOne({ customerId, isActive: true }, { isActive: false });

    

    return h.response({ message: 'Logged out successfully' }).code(200);
  } catch (error) {
    // Handle logout error
    return h.response({message: 'Error while logging out'});
  }
};


// -----  -- --  - - get User profile ---- 
export const getProfile = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    // Find the customer by ID
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return h.response({ message: 'Customer not found' }).code(404);
    }

    // Return the user profile information
    return h.response({
      email: customer.email,
      full_name: customer.full_name,
      role: customer.role,
    }).code(200);
  } catch (error: any) {
    console.log(error);
    return h.response({ message: 'Error retrieving profile' }).code(500);
  }
};


//---------------update profile---------
export const updateProfile = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId; // Extract customer ID from authenticated token

    const full_name :any= request.payload;
    if (!full_name) {
      return h.response({ message: 'Missing required field: full_name' }).code(400);
    }

    // Find the customer by ID and update the full_name field
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      full_name,
      { new: true }
    );

    if (!updatedCustomer) {
      return h.response({ message: 'Customer not found' }).code(404);
    }

    // Return the updated user profile
    return h.response({
      email: updatedCustomer.email,
      full_name: updatedCustomer.full_name,
      role: updatedCustomer.role,
    }).code(200);
  } catch (error) {
    console.log(error);
    
    return h.response({ message: 'Error updating profile' }).code(500);
  }
};


//--------delete profile----------------

export const deleteProfile = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const customerId = request.auth.credentials.customerId;

    //retrieve the customer session
    const session = await Session.findOne({ customerId });
    
      // Check if the session is active
      if (!session || !session.isActive) {
        return h.response({ message: 'Session is inactive or not found' }).code(401);
      }
    if (!customerId) {
      return h.response({ message: 'Customer not found or already deleted' }).code(404);
    }

    // Find and delete the customer by ID
    const deletedCustomer = await Customer.findByIdAndDelete(customerId);

    if (!deletedCustomer) {
      return h.response({ message: 'Customer not found or already deleted' }).code(404);
    }

  
    return h.response({ message: 'Customer deleted successfully' }).code(200);
  } catch (error) {
    console.log(error);
    return h.response({ message: 'Error deleting customer profile' }).code(500);
  }
};
















 
  

  
