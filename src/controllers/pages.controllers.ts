import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  getPage(@Param('id') id: string) {
    return this.pagesService.getPage(Number(id));
  }

  @Post()
  createPage(@Body() page: Partial<Page>) {
    return this.pagesService.createPage(page);
  }

  @Put()
  updatePage(
    @Body()
    page: {
      id: number;
      title: string;
      article: string;
      status: boolean;
    },
  ) {
    return this.pagesService.updatePage(page);
  }

  @Delete(':id')
  deletePage(@Param('id') id: number) {
    return this.pagesService.deletePage(id);
  }

  @Put('reorder')
  reorderPages(@Body() body: { reports: number[] }) {
    return this.pagesService.reorderPages(body.reports);
  }
}
