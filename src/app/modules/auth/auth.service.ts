import jwt, { JwtPayload, Secret } from "jsonwebtoken";

import bcrypt from "bcrypt";
import httpStatus from "http-status";
import moment from "moment";
import config from "../../config";
import AppError from "../../error/AppError";
import { sendEmail } from "../../utils/mailSender";
import { generateOtp } from "../../utils/otpGenerator";
import { User } from "../user/user.model";
import { TchangePassword, Tlogin, TresetPassword } from "./auth.interface";
import { createToken, verifyToken } from "./auth.utils";
const login = async (payload: Tlogin) => {
  const user = await User.isUserExist(payload?.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (user?.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, "password do not match");
  }
  const jwtPayload = {
    userId: user?._id,
    role: user?.role,
    branch: user?.branch,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );
  // const htmlPath = path.join(__dirname, "../../../../public2.html");
  // fs.readFile(htmlPath, "utf8", async (err, htmlContent) => {
  //   if (err) {
  //     return console.error("Error reading the HTML file:", err);
  //   }

  //   const template = handlebars.compile(htmlContent);
  //   const replacements = {
  //     date: "2024-2023-11",
  //   };
  //   const htmlToSend = template(replacements);
  //   // Define the email options

  //   await sendEmail(payload?.email, "hello from udum", htmlToSend);
  //   // Send the email
  // });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
// change password

const changePassword = async (id: string, payload: TchangePassword) => {
  const user = await User.IsUserExistbyId(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Old password do not match!");
  }
  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and confirm password do not match!"
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    },
    { new: true }
  );

  return result;
};
// forgot password

const forgotPassword = async (email: string) => {
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found ");
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user?.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "your account is inactive");
  }
  const jwtPayload = {
    email: email,
    id: user?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "2m",
  });
  const currentTime = new Date();
  const otp = generateOtp();
  const expiresAt = moment(currentTime).add(2, "minute");
  await User.findByIdAndUpdate(user?._id, {
    verification: {
      otp,
      expiresAt,
    },
  });
  await sendEmail(
    email,
    "your reset password otp is:",
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <h2 style="color: #70B228; text-align: center;">Your One Time OTP</h2>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; color: #013B23; text-align: center; margin-bottom: 20px;">Your OTP Is:</p>
        <p style="font-size: 24px; color: #70B228; text-align: center; font-weight: bold; margin: 10px 0;">${otp}</p>
        <p style="font-size: 14px; color: #666; text-align: center;">This OTP is valid until:</p>
        <p style="font-size: 14px; color: #013B23; text-align: center; font-weight: bold;">${expiresAt.toLocaleString()}</p>
    </div>
</div>
`
  );
  // send the mail here
  return { email, token };
};

const resetPassword = async (token: string, payload: TresetPassword) => {
  console.log(token, payload);
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Session has exipired. please try again"
    );
  }
  const user = await User.findById(decode?.id).select("isDeleted verification");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(httpStatus.FORBIDDEN, "sessions expired");
  }
  if (!user?.verification?.status) {
    throw new AppError(httpStatus.FORBIDDEN, "Otp is not verified yet!");
  }
  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and Confirm password do not match!"
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  const result = await User.findByIdAndUpdate(decode?.id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    verification: {
      otp: 0,
      status: false,
    },
  });
  return result;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { userId } = decoded;
  const user = await User.IsUserExistbyId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }
  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};
export const authServices = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
