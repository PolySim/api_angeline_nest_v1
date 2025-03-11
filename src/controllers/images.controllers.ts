import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from '../services/images.service';
import { Express, Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('api/images')
export class ImagesControllers {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('all/:pageId')
  async findImages(@Param('pageId') pageId: string) {
    const id = Number(pageId);
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
    @Body() data: { description: string; imageId: string },
  ) {
    return this.imagesService.updateDescription(data.imageId, data.description);
  }

  @Post('upload_image/:pageId')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadImage(
    @Param('pageId') pageId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.imagesService.uploadImage({ pageId: Number(pageId), files });
  }

  @Delete('delete_image')
  async deleteImage(@Body() body: { image_id: number; report_id: number }) {
    return this.imagesService.deleteImage(body.image_id, body.report_id);
  }

  @Put('reorder')
  async reorderImages(@Body() body: { images: { id: number }[] }) {
    return this.imagesService.reorderImages(body.images);
  }
}
