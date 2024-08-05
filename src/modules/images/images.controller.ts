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

@ApiTags('이미지')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  // 이미지 업로드 API
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @UseInterceptors(FilesInterceptor('image'))
  @ApiImages('image') // 업로드할 이미지 형식을 설정하기 위한 커스텀 데코레이터
  @Post()
  async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
    // 필요한 최대 이미지 수를 정해서 imagesService에서 가져다 사용
    // 만약 사용자 프로필 사진이면 1로 수정
    // 만약 공연 등록 이미지라면 여러장에 대한 이미지를 업로드 하고
    // 반환되는 URL를 공연 등록 시 배열 형태로 DTO에 전달
    return await this.imagesService.uploadImage(files, 5);
  }
}
