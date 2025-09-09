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
import { RefundPoliciesService } from './refund-policies.service';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('Refund Policies')
@Controller('refund-policies')
export class RefundPoliciesController {
    constructor(private refundPoliciesService: RefundPoliciesService) {}

    @Post()
    @ApiOperation({ summary: 'Create a refund policy' })
    @ApiResponse({ status: 201, description: 'Refund policy created successfully' })
    createRefund(@Body() createRefundPolicyDto: CreateRefundPolicyDto) {
        return this.refundPoliciesService.create(createRefundPolicyDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all refund policies' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'language', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiResponse({ status: 200, description: 'Refund policies retrieved successfully' })
    findAll(@Query() query: GetRefundPolicyDto) {
        return this.refundPoliciesService.findAllRefundPolicies(query);
    }

    @Get(':param')
    @ApiOperation({ summary: 'Get a refund policy by slug or ID' })
    @ApiParam({ name: 'param', description: 'Slug or ID of the refund policy' })
    @ApiQuery({ name: 'language', required: false })
    @ApiResponse({ status: 200, description: 'Refund policy retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Refund policy not found' })
    getRefund(
        @Param('param') param: string,
        @Query('language') language: string,
    ) {
        return this.refundPoliciesService.getRefundPolicy(param, language);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a refund policy' })
    @ApiParam({ name: 'id', description: 'ID of the refund policy' })
    @ApiResponse({ status: 200, description: 'Refund policy updated successfully' })
    @ApiResponse({ status: 404, description: 'Refund policy not found' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRefundDto: UpdateRefundPolicyDto,
    ) {
        return this.refundPoliciesService.update(id, updateRefundDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a refund policy' })
    @ApiParam({ name: 'id', description: 'ID of the refund policy' })
    @ApiResponse({ status: 200, description: 'Refund policy deleted successfully' })
    @ApiResponse({ status: 404, description: 'Refund policy not found' })
    deleteRefund(@Param('id', ParseIntPipe) id: number) {
        return this.refundPoliciesService.remove(id);
    }
}