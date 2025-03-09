import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PagesControllers } from './controllers/pages.controllers';
import { PagesService } from './services/pages.service';
import { AboutControllers } from './controllers/about.controllers';
import { AboutService } from './services/about.service';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, PagesControllers, AboutControllers],
  providers: [AppService, PagesService, AboutService],
})
export class AppModule {}
