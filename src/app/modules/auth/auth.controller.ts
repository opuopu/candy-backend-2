import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authServices } from "./auth.service";
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.login(req.body);
  const { refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: result,
  });
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.changePassword(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "password changed successfully",
    data: result,
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.forgotPassword(req?.body?.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "An otp sent to your email!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.resetPassword(
    req?.headers?.token as string,
    req?.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token is retrieved successfully",
    data: result,
  });
});
export const authControllers = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
