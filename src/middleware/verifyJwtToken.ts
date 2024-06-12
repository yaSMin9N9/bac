import { Response, Request, NextFunction } from "express";
import jsonWebToken, { JwtPayload } from "jsonwebtoken";
import config from "config";

const accessTokenSecret = config.get<string>("accessTokenSecret");

const verifyJwtToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    req.headers.authorization ||
    (req.headers.Authorization as string | undefined);
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  jsonWebToken.verify(token, accessTokenSecret, (error, decoded) => {
    if (error) return res.status(401).json({ message: "Unauthorized" });
    if (decoded) {
      const data = decoded as JwtPayload;
      const id = data.userInfo.id;
      const role = data.userInfo.role;
      req.id = id;
      req.role = role;
    }
    next();
  });
};

export default verifyJwtToken;
