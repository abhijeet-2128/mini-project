import { Request, ResponseToolkit } from "@hapi/hapi";
import bcrypt from "bcrypt";
import { Customer, UserStatus } from "../models/customers";
import dotenv from "dotenv";
import Session from "../models/sessions";
import nodemailer from "nodemailer";
import { UserService } from "../services/users.services";
import redis from "../middleware/redis.session";
import { httpResponse } from "../utils/http.codes";
import { USERRESPONSE } from "../utils/user.response";
const httpresponse=new httpResponse()

dotenv.config();

export class UserController {
  //------------------- User signup ------------
  static async signup(request: Request, h: ResponseToolkit) {
    try {
      const payload = request.payload as {
        email: string;
        password: string;
        full_name: string;
        phone: string;
      };
      const result = await UserService.signupUser(payload);
      if(result) httpresponse.sendResponse(h,USERRESPONSE.REGISTER_USER,result);
      return h.response({ message: result.message }).code(result.statusCode);
    } catch (error) {
      return h.response({ message: "Error signing up", error }).code(500);
    }
  }

  //------------------- User login ------------------------
  static async login(request: Request, h: ResponseToolkit) {
    try {
      const payload = request.payload as {
        email: string;
        password: string;
      };
      const result = await UserService.loginUser(payload);
      return h
        .response({ message: result.message, token: result.token })
        .code(result.statusCode);
    } catch (error) {
      return h.response({ message: "Error logging in", error }).code(500);
    }
  }

  //--------------------- user logout -------------
  static async logout(request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const result = await UserService.logoutUser(customerId);
      return h.response({ message: result.message }).code(result.statusCode);
    } catch (error) {
      return h.response({ message: "Error while logging out" });
    }
  }

  // ----------get User profile---------------
  static async getProfile(request: Request, h: ResponseToolkit) {
    try {
      const customerId: any = request.auth.credentials.customerId;
      const result = await UserService.getUserProfile(customerId);
      return h.response(result).code(result.statusCode);
    } catch (error: any) {
      console.log(error);
      return h.response({ message: "Error retrieving profile" }).code(500);
    }
  }



  //---------------update profile---------
  static async updateProfile (request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const { full_name, phone }:any= request.payload;      
      if (!full_name) {
        return h
          .response({ message: "Missing required field: full_name" })
          .code(400);
      }
      const updatedCustomer:any = await UserService.updateUserProfile(
        customerId,
        full_name,
        phone
      );
      if (!updatedCustomer) {
        return h.response({ message: "Customer not found" }).code(404);
      }
      return h
        .response({
          email: updatedCustomer.email,
          full_name: updatedCustomer.full_name,
          phone: updatedCustomer.phone,
          role: updatedCustomer.role,
        })
        .code(200);
    } catch (error) {
      console.log(error);
      return h.response({ message: "Error updating profile" }).code(500);
    }
  };

  //--------delete profile----------------
  static async  deleteProfile (request: Request, h: ResponseToolkit) {
    try {
      const customerId = request.auth.credentials.customerId as string;
      const session = await Session.findOne({ customerId });
      if (!session || !session.isActive) {
        return h
          .response({ message: "Session is inactive or not found" })
          .code(401);
      }
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return h.response({ message: "Customer not found" }).code(404);
      }
      customer.status = UserStatus.DELETED;
      await customer.save();
      return h.response({ message: "Customer deleted successfully" }).code(200);
    } catch (error) {
      console.log(error);
      return h
        .response({ message: "Error deleting customer profile" })
        .code(500);
    }
  };

  // forget password
  static async forgetPassword(request: Request, h: ResponseToolkit){
    try {
      const { email }: any = request.payload;
      const user = await Customer.findOne({ email });
      if (!user) {
        return h.response({ message: "Email not found" }).code(404);
      }
      let OTP = Math.floor(1000 + Math.random() * 2000);
      redis.set(email, OTP);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      console.log(process.env.EMAIL);
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset Request",
        text: ` You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n YOUR RESET PASSWORD OTP IS: ${OTP}\n\n If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      await transporter.sendMail(mailOptions);
      console.log("Email sent");
      return h.response({ message: "OTP sent successfully" }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: "Something went wrong" }).code(500);
    }
  };

  // reset password
  static async resetPassword  (request: Request, h: ResponseToolkit) {
    const { email, otp, newPassword }: any = request.payload;
    const redisOTP = await redis.get(email);

    if (redisOTP == otp) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const update = await Customer.findOneAndUpdate(
        { email: email },
        {
          $set: { password: hashedPassword },
        }
      );
      if (update) {
        await redis.del(email);
        return h.response({
          message: "Password has been reset successfully",
        });
      }
    } else {
      return h.response({
        message: "Invalid Otp",
      });
    }
  };

  //view all users
  static async getAllUsers (request: Request, h: ResponseToolkit){
    try {
      const users = await Customer.aggregate([
        {
          $project: {
            _id: 0,
            userId: "$_id",
            email: 1,
            full_name: 1,
            role: 1,
            created_at: 1,
            updated_at: 1,
          },
        },
      ]);
      return h.response(users).code(404);
    } catch (error: any) {
      console.log(error);
      return h.response({ message: "Error retrieving users" }).code(500);
    }
  };

  //update user role
  static async updateUserRole (request: Request, h: ResponseToolkit) {
    try {
      const userId = request.params.userId;
      const role: any = request.payload;
      const updatedUser = await Customer.findByIdAndUpdate(userId, role, {
        new: true,
      });

      if (!updatedUser) {
        return h.response({ message: "User not found" }).code(404);
      }
      return h.response(updatedUser).code(200);
    } catch (error) {
      console.error("Error updating user role:", error);
      return h.response({ message: "Error updating user role" }).code(500);
    }
  };
}
