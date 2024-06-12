import bcrypt from "bcrypt";
import config from "config";
import mongoose from "mongoose";
export type AdminRole =
  | "admin"
  | "superAdmin"  
  | "designer"
  | "advisor"
  | "arbitrator";

export interface AdminType {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  image: string;
  role: AdminRole;
}

export interface AdminDocument extends AdminType, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    image: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true, versionKey: false }
);

adminSchema.pre("save", async function (next) {
  const admin = this as AdminDocument;
  if (!admin.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(
    parseInt(config.get<string>("saltWorkFactor"))
  );
  const hash = await bcrypt.hash(admin.password, salt);
  admin.password = hash;
  return next();
});

adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const admin = this as AdminDocument;
  try {
    const result = await bcrypt.compare(candidatePassword, admin.password);
    return result;
  } catch (error) {
    return false;
  }
};

const AdminModel = mongoose.model<AdminDocument>("Admin", adminSchema);

export default AdminModel;
