import bcrypt from "bcrypt";
import config from "config";
import mongoose from "mongoose";

export interface UserType {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  image: string;
  isVerified?: boolean;
}

export interface UserDocument extends UserType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    image: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(
    parseInt(config.get<string>("saltWorkFactor"))
  );
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  return next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  try {
    const result = await bcrypt.compare(candidatePassword, user.password);
    return result;
  } catch (error) {
    return false;
  }
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
