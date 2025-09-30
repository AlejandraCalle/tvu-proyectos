import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: { correo: string; contraseña: string }) {
    const user = await this.authService.validateUser(body.correo, body.contraseña);
    return this.authService.login(user);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req,
    @Body() body: { current: string; nueva: string }
  ) {
    const userId = req.user.id_usuario; // <--- aquí estaba el error
    return this.authService.changePassword(userId, body.current, body.nueva);
  }

}
