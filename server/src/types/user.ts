import { Document, Model } from 'mongoose';

/**
 * Main User interface representing Mongoose Document fields.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema instance methods signatures.
 */
export interface IUserMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

/**
 * User Model type binding IUser schema and instance methods.
 */
export type UserModel = Model<IUser, {}, IUserMethods>;
