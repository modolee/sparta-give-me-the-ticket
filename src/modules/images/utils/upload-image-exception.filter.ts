import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';
import { Response, Request } from 'express';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  getMulterErrorMessage(exception: MulterError): string {
    switch (exception.code) {
      case 'LIMIT_PART_COUNT':
        return '필드와 파일 수의 총합이 너무 많습니다.';
      case 'LIMIT_FILE_SIZE':
        return '파일 용량이 너무 큽니다.';
      case 'LIMIT_FILE_COUNT':
        return '파일 수가 너무 많습니다.';
      case 'LIMIT_FIELD_KEY':
        return '필드의 이름이 너무 깁니다.';
      case 'LIMIT_FIELD_VALUE':
        return '필드의 값이 너무 깁니다.';
      case 'LIMIT_FIELD_COUNT':
        return '필드가 너무 많습니다.';
      case 'LIMIT_UNEXPECTED_FILE':
        return '지원하지 않은 파일입니다.';
      default:
        return '파일 업로드 중 오류가 발생했습니다.';
    }
  }

  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;

    const message = this.getMulterErrorMessage(exception);

    response.status(status).json({ status, message });
  }
}
