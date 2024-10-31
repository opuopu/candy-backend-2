import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { candyServices } from "./candy.service";
const insertCandyAddressIntoDb = catchAsync(
  async (req: Request, res: Response) => {
    const result = await candyServices.insertCandyAddressIntoDb(
      req.user.userId,
      req.body
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Candy address inserted successfully.",
      data: result,
    });
  }
);

const getAllCandyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await candyServices.getAllCandyAddress(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Candy address retrived successfully.",
    data: result,
  });
});
const getAllCandy = catchAsync(async (req: Request, res: Response) => {
  const result = await candyServices.getAllCandy();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Candy address retrived successfully.",
    data: result,
  });
});
const getMyCandyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await candyServices.getMyCandyAddress(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Candy address retrived successfully.",
    data: result,
  });
});
const updateCandyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await candyServices.updateCandyAddress(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Candy address updated successfully.",
    data: result,
  });
});
const deleteCandyAddress = catchAsync(async (req: Request, res: Response) => {
  const result = await candyServices.deleteCandyAddress(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Candy address deleted successfully.",
    data: result,
  });
});

export const candyControllers = {
  insertCandyAddressIntoDb,
  getAllCandyAddress,
  updateCandyAddress,
  deleteCandyAddress,
  getAllCandy,
  getMyCandyAddress,
};
