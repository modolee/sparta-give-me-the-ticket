import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradesService } from './trades.service';
import { update } from 'lodash';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { User } from 'src/entities/users/user.entity';
import { number } from 'joi';
import { TestDto } from './dto/test-dto';
import { MESSAGES } from 'src/commons/constants/trades/messages';

//constants
import { SWAGGER } from 'src/commons/constants/trades/swagger.constant';

//swagger
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiAcceptedResponse,
  ApiNoContentResponse,
  ApiMovedPermanentlyResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiNotAcceptableResponse,
  ApiRequestTimeoutResponse,
  ApiConflictResponse,
  ApiTooManyRequestsResponse,
  ApiGoneResponse,
  ApiPayloadTooLargeResponse,
  ApiUnsupportedMediaTypeResponse,
  ApiUnprocessableEntityResponse,
  ApiInternalServerErrorResponse,
  ApiNotImplementedResponse,
  ApiBadGatewayResponse,
  ApiServiceUnavailableResponse,
  ApiGatewayTimeoutResponse,
  ApiDefaultResponse,
} from '@nestjs/swagger';
import { Role } from 'src/commons/types/users/user-role.type';

@ApiTags(SWAGGER.TRADES.TRADES_API_TAGS)
@ApiBearerAuth()
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  //테스트 메서드==============================

  @Get('/hello')
  @ApiOperation({
    summary: SWAGGER.TRADES.HELLO.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.HELLO.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({ description: 'hello를 출력합니다' })
  @UseGuards(AuthGuard('jwt'))
  async hello(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.hello(user.id);
  }

  @Get('/test')
  @ApiOperation({
    summary: SWAGGER.TRADES.TEST.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.TEST.API_OPERATION.DESCRIPTION,
  })
  @ApiOkResponse({
    description: '실행이 완료되면 bbbbbbbbbbbbbbbbbbbbbbbb를 출력합니다',
  })
  async test(@Body() testDto: TestDto) {
    console.log('AAAAAAAAAAAAAAAAA');
    return await this.tradesService.test();
  }

  @Get('/change-role')
  @ApiOperation({
    summary: SWAGGER.TRADES.CHANGE_ROLE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CHANGE_ROLE.API_OPERATION.DESCRIPTION,
  })
  @ApiNoContentResponse({ description: '유저의 계정이 변경됩니다' })
  @UseGuards(AuthGuard('jwt'))
  async changeRole(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.changeRole(user.id);
  }

  @Get('/schedule/:scheduleId')
  @ApiOperation({
    summary: SWAGGER.TRADES.CHANGE_REMAIN_SEAT.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CHANGE_REMAIN_SEAT.API_OPERATION.DESCRIPTION,
  })
  async changRemainSeat(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return await this.tradesService.changRemainSeat(scheduleId);
  }

  //테스트 메서드========================================================

  //중고 거래 로그 종회
  @Get('tradelogs')
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_TRADE_LOGS.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_TRADE_LOGS.API_OPERATION.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'))
  async getLogs(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.getLogs(user.id);
  }

  //중고 거래 목록 조회
  @Get()
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_TRADE_LIST.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_TRADE_LIST.API_OPERATION.DESCRIPTION,
  })
  async getList() {
    return await this.tradesService.getList();
  }

  //중고 거래 생성
  @Post()
  @ApiOperation({
    summary: SWAGGER.TRADES.CREATE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.CREATE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'))
  async createTrade(@Body() createTradeDto: CreateTradeDto, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTrade(createTradeDto, user.id);
  }

  //중고 거래 상세 조회
  @Get('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.GET_DETAILED_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.GET_DETAILED_TRADE.API_OPERATION.DESCRIPTION,
  })
  async getTradeDetail(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }
  //첫 주솟값을 param으로 받는 콘트롤러 메서드

  //중고 거래 수정
  @Patch('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.UPDATE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.UPDATE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'))
  async updateTrade(
    @Param('tradeId', ParseIntPipe) tradeId: number,
    @Body() updateTradeDto: UpdateTradeDto,
    @Req() req: { user: User }
  ) {
    const user = req.user;
    return await this.tradesService.updateTrade(tradeId, updateTradeDto, user.id);
  }

  //중고 거래 삭제
  @Delete('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.DELETE_TRADE.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.DELETE_TRADE.API_OPERATION.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'))
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    await this.tradesService.deleteTrade(tradeId, user.id);
    return { message: MESSAGES.TRADES.SUCCESSFULLY_DELETE.TRADE };
  }

  //중고 거래 구매
  @Post('/:tradeId')
  @ApiOperation({
    summary: SWAGGER.TRADES.PURCHASE_TICKET.API_OPERATION.SUMMARY,
    description: SWAGGER.TRADES.PURCHASE_TICKET.API_OPERATION.DESCRIPTION,
  })
  @UseGuards(AuthGuard('jwt'))
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTicket(tradeId, user.id);
  }
}
