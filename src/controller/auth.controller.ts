import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../business/auth.service';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'login' })
  @ApiResponse({ status: 201, description: 'Token successfully generated' })
  @ApiResponse({ status: 301, description: 'Bad credentials.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123!' },
      },
    },
  })
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}