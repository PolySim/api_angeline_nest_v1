import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PagesControllers } from './controllers/pages.controllers';
import { PagesService } from './services/pages.service';
import { AboutControllers } from './controllers/about.controllers';
import { AboutService } from './services/about.service';
import { ImagesControllers } from './controllers/images.controllers';
import { ImagesService } from './services/images.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AppController,
    PagesControllers,
    AboutControllers,
    ImagesControllers,
  ],
  providers: [AppService, PagesService, AboutService, ImagesService],
})
export class AppModule {}
