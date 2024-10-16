import { User } from "./user.model";
import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import { userServices } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import { storeFile } from "../../utils/fileHelper";
const insertuserIntoDb = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    req.body.image = storeFile("profile", req?.file?.filename);
  }
  const result = await userServices.inserUserIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "An otp sent to your email.",
    data: result,
  });
});

const getme = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getme(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user retrived successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    req.body.image = storeFile("profile", req?.file?.filename);
  }
  const result = await userServices.updateProfile(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user profile updated successfully",
    data: result,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllusers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "users retrived successfully",
    data: result,
  });
});
const getsingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrived successfully",
    data: result,
  });
});
const updateUser = catchAsync(async (req: Request, res: Response) => {
  if (req?.file) {
    req.body.image = storeFile("profile", req?.file?.filename);
  }
  const result = await userServices.updateUser(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteAccount(
    req?.user?.userId,
    req?.body?.password
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const userControllers = {
  insertuserIntoDb,
  getme,
  updateProfile,
  getAllUsers,
  getsingleUser,
  updateUser,
  deleteAccount,
};
