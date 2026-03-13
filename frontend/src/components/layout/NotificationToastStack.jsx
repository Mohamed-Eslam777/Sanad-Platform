import { AnimatePresence } from 'framer-motion';
import Toast from '../common/Toast';

/**
 * Notification type → Toast type mapping.
 * Maps socket notification event types to the generic Toast type API.
 */
const NOTIF_TYPE_MAP = {
  request_accepted: 'success',
  request_completed: 'success',
  new_message: 'info',
};

/**
 * NotificationToastStack
 *
 * Renders the fixed toast stack in the bottom-left corner.
 * Receives `toasts` from NotificationContext and dismisses them via `onDismiss`.
 *
 * Props:
 *   toasts    — array of notification objects from the socket
 *   onDismiss — (id: string) => void
 */
export default function NotificationToastStack({ toasts, onDismiss }) {
  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-4 z-[101] flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: '340px' }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            id={t.id}
            type={NOTIF_TYPE_MAP[t.type] ?? 'info'}
            title={t.title}
            body={t.body}
            onClose={() => onDismiss(t.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
