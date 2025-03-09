import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Page } from '../models/pages.models';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all pages without 'portraits', 'publications' and 'portfolio'
   */
  async getPages() {
    try {
      return this.prisma.pages.findMany({
        where: {
          display: 1,
          id: {
            gt: 3,
          },
        },
        orderBy: {
          sort: 'asc',
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a page by id
   * @param id
   */
  async getPage(id: number) {
    try {
      return this.prisma.pages.findFirst({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPage(page: Partial<Page>) {
    try {
      const max = await this.prisma.pages
        .aggregate({
          _max: {
            sort: true,
            id: true,
          },
        })
        .then((res) => res._max);
      page = {
        ...page,
        sort: max.sort ? max.sort + 1 : 1,
        display: 1,
        id: max.id ? max.id + 1 : 1,
      };
      const newPage = await this.prisma.pages.create({
        data: page as Page,
      });

      const PATH_IMG = process.env.PATH_IMG as string;
      const imagePath = path.join(PATH_IMG, 'img', String(newPage.id));

      if (!fs.existsSync(imagePath)) {
        fs.mkdirSync(imagePath, { recursive: true });
      }

      return newPage;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updatePage(page: Page) {
    try {
      return await this.prisma.pages.update({
        where: {
          id: page.id,
        },
        data: page,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePage(id: number) {
    try {
      const page = await this.prisma.pages.delete({
        where: {
          id: Number(id),
        },
      });

      if (!page) {
        throw new HttpException('Page introuvable', HttpStatus.NOT_FOUND);
      }

      await this.prisma.images.deleteMany({
        where: { page: page.id },
      });

      const PATH_IMG = process.env.PATH_IMG as string;
      const imagePath = path.join(PATH_IMG, 'img', String(page.id));

      if (fs.existsSync(imagePath)) {
        fs.rmSync(imagePath, { recursive: true, force: true });
      }

      return { message: `Page ${page.id} supprimée avec succès.` };
    } catch (error) {
      console.error('error in deletePage', error.message);
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reorderPages(indexes: number[]) {
    try {
      let i = 4;
      for (const index of indexes) {
        await this.prisma.pages.update({
          where: {
            id: index,
          },
          data: {
            sort: i,
          },
        });
        i++;
      }
      
      return { message: 'Pages réordonnées avec succès.' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
