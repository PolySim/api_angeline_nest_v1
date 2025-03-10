import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as path from 'node:path';
import * as sharp from 'sharp';
import * as fs from 'node:fs';
import { Express } from 'express';
import { ImageDb } from '../models/image.models';

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
        orderBy: {
          number: 'asc',
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

  async uploadImage({
    pageId,
    files,
  }: {
    pageId: number;
    files: Express.Multer.File[];
  }) {
    try {
      const numberMax = await this.prisma.images
        .aggregate({
          where: {
            page: pageId,
          },
          _max: {
            number: true,
          },
        })
        .then((res) => res._max.number ?? 0);

      const PATH_IMG = process.env.PATH_IMG as string;
      const directoryPath = path.join(PATH_IMG, 'img', String(pageId));
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      let images: ImageDb[] = [];
      for (let i = 1; i <= files.length; i++) {
        const file = files[i - 1];

        let filePath = path.join(directoryPath, file.originalname);

        let counter = 1;
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        while (fs.existsSync(filePath)) {
          filePath = `${baseName}-${counter}${ext}`;
          filePath = path.join(directoryPath, filePath);
          counter++;
        }

        await sharp(file.buffer).toFile(filePath);

        const image = await this.prisma.images.create({
          data: {
            name:
              counter === 1
                ? file.originalname
                : `${baseName}-${counter - 1}${ext}`,
            page: pageId,
            number: numberMax + i,
          },
        });

        images = [...images, image];
      }

      return images;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImage(imageId: number, pageId: number) {
    try {
      const imageName = await this.prisma.images
        .findFirst({
          where: {
            id: imageId,
          },
        })
        .then((res) => res?.name);

      if (!imageName) {
        console.error('Image non trouvée');
        throw new HttpException('Image non trouvée', HttpStatus.NOT_FOUND);
      }

      await this.prisma.publication_desc.deleteMany({
        where: {
          publicationId: imageId,
        },
      });

      await this.prisma.images.deleteMany({
        where: {
          id: imageId,
        },
      });

      const PATH_IMG = process.env.PATH_IMG as string;
      const imagePath = path.join(PATH_IMG, 'img', String(pageId), imageName);
      const blurName = `${imageName.split('.')[0]}.blur.${imageName.split('.')[1]}`;
      const imagePathBlur = path.join(
        PATH_IMG,
        'img',
        String(pageId),
        blurName,
      );

      if (fs.existsSync(imagePath)) {
        fs.rmSync(imagePath, { recursive: true, force: true });
      }
      if (fs.existsSync(imagePathBlur)) {
        fs.rmSync(imagePathBlur, { recursive: true, force: true });
      }
      return {
        delete: 'success',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async reorderImages(images: { id: number }[]) {
    try {
      let i = 1;
      for (const image of images) {
        await this.prisma.images.update({
          where: {
            id: image.id,
          },
          data: {
            number: i,
          },
        });
        i++;
      }

      return {
        reorder: 'success',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erreur interne du serveur',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
