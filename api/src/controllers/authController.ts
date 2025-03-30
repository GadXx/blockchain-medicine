import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { isPatient } from '../middleware/authDecorators';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, phone, password } = req.body;
      const result = await this.authService.registerUser(email, phone, password);
      if (!result) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await this.authService.loginUser(identifier, password);
      if (result) {       
        res.status(200).json({ token: result });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  @isPatient
  public async verifycationUser(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.authService.verifycationUser(req.userId!);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}