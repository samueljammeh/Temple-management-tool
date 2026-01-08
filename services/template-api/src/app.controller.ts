import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { status: 'ok', service: 'template-api' };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
