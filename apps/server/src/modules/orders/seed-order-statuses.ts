import { DataSource } from 'typeorm';
import { OrderStatus } from './entities/order-status.entity';

export const seedOrderStatuses = async (dataSource: DataSource) => {
  const orderStatusRepository = dataSource.getRepository(OrderStatus);

  // Check if order statuses already exist
  const count = await orderStatusRepository.count();
  if (count > 0) {
    console.log('Order statuses already seeded');
    return;
  }

  const orderStatuses = [
    {
      name: 'Pending',
      slug: 'pending',
      serial: 1,
      color: '#FFA500',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Processing',
      slug: 'processing',
      serial: 2,
      color: '#2563EB',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Completed',
      slug: 'completed',
      serial: 3,
      color: '#10B981',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Cancelled',
      slug: 'cancelled',
      serial: 4,
      color: '#EF4444',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Refunded',
      slug: 'refunded',
      serial: 5,
      color: '#8B5CF6',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Failed',
      slug: 'failed',
      serial: 6,
      color: '#DC2626',
      language: 'en',
      translated_languages: ['en'],
    },
    {
      name: 'Out for delivery',
      slug: 'out-for-delivery',
      serial: 7,
      color: '#F59E0B',
      language: 'en',
      translated_languages: ['en'],
    },
  ];

  const entities = orderStatusRepository.create(orderStatuses);
  await orderStatusRepository.save(entities);

  console.log('✅ Order statuses seeded successfully');
};
