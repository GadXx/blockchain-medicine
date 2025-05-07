import { Request, Response, NextFunction } from "express"
import { Clinic, Doctor } from "../models/Clinic";

export function isAdmin(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (req: Request, res: Response, next: NextFunction) {
    if (req.userId !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return originalMethod.apply(this, arguments);
  };
}

export function isClinic(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
    const clinic = await Clinic.findById(req.userId);
    if(!clinic) {
      return res.status(401).json({ error: "Is not a clinic" });
    }
    if(clinic.verified == false) {
      return res.status(401).json({ error: "Is not a verified clinic" });
    }
    return originalMethod.apply(this, arguments);
  };
}

export function isDoctor(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (req: Request, res: Response, next: NextFunction) {
    const user = Doctor.findById(req.userId);
    if(!user) {
      return res.status(401).json({ error: "Is not a doctor" });
    }
    return originalMethod.apply(this, arguments);
  };
}

export function isVerifiedClinic(target: any, key: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
    const clinic = await Clinic.findById(req.userId);
    console.log(clinic);
    console.log(req.userId);
    
    
    if(!clinic) {
      return res.status(401).json({ error: "Is not a clinic" });
    }
    if(clinic.verified == false) {
      return res.status(401).json({ error: "Is not a verified clinic" });
    }
    return originalMethod.apply(this, arguments);
  };
}