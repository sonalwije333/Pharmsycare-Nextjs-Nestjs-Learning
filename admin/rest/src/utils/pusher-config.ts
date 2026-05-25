// Enable pusher logging - don't include this in production
import Pusher from 'pusher-js';
import { getBearerToken } from '@/utils/auth-utils';

const token = getBearerToken() ?? '';

if (process.env.NEXT_PUBLIC_PUSHER_DEV_MOOD === 'true') {
  Pusher.logToConsole = true;
}

// you can include your custom configuration options
let option = {};

export const PusherConfig = new Pusher(
  `${process.env.NEXT_PUBLIC_PUSHER_APP_KEY}`,
  {
    ...option,
    cluster: `${process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER}`,
    authEndpoint: `${process.env.NEXT_PUBLIC_BROADCAST_AUTH_URL}`,
    // forceTLS: true,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        'Access-Control-Allow-Origin': '*',
        Accept: 'application/json',
      },
    },
  }
);

if (process.env.NEXT_PUBLIC_API_BROADCAST_DRIVER !== 'pusher') {
  PusherConfig.disconnect();
} else {
  if (process.env.NEXT_PUBLIC_PUSHER_ENABLED !== 'true') {
    PusherConfig.disconnect();
  }
}
