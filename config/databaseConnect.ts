import mongoose from "mongoose";
import log from "../src/utils/logger";
import config from "config";

const databaseConnect = async () => {
  const databaseUri = config.get<string>("dbUri");
  try {
    await mongoose.connect(databaseUri)
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
};

export default databaseConnect;
