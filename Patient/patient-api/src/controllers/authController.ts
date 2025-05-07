import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

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
        res.status(201).json({ success: false, message: 'User already exists' });
        return;
      }
      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await this.authService.loginUser(identifier, password);
      if (result) {       
        res.status(200).json(result);
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public async verifycationUser(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      await this.authService.verifycationUser(req.userId!, code);
      res.status(200).json({ success: true, message: 'User verified successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}