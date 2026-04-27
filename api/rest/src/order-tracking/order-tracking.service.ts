// order-tracking/order-tracking.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderTrackingDto } from './dto/create-order-tracking.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { GetOrderTrackingDto, OrderTrackingPaginator } from './dto/get-order-tracking.dto';
import { OrderTracking, TrackingStatus } from './entities/order-tracking.entity';

@Injectable()
export class OrderTrackingService {
  // Mock data - replace with actual database calls using TypeOrmModule in real implementation
  private trackings: OrderTracking[] = [];
  private idCounter = 1;

  async create(createOrderTrackingDto: CreateOrderTrackingDto): Promise<OrderTracking> {
    const tracking = new OrderTracking();
    tracking.id = this.idCounter++;
    tracking.order_id = createOrderTrackingDto.order_id;
    tracking.tracking_number = createOrderTrackingDto.tracking_number;
    tracking.carrier = createOrderTrackingDto.carrier;
    tracking.current_location = createOrderTrackingDto.current_location;
    tracking.estimated_delivery_date = createOrderTrackingDto.estimated_delivery_date;
    tracking.notes = createOrderTrackingDto.notes;
    tracking.status = TrackingStatus.PENDING;
    tracking.last_updated = new Date();
    tracking.created_at = new Date();
    tracking.updated_at = new Date();

    this.trackings.push(tracking);
    return tracking;
  }

  async findAll(query: GetOrderTrackingDto): Promise<OrderTrackingPaginator> {
    let filtered = [...this.trackings];

    // Apply filters
    if (query.order_id) {
      filtered = filtered.filter(t => t.order_id === query.order_id);
    }

    if (query.status) {
      filtered = filtered.filter(t => t.status === query.status);
    }

    if (query.search) {
      const search = query.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.tracking_number?.toLowerCase().includes(search) ||
        t.carrier?.toLowerCase().includes(search) ||
        t.current_location?.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    filtered.sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const limit = query.limit || 15;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const data = filtered.slice(skip, skip + limit);

    return {
      data,
      paging: {
        total: filtered.length,
        limit,
        page,
      },
    };
  }

  async findOne(id: number): Promise<OrderTracking> {
    const tracking = this.trackings.find(t => t.id === id);
    if (!tracking) {
      throw new NotFoundException(`Order tracking with ID ${id} not found`);
    }
    return tracking;
  }

  async findByOrderId(orderId: number): Promise<OrderTracking> {
    const tracking = this.trackings.find(t => t.order_id === orderId);
    if (!tracking) {
      throw new NotFoundException(`Tracking for order ID ${orderId} not found`);
    }
    return tracking;
  }

  async update(id: number, updateOrderTrackingDto: UpdateOrderTrackingDto): Promise<OrderTracking> {
    const tracking = await this.findOne(id);

    if (updateOrderTrackingDto.status !== undefined) {
      tracking.status = updateOrderTrackingDto.status;
    }

    if (updateOrderTrackingDto.current_location) {
      tracking.current_location = updateOrderTrackingDto.current_location;
    }

    if (updateOrderTrackingDto.notes) {
      tracking.notes = updateOrderTrackingDto.notes;
    }

    if (updateOrderTrackingDto.updated_by) {
      tracking.updated_by = updateOrderTrackingDto.updated_by;
    }

    if (updateOrderTrackingDto.tracking_details) {
      tracking.tracking_details = updateOrderTrackingDto.tracking_details;
    }

    if (updateOrderTrackingDto.actual_delivery_date) {
      tracking.actual_delivery_date = updateOrderTrackingDto.actual_delivery_date;
    }

    tracking.last_updated = new Date();
    tracking.updated_at = new Date();
    return tracking;
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const index = this.trackings.findIndex(t => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Order tracking with ID ${id} not found`);
    }
    this.trackings.splice(index, 1);
    return { success: true, message: 'Order tracking deleted successfully' };
  }

  async updateStatus(id: number, status: TrackingStatus, staffId: number, notes?: string): Promise<OrderTracking> {
    const tracking = await this.findOne(id);
    tracking.status = status;
    tracking.updated_by = staffId;
    tracking.last_updated = new Date();
    tracking.updated_at = new Date();

    if (notes) {
      tracking.notes = notes;
    }

    // Auto-set delivery date if delivered
    if (status === TrackingStatus.DELIVERED) {
      tracking.actual_delivery_date = new Date();
    }

    return tracking;
  }
}
