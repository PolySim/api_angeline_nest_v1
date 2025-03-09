import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PagesService } from '../services/pages.service';
import { Page } from '../models/pages.models';

@Controller('api/pages')
export class PagesControllers {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  getPages() {
    return this.pagesService.getPages();
  }

  @Get(':id')
  getPage(@Query('id') id: number) {
    return this.pagesService.getPage(id);
  }

  @Post()
  createPage(@Body() page: Partial<Page>) {
    return this.pagesService.createPage(page);
  }

  @Put()
  updatePage(@Body() page: Page) {
    return this.pagesService.updatePage(page);
  }

  @Delete(':id')
  deletePage(@Param('id') id: number) {
    return this.pagesService.deletePage(id);
  }

  @Put('reorder')
  reorderPages(@Body() indexes: number[]) {
    return this.pagesService.reorderPages(indexes);
  }
}
