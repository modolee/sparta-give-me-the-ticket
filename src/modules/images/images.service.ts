import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';

@Injectable()
export class ImagesService {
  s3: S3;

  // S3 설정
  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      },
    });
  }

  // 이미지를 S3에 업로드
  async imageUploadToS3(
    fileName: string, // 업로드될 파일의 이름
    file: Express.Multer.File, // 업로드할 파일
    ext: string // 파일 확장자
  ) {
    try {
      // AWS S3에 이미지 업로드 명령을 생성
      // 파일 이름, 파일 버퍼, 파일 접근 권한, 파일 타입 등을 설정
      const command = new PutObjectCommand({
        Bucket: this.configService.get('AWS_BUCKET'), // S3 버킷 이름
        Key: fileName, // 업로드될 파일의 이름
        Body: file.buffer, // 업로드할 파일
        ACL: 'public-read', // 파일 접근 권한
        ContentType: `image/${ext}`, // 파일 타입
      });

      // 생성된 명령을 S3에 전달하여 이미지 업로드
      await this.s3.send(command);
      // 업로드된 이미지의 URL을 반환
      return `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com/${process.env.AWS_BUCKET}/${fileName}`;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException(
        '파일 업로드가 실패했습니다. 관리자에게 문의해 주세요.'
      );
    }
  }

  // 사용자가 입력한 이미지 데이터를 받아서 S3에 전달 (이미지 업로드)
  async uploadImage(files: Express.Multer.File[], maxFilesLength: number) {
    if (files.length === 0) {
      throw new BadRequestException('이미지를 입력해 주세요.');
    }

    if (files.length > maxFilesLength) {
      throw new BadRequestException(`${maxFilesLength}장 이하로 업로드 가능합니다.`);
    }

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

    // 오늘 날짜 구하기
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();
    const date = `${currentYear}-${currentMonth}-${currentDate}`;

    const imageUrls: object[] = [];

    await Promise.all(
      files.map(async (file) => {
        // 임의번호 생성
        let randomNumber: string = '';
        for (let i = 0; i < 8; i++) {
          randomNumber += String(Math.floor(Math.random() * 10));
        }

        // 확장자 검사
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
          throw new BadRequestException(
            '허용된 확장자가 아닙니다. (.png, .jpg, .jpeg, .bmp, .gif)'
          );
        }

        const imageName = `ticketing/${date}_${randomNumber}`;
        const ext = file.originalname.split('.').pop();

        const imageUrl = await this.imageUploadToS3(`${imageName}.${ext}`, file, ext);
        imageUrls.push({ imageUrl });
      })
    );

    return imageUrls;
  }

  // 트랜젝션 실패 시 S3에 등록된 이미지 롤백
  // 트랜젝션의 catch부분에서 실행
  // 매개변수로는 이미지 URL 배열을 전달
  async rollbackS3Image(images: string[]) {
    for (const image of images) {
      const existingImageKey = await this.extractKeyFromUrl(image);
      if (existingImageKey) {
        await this.deleteImage(existingImageKey);
      }
    }
  }

  // URL에서 S3 Key 추출
  async extractKeyFromUrl(url: string) {
    const urlParts = url.split('/');
    // URL의 마지막 부분이 key값
    const key = urlParts.slice(4).join('/');
    return key;
  }

  // S3에 등록된 이미지 삭제
  async deleteImage(key: string) {
    try {
      const params = {
        Bucket: this.configService.get('AWS_BUCKET'),
        Key: key,
      };

      // S3에 접근해서 해당 이미지 객체 삭제
      await this.s3.deleteObject(params);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }
}
