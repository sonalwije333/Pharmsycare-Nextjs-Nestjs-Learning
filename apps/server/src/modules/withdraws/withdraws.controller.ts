import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { WithdrawsService } from './withdraws.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/auth/auth.guard';
import { Roles } from '../../common/decorators/role.decorator';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PermissionType } from '../../common/enums/PermissionType.enum';

@ApiTags('Withdraws')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/withdraws')
export class WithdrawsController {
    constructor(private readonly withdrawsService: WithdrawsService) {}

    @Post()
    @Roles(PermissionType.STORE_OWNER)
    @ApiOperation({ summary: 'Create withdraw request', description: 'Creates a new withdraw request. Requires store owner privileges.' })
    @ApiResponse({ status: 201, description: 'Withdraw request created successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    createWithdraw(@Body() createWithdrawDto: CreateWithdrawDto) {
        return this.withdrawsService.create(createWithdrawDto);
    }

    @Get()
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get all withdraws', description: 'Retrieves a list of all withdraw requests with pagination and filtering.' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
    @ApiQuery({ name: 'shop_id', required: false, type: Number, description: 'Filter by shop ID' })
    @ApiQuery({ name: 'status', required: false, enum: ['Approved', 'Pending', 'On hold', 'Rejected', 'Processing'], description: 'Filter by status' })
    @ApiResponse({ status: 200, description: 'Withdraws retrieved successfully', type: WithdrawPaginator })
    async withdraws(@Query() query: GetWithdrawsDto): Promise<WithdrawPaginator> {
        return this.withdrawsService.getWithdraws(query);
    }

    @Get(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER, PermissionType.STAFF)
    @ApiOperation({ summary: 'Get withdraw by ID', description: 'Retrieves a specific withdraw request by its ID.' })
    @ApiParam({ name: 'id', description: 'Withdraw ID' })
    @ApiResponse({ status: 200, description: 'Withdraw retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Withdraw not found' })
    withdraw(@Param('id') id: string) {
        return this.withdrawsService.findOne(+id);
    }

    @Post(':id/approve')
    @Roles(PermissionType.SUPER_ADMIN)
    @ApiOperation({ summary: 'Approve withdraw request', description: 'Approves or updates a withdraw request. Requires super admin privileges.' })
    @ApiParam({ name: 'id', description: 'Withdraw ID' })
    @ApiResponse({ status: 200, description: 'Withdraw approved/updated successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Withdraw not found' })
    approveWithdraw(
        @Param('id') id: string,
        @Body() updateWithdrawDto: ApproveWithdrawDto,
    ) {
        return this.withdrawsService.update(+id, updateWithdrawDto);
    }

    @Delete(':id')
    @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
    @ApiOperation({ summary: 'Delete withdraw request', description: 'Deletes a withdraw request. Store owners can only delete their own requests.' })
    @ApiParam({ name: 'id', description: 'Withdraw ID' })
    @ApiResponse({ status: 200, description: 'Withdraw deleted successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Withdraw not found' })
    deleteWithdraw(@Param('id') id: string) {
        return this.withdrawsService.remove(+id);
    }
}