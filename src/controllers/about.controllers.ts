import { Body, Controller, Get, Put } from '@nestjs/common';
import { AboutService } from '../services/about.service';
import { About } from '../models/about.models';

@Controller('api/about')
export class AboutControllers {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  getAbout() {
    return this.aboutService.getAbout();
  }

  @Put()
  updateAbout(@Body() about: About) {
    return this.aboutService.updateAbout(about);
  }
}
