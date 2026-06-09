import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'breaking' | 'live' | 'summary' | 'article';
  link?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: () => number;
}

const mockNotifs: AppNotification[] = [
  { id: '1', title: 'ÚLTIMO MINUTO', body: 'Importantes anuncios en materia económica desde el Palacio de Miraflores.', time: 'Hace 5 min', read: false, type: 'breaking', link: '/article/a14' },
  { id: '2', title: '🔴 EN VIVO', body: 'Comienza Los Mediodías de La Iguana con William Castillo.', time: 'Hace 30 min', read: false, type: 'live', link: '/programs/p1' },
  { id: '3', title: 'Resumen AM', body: 'Las 5 noticias más importantes para comenzar tu día informado.', time: 'Hace 2 h', read: true, type: 'summary' },
  { id: '4', title: 'Nuevo en Deportes', body: '¡Goleada histórica! La Vinotinto brilla en casa.', time: 'Hace 4 h', read: true, type: 'article', link: '/article/a26' },
  { id: '5', title: 'Pérez Pirela Opina', body: 'Nuevo análisis disponible: La desesperación imperial.', time: 'Hace 1 día', read: true, type: 'article', link: '/article/a9' },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: mockNotifs,
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
