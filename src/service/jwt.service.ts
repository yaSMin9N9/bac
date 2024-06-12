import config from "config";
import { sign } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import { AdminRole } from "../models/admin.model";

const accessTokenSecret = config.get<string>("accessTokenSecret");
const refreshTokenSecret = config.get<string>("refreshTokenSecret");

export const cookieMaxAge = 60 * 24 * 60 * 60 * 1000;

export const signJwtCookie = (userInfo: {
  id: ObjectId;
  role: AdminRole | "user";
}) => {
  const accessToken = sign(
    {
      userInfo,
    },
    accessTokenSecret,
    { expiresIn: "3d" }
  );
  const refreshToken = sign(
    {
      userInfo,
    },
    refreshTokenSecret,
    { expiresIn: "60d" }
  );
  return { refreshToken, accessToken };
};
