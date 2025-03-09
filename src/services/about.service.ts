import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { about_db_to_front } from '../mappers/about.mappars';
import { About } from '../models/about.models';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async getAbout() {
    try {
      return this.prisma.personal_information
        .findMany()
        .then((res) => about_db_to_front(res));
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateAbout(about: About) {
    try {
      for (let i = 1; i <= 2; i++) {
        await this.prisma.personal_information.update({
          where: {
            id: i,
          },
          data: {
            information: i === 1 ? about.fr : about.en,
          },
        });
      }

      return this.getAbout();
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
