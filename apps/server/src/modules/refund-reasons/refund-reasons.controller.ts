import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { RefundReasonsService } from './refund-reasons.service';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import { GetRefundReasonDto } from './dto/get-refund-reasons.dto';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Refund Reasons')
@Controller('refund-reasons')
export class RefundReasonsController {
    constructor(private refundReasonsService: RefundReasonsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a refund reason' })
    @ApiResponse({ status: 201, description: 'Refund reason created successfully' })
    createRefund(@Body() createRefundReasonDto: CreateRefundReasonDto) {
        return this.refundReasonsService.create(createRefundReasonDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all refund reasons' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'language', required: false })
    @ApiResponse({ status: 200, description: 'Refund reasons retrieved successfully' })
    findAll(@Query() query: GetRefundReasonDto) {
        return this.refundReasonsService.findAllRefundReasons(query);
    }

    @Get(':param')
    @ApiOperation({ summary: 'Get a refund reason by slug or ID' })
    @ApiParam({ name: 'param', description: 'Slug or ID of the refund reason' })
    @ApiQuery({ name: 'language', required: false })
    @ApiResponse({ status: 200, description: 'Refund reason retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Refund reason not found' })
    getRefund(
        @Param('param') param: string,
        @Query('language') language: string,
    ) {
        return this.refundReasonsService.getRefundReason(param, language);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a refund reason' })
    @ApiParam({ name: 'id', description: 'ID of the refund reason' })
    @ApiResponse({ status: 200, description: 'Refund reason updated successfully' })
    @ApiResponse({ status: 404, description: 'Refund reason not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRefundReasonDto: UpdateRefundReasonDto,
    ) {
        return this.refundReasonsService.update(id, updateRefundReasonDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a refund reason' })
    @ApiParam({ name: 'id', description: 'ID of the refund reason' })
    @ApiResponse({ status: 200, description: 'Refund reason deleted successfully' })
    @ApiResponse({ status: 404, description: 'Refund reason not found' })
    deleteRefund(@Param('id', ParseIntPipe) id: number) {
        return this.refundReasonsService.remove(id);
    }
}