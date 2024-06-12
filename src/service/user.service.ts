import UserModel, { UserDocument, UserType } from "../models/user.model";
import axios from "axios";
import config from "config";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import qs from "qs";

const client_id = config.get<string>("googleCLientId");
const client_secret = config.get<string>("googleCLientSecret");
const redirect_uri = config.get<string>("googleOAuthRedirectUrl");

export const createUser = async (input: UserType) => {
  try {
    return await UserModel.create(input);
  } catch (error) {
    throw new Error(error as any);
  }
};

export async function getGoogleOAuthTokens({ code }: { code: string }) {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("حدث خطأ ما, يرجى المحاولة لاحقاً");
  }
}

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}) {
  const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("حدث خطأ ما, يرجى المحاولة لاحقاً");
  }
}

export async function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions = {}
) {
  return UserModel.findOneAndUpdate(query, update, options);
}
