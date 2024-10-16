import httpStatus from "http-status";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import moment from "moment";
import config from "../../config";
import AppError from "../../error/AppError";
import { sendEmail } from "../../utils/mailSender";
import { generateOtp } from "../../utils/otpGenerator";
import { User } from "../user/user.model";

const verifyOtp = async (token: string, otp: string | number) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "you are not authorized!");
  }
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "session has expired.please try to submit otp withing 1 minute"
    );
  }

  const user = await User.findById(decode?.id).select("verification isVerified");
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "user not found");
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "otp has expired. Please resend it"
    );
  }
  if (Number(otp) !== Number(user?.verification?.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, "otp did not match");
  }

  const updateUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        status: user?.isVerified === false ? true : user?.isVerified,
        verification: {
          otp: 0,
          expiresAt: moment().add(3, "minute"),
          status: true,
        },
      },
    },
    { new: true }
  );
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "3m",
  });
  return { user: updateUser, token: jwtToken };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "user not found");
  }
  const otp = generateOtp();
  const expiresAt = moment().add(2, "minute");
  const updateOtp = await User.findByIdAndUpdate(user?._id, {
    $set: {
      verification: {
        otp,
        expiresAt,
        status: false,
      },
    },
  });
  if (!updateOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "failed to resend otp. please try again later"
    );
  }
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "2m",
  });
  await sendEmail(
    user?.email,
    "Your One Time Otp",
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
  return { token };
};

export const otpServices = {
  verifyOtp,
  resendOtp,
};
