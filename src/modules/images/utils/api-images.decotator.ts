import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

// 업로드할 이미지 형식을 설정하기 위한 커스텀 데코레이터
export const ApiImages = (fieldName: string = 'image') => {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })
  );
};
