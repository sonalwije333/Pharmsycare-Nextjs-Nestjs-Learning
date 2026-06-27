import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SupportTicket,
  SupportTicketStatus,
} from './entities/support-ticket.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { GetSupportTicketsDto } from './dto/get-support-tickets.dto';
import { ReplySupportTicketDto } from './dto/update-support-ticket.dto';
import { User } from '../users/entities/user.entity';
import { Permission } from '../common/enums/enums';

export interface SupportTicketPaginator {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SupportTicketStats {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  total: number;
}

function isStaff(user?: User): boolean {
  if (!user?.permissions) return false;
  return [
    Permission.SUPER_ADMIN,
    Permission.BRANCH_OWNER,
    Permission.STAFF,
  ].some((role) => user.permissions.includes(role));
}

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
  ) {}

  async create(
    dto: CreateSupportTicketDto,
    user?: User,
  ): Promise<SupportTicket> {
    const name = dto.name || user?.name || 'Customer';
    const email = dto.email || user?.email || 'unknown@pharmsy.local';

    const ticket = this.ticketRepository.create({
      customer_id: user?.id ?? null,
      name,
      email,
      phone: dto.phone ?? null,
      subject: dto.subject,
      category: dto.category,
      message: dto.message,
      channel: dto.channel,
      order_id: dto.order_id ?? null,
      status: SupportTicketStatus.OPEN,
      responses: [],
    });

    return this.ticketRepository.save(ticket);
  }

  async findAll(
    query: GetSupportTicketsDto,
    user?: User,
  ): Promise<SupportTicketPaginator> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .orderBy('ticket.created_at', 'DESC');

    if (!isStaff(user)) {
      qb.andWhere('ticket.customer_id = :customerId', { customerId: user?.id });
    }

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('ticket.category = :category', { category: query.category });
    }
    if (query.search) {
      qb.andWhere(
        '(ticket.subject LIKE :search OR ticket.name LIKE :search OR ticket.email LIKE :search OR ticket.message LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async getStats(): Promise<SupportTicketStats> {
    const [open, inProgress, resolved, closed] = await Promise.all([
      this.ticketRepository.count({
        where: { status: SupportTicketStatus.OPEN },
      }),
      this.ticketRepository.count({
        where: { status: SupportTicketStatus.IN_PROGRESS },
      }),
      this.ticketRepository.count({
        where: { status: SupportTicketStatus.RESOLVED },
      }),
      this.ticketRepository.count({
        where: { status: SupportTicketStatus.CLOSED },
      }),
    ]);

    return {
      open,
      in_progress: inProgress,
      resolved,
      closed,
      total: open + inProgress + resolved + closed,
    };
  }

  async findOne(id: number, user?: User): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
    if (!isStaff(user) && ticket.customer_id !== user?.id) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
    return ticket;
  }

  async addReply(
    id: number,
    dto: ReplySupportTicketDto,
    user?: User,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }

    const staffReply = isStaff(user);
    const responses = ticket.responses ?? [];
    responses.push({
      message: dto.message,
      responder: user?.name || (staffReply ? 'Pharmacist' : 'Customer'),
      responder_role: staffReply ? 'pharmacist' : 'customer',
      created_at: new Date().toISOString(),
    });
    ticket.responses = responses;

    if (dto.status) {
      ticket.status = dto.status;
    } else if (staffReply && ticket.status === SupportTicketStatus.OPEN) {
      ticket.status = SupportTicketStatus.IN_PROGRESS;
    }

    return this.ticketRepository.save(ticket);
  }

  async updateStatus(
    id: number,
    status: SupportTicketStatus,
  ): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Support ticket ${id} not found`);
    }
    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }
}
