import { Request, Response } from 'express';
import { UserService } from '../services/authService';
import { isDoctor, isPatient } from '../middleware/authDecorators';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async register(req: Request, res: Response) {
    try {
      const { email, phone, password } = req.body;
      const result = await this.userService.register(email, phone, password);
      if (!result) {
        res.status(400).json({ success: false, message: 'User already exists' });
      }
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await this.userService.login(identifier, password);
      if (result) {       
        res.status(200).json(result);
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  @isPatient
  public async getMe(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.getMe(req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  
  @isDoctor
  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const { userID } = req.params;
      const result = await this.userService.getUserByID(userID);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  @isPatient
  public async verifycationUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.verifycationUser(req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}