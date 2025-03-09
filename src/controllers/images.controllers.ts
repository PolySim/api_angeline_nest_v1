import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ImagesService } from '../services/images.service';
import { Response } from 'express';

@Controller('api/images')
export class ImagesControllers {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async findImages(@Query('num') pageId: string) {
    const id = parseInt(pageId, 10);
    if (isNaN(id)) {
      throw new HttpException('ID invalide', HttpStatus.BAD_REQUEST);
    }
    return this.imagesService.getAllImages(id);
  }

  @Get(':id')
  async sendImage(@Param('id') id: string, @Res() res: Response) {
    return res.sendFile(await this.imagesService.sendImage(id));
  }

  @Get(':id/blur')
  async sendImageBlur(@Param('id') id: string, @Res() res: Response) {
    return res.sendFile(await this.imagesService.sendImageBlur(id));
  }

  @Post('update_description')
  async createDescription(
    @Query('imageId') id: string,
    @Query('description') description: string,
  ) {
    return this.imagesService.updateDescription(id, description);
  }

  @Put('update_description')
  async updateDescription(
    @Query('imageId') id: string,
    @Query('description') description: string,
  ) {
    return this.imagesService.updateDescription(id, description);
  }
}
