import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'node:path';
import * as sharp from 'sharp';
import * as fs from 'node:fs';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async getAllImages(pageId: number) {
    try {
      const images = await this.prisma.images.findMany({
        select: {
          id: true,
        },
        where: {
          page: Number(pageId),
        },
      });

      return await Promise.all(
        images.map(async (image) => {
          const description = await this.prisma.publication_desc.findFirst({
            where: {
              publicationId: image.id,
            },
          });
          return { ...image, description: description?.description };
        }),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendImage(id: string) {
    try {
      const image = await this.prisma.images.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!image) {
        throw new HttpException('Image non trouvée', HttpStatus.NOT_FOUND);
      }

      const PATH_IMG = process.env.PATH_IMG as string;
      return path.join(PATH_IMG, 'img', String(image.page), String(image.name));
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendImageBlur(id: string) {
    try {
      const image = await this.prisma.images.findFirst({
        where: {
          id: Number(id),
        },
      });

      if (!image || !image.name) {
        throw new HttpException('Image non trouvée', HttpStatus.NOT_FOUND);
      }

      const nameWithBlur = `${image.name.split('.')[0]}.blur.${image.name.split('.')[1]}`;
      const PATH_IMG = process.env.PATH_IMG as string;
      const imagePath = path.join(
        PATH_IMG,
        'img',
        String(image.page),
        String(image.name),
      );

      // Vérification si l'image floutée existe déjà
      const blurredImagePath = path.join(
        PATH_IMG,
        'img',
        String(image.page),
        nameWithBlur,
      );

      if (!fs.existsSync(blurredImagePath)) {
        // Si l'image floutée n'existe pas, créer une version floutée
        await sharp(imagePath).resize(25, 25).blur().toFile(blurredImagePath);
      }

      return blurredImagePath;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDescription(imageId: string, description: string) {
    try {
      const publication_desc = await this.prisma.publication_desc.findFirst({
        where: {
          publicationId: Number(imageId),
        },
      });

      if (publication_desc) {
        await this.prisma.publication_desc.update({
          where: {
            id: publication_desc.id,
          },
          data: {
            description,
          },
        });
      } else {
        await this.prisma.publication_desc.create({
          data: {
            publicationId: Number(imageId),
            description,
          },
        });
      }

      return { message: 'Description mise à jour' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
