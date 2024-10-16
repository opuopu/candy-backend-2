import { Model, ObjectId } from "mongoose";

interface location {
  coordinate: number[];
  type: string;
}

export interface TCandy {
  address: string;
  location: location;
  date: string;
  status: "active" | "closed";
  isDeleted: boolean;
  user: ObjectId;
  longitude?: string;
  latitude?: string;
  maxDistance?: string;
}

export interface TCandyModel extends Model<TCandy> {
  isCandyExistWithSameDate(userId: string, date: string): Promise<TCandy>;
}
