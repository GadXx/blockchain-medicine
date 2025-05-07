import { Request, Response, NextFunction } from "express"
import { User, IUser } from "../models/User";

export function isVerifiedPatient(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
    const user = await User.findById(req.userId);
    if(!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if(user.verified == false) {
      return res.status(401).json({ error: "Is not a verified user" });
    }
    return originalMethod.apply(this, arguments);
  };
}
