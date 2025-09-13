import { Types } from "mongoose";

export interface IEvent {
  user: Types.ObjectId;
  title: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  status: "active" | "closed";
  date: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}