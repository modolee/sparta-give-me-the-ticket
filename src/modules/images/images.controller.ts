import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Roles } from '../auth/utils/roles.decorator';
import { Role } from 'src/commons/types/users/user-role.type';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiImages } from './utils/api-images.decotator';
import { MulterExceptionFilter } from './utils/upload-image-exception.filter';

@ApiTags('이미지')
@Controller('images')

export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 이미지 업로드 API
  // 왜 초기화 될까?
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FilesInterceptor('image', 1))
  @ApiImages('image')
  @Post()
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    return await this.imagesService.uploadImage(files);
  }
}
