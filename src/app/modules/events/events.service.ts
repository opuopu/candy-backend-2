import { PipelineStage } from 'mongoose';
import { Event } from './events.model';

const insertEventIntoDb = async (payload: any) => {
  const result = await Event.create(payload);
  return result;
};

const getAllEvents = async (query: Partial<any>) => {
  const pipeline: PipelineStage[] = [];

  const latitude = parseFloat(query?.latitude);
  const longitude = parseFloat(query?.longitude);
  if (!isNaN(latitude) && !isNaN(longitude)) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude], // [lng, lat]
        },
        key: 'location',
        maxDistance: 500 * 1000, // 500 km in meters
        distanceField: 'dist.calculated',
        spherical: true,
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    },
  });

  pipeline.push({ $match: { isDeleted: false } });

  pipeline.push({ $unwind: '$user' });

  pipeline.push({
    $project: {
      title: 1,
      description: 1,
      address: 1,
      location: 1,
      date: 1,
      status: 1,
      'user.email': 1,
      'user.name': 1,
      'user.image': 1,
      dist: 1,
    },
  });

  return await Event.aggregate(pipeline);
};
const getSingleEvents = async (id: string) => {
  const result = await Event.findById(id);
  return result;
};

const updateEvents = async (id: string, payload: any) => {
  const result = Event.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteEvents = async (id: string) => {
  const result = await Event.findByIdAndDelete(id);
  return result;
};

const eventServices = {
  insertEventIntoDb,
  getAllEvents,
  getSingleEvents,
  updateEvents,
  deleteEvents,
};

export default eventServices;
