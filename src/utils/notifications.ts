import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications no está soportado en Expo Go desde SDK 53.
// Para evitar el warning de importación, lo cargamos perezoso y SOLO fuera
// de Expo Go. En Expo Go todas estas funciones son no-op.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');

let cached: NotificationsModule | null | undefined;

function getNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (cached !== undefined) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
  } catch (e) {
    if (__DEV__) console.warn('[notifications] expo-notifications no disponible', e);
    cached = null;
  }
  return cached;
}

let handlerConfigured = false;

export function configureNotificationHandler() {
  if (handlerConfigured) return;
  const N = getNotifications();
  if (!N) return;
  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
    handlerConfigured = true;
  } catch (e) {
    if (__DEV__) console.warn('[notifications] setNotificationHandler failed', e);
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted || current.ios?.status === N.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    if (!current.canAskAgain) return false;
    const req = await N.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: false },
    });
    return req.granted;
  } catch (e) {
    if (__DEV__) console.warn('[notifications] permission check failed', e);
    return false;
  }
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  const N = getNotifications();
  if (!N) return;
  try {
    await N.setNotificationChannelAsync('new-articles', {
      name: 'Nuevas noticias',
      importance: N.AndroidImportance.DEFAULT,
      lightColor: '#fe0946',
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
    });
  } catch (e) {
    if (__DEV__) console.warn('[notifications] channel setup failed', e);
  }
}

export async function notifyNewArticle(args: {
  sectionName: string;
  title: string;
  articleId: string;
}) {
  const N = getNotifications();
  if (!N) {
    if (__DEV__) {
      console.log(`[notifications] (no-op) ${args.sectionName} · ${args.title}`);
    }
    return;
  }
  try {
    await N.scheduleNotificationAsync({
      content: {
        title: args.sectionName,
        body: args.title,
        data: { articleId: args.articleId },
      },
      trigger: null,
    });
  } catch (e) {
    if (__DEV__) console.warn('[notifications] schedule failed', e);
  }
}

export const WP_SLUG_TO_SECTION: Record<string, string> = {
  'politica-y-geopolitica': 'politica',
  'analisis-y-opinion': 'analisis',
  'economia-e-internacional': 'economia',
  'sucesos-y-eventos': 'sucesos',
  'cultura-y-tecnologia': 'cultura',
  'deportes-y-salud': 'deportes',
  'virales-y-farandula': 'virales',
};

export const NOTIFICATIONS_AVAILABLE = !isExpoGo;
