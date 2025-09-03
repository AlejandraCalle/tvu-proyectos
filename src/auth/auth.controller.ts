import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { correo: string; contraseña: string }) {
    const user = await this.authService.validateUser(body.correo, body.contraseña);
    return this.authService.login(user);
  }
}
