import { Injectable, Logger } from '@nestjs/common';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { ReorderRequest } from '../reorder-requests/entities/reorder-request.entity';

@Injectable()
export class ReorderNotificationService {
  private readonly logger = new Logger(ReorderNotificationService.name);

  async sendReorderAlert(
    supplier: Supplier,
    reorder: ReorderRequest,
  ): Promise<{ emailLog: string; contactLog: string }> {
    const subject = `Reorder request: ${reorder.product_name}`;
    const body = [
      `Dear ${supplier.company_name},`,
      '',
      'A product in our pharmacy inventory needs to be reordered.',
      '',
      `Product: ${reorder.product_name}`,
      `SKU: ${reorder.sku ?? 'N/A'}`,
      `Current stock: ${reorder.current_quantity}`,
      `Requested quantity: ${reorder.requested_quantity}`,
      `Request ID: #${reorder.id}`,
      '',
      'Please confirm availability and expected delivery date.',
      '',
      'PharmSy-Care Inventory System',
    ].join('\n');

    const emailTarget = supplier.contact_email;
    const emailLog = await this.dispatchEmail(emailTarget, subject, body);
    const contactLog = this.buildContactMessage(supplier, reorder, body);

    return { emailLog, contactLog };
  }

  private async dispatchEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<string> {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'noreply@pharmsy-care.local';

    if (smtpHost && smtpUser && smtpPass) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({ from, to, subject, text: body });
        return `Email sent to ${to} at ${new Date().toISOString()}`;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`SMTP send failed: ${message}`);
        return `Email failed for ${to}: ${message}`;
      }
    }

    this.logger.warn(
      `SMTP not configured. Reorder email queued for ${to}: ${subject}`,
    );
    return `Email queued (SMTP not configured) to ${to} at ${new Date().toISOString()}`;
  }

  private buildContactMessage(
    supplier: Supplier,
    reorder: ReorderRequest,
    body: string,
  ): string {
    const phone = supplier.contact_phone ? ` | Phone: ${supplier.contact_phone}` : '';
    return `Contact message prepared for ${supplier.company_name}${phone}\n${body}`;
  }
}
