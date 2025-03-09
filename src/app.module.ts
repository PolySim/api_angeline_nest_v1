import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PagesControllers } from './controllers/pages.controllers';
import { PagesService } from './services/pages.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, PagesControllers],
  providers: [AppService, PagesService],
})
export class AppModule {}
