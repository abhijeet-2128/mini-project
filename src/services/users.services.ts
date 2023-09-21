import bcrypt from "bcrypt";
import { Customer,  UserStatus } from "../models/customers";
import jwt, { Secret } from "jsonwebtoken";
import Session from "../models/sessions";
import { createSessionInRedis,markSessionAsInactiveInRedis} from "../middleware/redis.session";
import { USERMSG } from "../utils/user.response";

export class UserService {
  static async signupUser(payload: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) {
    try {
      const { email, password, full_name, phone } = payload;

      // Check if the customer already exists
      const existingCustomer: any = await Customer.findOne({ email });
      const hashedPassword = await bcrypt.hash(password, 10);
      if (existingCustomer) {
        if (existingCustomer.status === UserStatus.DELETED) {
          existingCustomer.status = UserStatus.ACTIVE;
          existingCustomer.full_name = full_name;
          existingCustomer.phone = phone;
          existingCustomer.password = hashedPassword;
          await existingCustomer.save();
          // return existingCustomer;
          return {
            message: "Signup successful after profile reactivation",
            statusCode: 201,
          };
        } else {
          return { message: "Email already registered", statusCode: 409 };
        }
      }

      const newCustomerDocument = {
        email: email,
        password: hashedPassword,
        full_name: full_name,
        phone: phone,
      };

      await Customer.create(newCustomerDocument);
    
      return { message: "Signup successful", statusCode: 201 };
    } catch (error) {
      console.log(error);

      return { message: "Error signing up", error, statusCode: 500 };
    }
  }

  static async loginUser(payload: { email: string; password: string }) {
    try {
      const { email, password } = payload;

      // Check if the customer exists
      const customer = await Customer.findOne({
        email: email,
        status: UserStatus.ACTIVE,
      });
      if (!customer) {
        return { message: "Customer not found", statusCode: 404 };
      }
      const passwordMatch = await bcrypt.compare(password, customer.password);
      if (!passwordMatch) {
        return { message: "Invalid credentials", statusCode: 401 };
      }
      const secretKey = process.env.SECRET_KEY as Secret;
      const token = jwt.sign(
        {
          customerId: customer._id,
          role: customer.role,
          status: customer.status,
        },
        secretKey,
        {
          expiresIn: "1h",
        }
      );
      const expirationTime = new Date(Date.now() + 60 * 60 * 1000);

      //check if the session already exists
      let session = await Session.findOne({ customerId: customer._id });
      if (session) {
        // If a session already exists, update
        session.isActive = true;
        session.expiresAt = expirationTime;
      } else {
        // create a new session if not exists
        session = new Session({
          customerId: customer._id,
          isActive: true,
          expiresAt: expirationTime,
        });
      }

      await session.save();

      // Redis session
      await createSessionInRedis(customer._id, {
        customerId: customer._id,
        isActive: true,
        expiresAt: expirationTime,
      });
      return { message: "Login successful", token, statusCode: 200 };
    } catch (error) {
      return { message: "Error logging in", error, statusCode: 500 };
    }
  }

  static async logoutUser(customerId: string) {
    try {
      // Update the session to mark it as inactive
      await Session.updateOne(
        {
          customerId,
          isActive: true,
        },
        { isActive: false }
      );
      await markSessionAsInactiveInRedis(customerId);

      return { message: "Logged out successfully", statusCode: 200 };
    } catch (error) {
      return { message: "Error while logging out", statusCode: 500 };
    }
  }

  static async getUserProfile(customerId: string) {
    try {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return { message: USERMSG.CUSTOMER_NOT_FOUND, statusCode: 404 };
      }
      return {
        email: customer.email,
        full_name: customer.full_name,
        phone: customer.phone,
        role: customer.role,
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      return { message: USERMSG.ERROR_RETRIEVE_PROFILE, statusCode: 500 };
    }
  }

  static async updateUserProfile(customerId: string,full_name: string,phone: number) {
    const updateObject: any = { full_name };
    if (phone) {
      updateObject.phone = phone;
    }
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateObject,
      { new: true }
    );
    return updatedCustomer;
  }

  static async checkUserExists(payload: any) {
    return await Customer.findOne(payload);
  }
}
