import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo | undefined;
    }
}

// Initialize Pusher
window.Pusher = Pusher;

// Initialize Laravel Echo only if Pusher credentials are available
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
if (pusherKey) {
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: pusherKey,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        encrypted: true,
    });
}

export default window.Echo;
