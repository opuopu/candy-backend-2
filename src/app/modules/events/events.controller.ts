import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import eventServices from './events.service';

const insertEventIntoDb = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  data['user'] = req.user.userId;
  const result = await eventServices.insertEventIntoDb(data);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Event created successfully.',
    data: result,
  });
});

const getAllEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await eventServices.getAllEvents(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Events retrieved successfully.',
    data: result,
  });
});

const getSingleEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventServices.getSingleEvents(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event retrieved successfully.',
    data: result,
  });
});

const updateEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventServices.updateEvents(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event updated successfully.',
    data: result,
  });
});

const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventServices.deleteEvents(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Event deleted successfully.',
    data: result,
  });
});

const eventControllers = {
  insertEventIntoDb,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};

export default eventControllers;
