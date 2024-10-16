import { ObjectId } from "mongodb";
import { Model } from "mongoose";
export interface TUser {
  [x: string]: any;
  id: string;
  email: string;
  designation: string;
  password: string;
  phoneNumber?: string;
  name: string;
  isVerified:boolean
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: "candyGiver"|"children";
  isDeleted: boolean;
  image?: string;
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  IsUserExistbyId(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
