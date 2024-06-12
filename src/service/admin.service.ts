import AdminModel, { AdminType } from "../models/admin.model";

export const createUser = async (input: AdminType) => {
  try {
    return await AdminModel.create(input);
  } catch (error) {
    throw new Error(error as any);
  }
};
