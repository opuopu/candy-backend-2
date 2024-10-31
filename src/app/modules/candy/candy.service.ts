import { PipelineStage } from "mongoose";
import { TCandy } from "./candy.interface";
import { Candy } from "./candy.model";

const insertCandyAddressIntoDb = async (userId: string, payload: TCandy) => {
  // check same user in same date
  // const iscandyExistWithSameDate = await Candy.isCandyExistWithSameDate(
  //   userId,
  //   payload.date
  // );

  // if (iscandyExistWithSameDate) {
  //   throw new AppError(
  //     httpStatus.CONFLICT,
  //     "Candy already exist with same date"
  //   );
  // }

  // format data
  const formatData = {
    ...payload,
    user: userId,
  };

  const result = await Candy.create(formatData);
  return result;
};

const getAllCandyAddress = async (query: Partial<TCandy>) => {
  const pipeline: PipelineStage[] = [];
  console.log("query");

  if (query?.latitude && query?.longitude) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [
            parseFloat(query?.longitude),
            parseFloat(query?.latitude),
          ],
          // coordinates: [90.42308159679541, 23.77634120911962],
        },
        key: "location",
        query: {},
        maxDistance:
          parseFloat(query?.maxDistance ?? (10000 as unknown as string)) * 1609,
        distanceField: "dist.calculated",
        spherical: true,
      },
    });
  }

  //  lookup
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  });
  pipeline.push({
    $match: {
      isDeleted: false,
    },
  });
  pipeline.push({
    $unwind: "$user",
  });

  pipeline.push({
    $project: {
      address: 1,
      location: 1,
      date: 1,
      status: 1,
      "user.email": 1,
      "user.image": 1,
      "user.name": 1,
    },
  });
  console.log(pipeline);
  const result = await Candy.aggregate(pipeline);
  return result;
};

const getMyCandyAddress = async (id: string) => {
  const result = await Candy.find({ user: id });
  return result;
};

const updateCandyAddress = async (id: string, payload: Partial<TCandy>) => {
  const result = await Candy.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteCandyAddress = async (id: string) => {
  const result = await Candy.findByIdAndUpdate(id, { isDeleted: true });
  return result;
};

export const candyServices = {
  insertCandyAddressIntoDb,
  getAllCandyAddress,
  updateCandyAddress,
  deleteCandyAddress,
  getMyCandyAddress,
};
