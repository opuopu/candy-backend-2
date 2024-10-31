import { PipelineStage } from "mongoose";
import { TCandy } from "./candy.interface";
import { Candy } from "./candy.model";
import { AnyBulkWriteOperation } from "mongodb";

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
  console.log(result);
  return result;
};

const getAllCandyAddress = async (query: Partial<any>) => {
  // Remove invalid latitude and longitude
  if (
    query.latitude === "0.0" ||
    query.latitude === "null" ||
    query.latitude === null ||
    isNaN(parseFloat(query.latitude))
  ) {
    delete query.latitude; // Remove invalid latitude
  }

  if (
    query.longitude === "0.0" ||
    query.longitude === "null" ||
    query.longitude === null ||
    isNaN(parseFloat(query.longitude))
  ) {
    delete query.longitude; // Remove invalid longitude
  }

  const pipeline: PipelineStage[] = [];

  // Only add the $geoNear stage if latitude and longitude are valid
  const latitude = parseFloat(query?.latitude);
  const longitude = parseFloat(query?.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    pipeline.push({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        key: "location",
        maxDistance: 16090000, // Adjust this as needed
        distanceField: "dist.calculated",
        spherical: true,
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    },
  });

  pipeline.push({ $match: { isDeleted: false } });
  pipeline.push({ $unwind: "$user" });

  pipeline.push({
    $project: {
      address: 1,
      location: 1,
      date: 1,
      status: 1,
      "user.email": 1,
      "user.name": 1,
      "user.image": 1,
    },
  });

  const batchSize = 100; // Define batch size
  let skip = 0;
  const validResults = [];

  while (true) {
    try {
      const result = await Candy.aggregate([
        ...pipeline,
        { $skip: skip },
        { $limit: batchSize },
      ]);

      if (result.length === 0) break; // Exit if no more results

      for (const doc of result) {
        try {
          JSON.stringify(doc); // Trigger UTF-8 encoding check
          validResults.push(doc); // Push valid documents only
        } catch (error) {
          console.log("Problematic document:", doc); // Log the problematic document
          console.warn("Skipping document with UTF-8 error:", error);
        }
      }
      skip += batchSize;
    } catch (error) {
      console.error("Critical error in aggregation:", error);
      break; // Stop further processing if a critical error occurs
    }
  }

  console.log(validResults.length, "length");
  return validResults;
};

const getAllCandy = async () => {
  const result = await Candy.find({}, { enableUtf8Validation: true });
  const countDocument = await Candy.countDocuments(result);
  return {
    result,
    countDocument,
  };
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
  getAllCandy,
  updateCandyAddress,
  deleteCandyAddress,
  getMyCandyAddress,
};
