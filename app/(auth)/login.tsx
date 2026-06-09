import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Mail, X, Apple } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

import { useTheme } from '@/theme/tokens';
import { useAuthStore, type AuthUser } from '@/store/useAuthStore';
import { useUserStore } from '@/store/useUserStore';

WebBrowser.maybeCompleteAuthSession();

// TODO: reemplazar por los client IDs reales en producción.
const GOOGLE_CLIENT_IDS = {
  expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

// Si los IDs siguen siendo los placeholders, evitamos montar el hook de
// Google. En builds de Android, inicializar el AuthRequest con un client
// inválido tira la app al arranque.
const GOOGLE_CONFIGURED = !Object.values(GOOGLE_CLIENT_IDS).some((v) =>
  v.startsWith('YOUR_'),
);

// Apple Authentication es iOS-only: en Android ni siquiera lo cargamos.
const AppleAuth =
  Platform.OS === 'ios'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      (require('expo-apple-authentication') as typeof import('expo-apple-authentication'))
    : null;

const LocalAuth = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-local-authentication') as typeof import('expo-local-authentication');
  } catch {
    return null;
  }
})();

type LoadingKind = null | 'google' | 'apple' | 'biometric' | 'guest' | 'email';

export default function Login() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, user, biometricEnabled, setBiometricEnabled } = useAuthStore();
  const setUserName = useUserStore((s) => s.setUserName);
  const setUserImage = useUserStore((s) => s.setUserImage);

  const [loading, setLoading] = useState<LoadingKind>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [signInVisible, setSignInVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (Platform.OS === 'ios' && AppleAuth) {
          const available = await AppleAuth.isAvailableAsync().catch(() => false);
          if (!cancelled) setAppleAvailable(available);
        }
        if (LocalAuth) {
          const hasHardware = await LocalAuth.hasHardwareAsync().catch(() => false);
          const enrolled = await LocalAuth.isEnrolledAsync().catch(() => false);
          if (!cancelled) setBiometricAvailable(hasHardware && enrolled);
        }
      } catch {
        // No bloqueamos el render si algo nativo falla.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const finalizeSession = useCallback(
    (authUser: AuthUser) => {
      signIn(authUser);
      setUserName(authUser.name);
      setUserImage(authUser.avatar);
      router.replace('/(tabs)/live');
    },
    [signIn, setUserName, setUserImage, router],
  );

  const handleApple = async () => {
    if (!AppleAuth) return;
    try {
      setLoading('apple');
      const credential = await AppleAuth.signInAsync({
        requestedScopes: [
          AppleAuth.AppleAuthenticationScope.FULL_NAME,
          AppleAuth.AppleAuthenticationScope.EMAIL,
        ],
      });
      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();
      finalizeSession({
        id: credential.user,
        name: fullName || 'Usuario Apple',
        email: credential.email,
        avatar: null,
        provider: 'apple',
      });
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', 'No pudimos completar el inicio con Apple.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleBiometric = async () => {
    if (!LocalAuth) return;
    if (!user) {
      Alert.alert(
        'Sin sesión previa',
        'Iniciá sesión primero. La próxima vez podrás entrar con biometría.',
      );
      return;
    }
    try {
      setLoading('biometric');
      const result = await LocalAuth.authenticateAsync({
        promptMessage: 'Ingresar a Laiguana',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      if (result.success) {
        if (!biometricEnabled) setBiometricEnabled(true);
        finalizeSession(user);
      }
    } catch {
      Alert.alert('Error', 'No pudimos verificar tu identidad.');
    } finally {
      setLoading(null);
    }
  };

  const handleEmail = () => {
    Alert.alert(
      'Próximamente',
      'El inicio con correo estará disponible muy pronto. Por ahora podés continuar con Google, Apple o como invitado.',
    );
  };

  const handleSignInLink = () => {
    setSignInVisible(true);
  };

  const closeSignIn = () => setSignInVisible(false);

  const handleGuest = () => {
    setLoading('guest');
    finalizeSession({
      id: 'guest',
      name: 'Invitado',
      email: null,
      avatar: null,
      provider: 'guest',
    });
  };

  const openTerms = () => Linking.openURL('https://laiguana.tv/terminos').catch(() => {});
  const openPrivacy = () => Linking.openURL('https://laiguana.tv/privacidad').catch(() => {});

  // Estilo del card siempre oscuro, como en el mock.
  const cardBg = '#101010';
  const cardBorder = '#1F1F1F';
  const cardText = '#FFFFFF';
  const cardSubText = 'rgba(255,255,255,0.6)';
  const dividerColor = 'rgba(255,255,255,0.15)';
  const accent = theme.accentPrimary;
  const emailBtnBg = 'rgba(255,255,255,0.06)';

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <View pointerEvents="none" style={styles.bgWrap}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.bgLogo}
          resizeMode="contain"
          blurRadius={Platform.OS === 'android' ? 12 : 18}
        />
        <View style={styles.bgOverlay} />
      </View>

      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Pressable
              onPress={handleGuest}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityLabel="Continuar como invitado"
            >
              <X size={22} color={cardSubText} />
            </Pressable>

            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.cardLogo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: cardText }]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, { color: cardSubText }]}>
              Conservá tu actividad y preferencias en todos tus dispositivos
            </Text>

            <View style={styles.btnGroup}>
              {appleAvailable && (
                <Pressable
                  onPress={handleApple}
                  disabled={loading !== null}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnDark,
                    { opacity: pressed || loading !== null ? 0.85 : 1 },
                  ]}
                >
                  {loading === 'apple' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <AppleGlyph />
                      <Text style={[styles.btnText, { color: '#fff' }]}>Continuar con Apple</Text>
                    </>
                  )}
                </Pressable>
              )}

              {GOOGLE_CONFIGURED ? (
                <GoogleButton
                  loading={loading === 'google'}
                  disabled={loading !== null}
                  setLoading={setLoading}
                  onSuccess={finalizeSession}
                />
              ) : (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Google no disponible',
                      'Aún falta configurar los Client IDs de Google. Probá con correo o como invitado.',
                    )
                  }
                  disabled={loading !== null}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnLight,
                    { opacity: pressed || loading !== null ? 0.9 : 1 },
                  ]}
                >
                  <GoogleGlyph />
                  <Text style={[styles.btnText, { color: '#0A0A0A' }]}>Continuar con Google</Text>
                </Pressable>
              )}

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
                <Text style={[styles.dividerText, { color: cardSubText }]}>o</Text>
                <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
              </View>

              <Pressable
                onPress={handleEmail}
                disabled={loading !== null}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: emailBtnBg, borderWidth: 1, borderColor: cardBorder },
                  { opacity: pressed || loading !== null ? 0.85 : 1 },
                ]}
              >
                <Mail size={20} color={cardText} />
                <Text style={[styles.btnText, { color: cardText }]}>Continuar con correo</Text>
              </Pressable>

              {biometricAvailable && user && (
                <Pressable
                  onPress={handleBiometric}
                  disabled={loading !== null}
                  style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
                >
                  {loading === 'biometric' ? (
                    <ActivityIndicator color={cardText} />
                  ) : (
                    <Text style={[styles.linkSubdued, { color: cardSubText }]}>
                      Entrar con biometría
                    </Text>
                  )}
                </Pressable>
              )}
            </View>

            <Pressable onPress={handleSignInLink} style={styles.signInRow} hitSlop={6}>
              <Text style={[styles.signInQuestion, { color: cardSubText }]}>
                ¿Ya tenés cuenta?{' '}
                <Text style={[styles.signInLink, { color: accent }]}>Iniciar sesión</Text>
              </Text>
            </Pressable>

            <Text style={[styles.legal, { color: cardSubText }]}>
              Al crear tu cuenta aceptás los{'\n'}
              <Text onPress={openTerms} style={styles.legalLink}>
                Términos
              </Text>{' '}
              y{' '}
              <Text onPress={openPrivacy} style={styles.legalLink}>
                Política de Privacidad
              </Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={signInVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSignIn}
        statusBarTranslucent
      >
        <Pressable style={styles.modalBackdrop} onPress={closeSignIn}>
          <Pressable
            style={[styles.card, styles.modalCard, { backgroundColor: cardBg, borderColor: cardBorder }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Pressable
              onPress={closeSignIn}
              hitSlop={12}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
              accessibilityLabel="Cerrar"
            >
              <X size={22} color={cardSubText} />
            </Pressable>

            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.cardLogo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: cardText }]}>Iniciar sesión</Text>
            <Text style={[styles.subtitle, { color: cardSubText }]}>
              Continuá donde lo dejaste
            </Text>

            <View style={styles.btnGroup}>
              {appleAvailable && (
                <Pressable
                  onPress={async () => {
                    await handleApple();
                    closeSignIn();
                  }}
                  disabled={loading !== null}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnDark,
                    { opacity: pressed || loading !== null ? 0.85 : 1 },
                  ]}
                >
                  {loading === 'apple' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <AppleGlyph />
                      <Text style={[styles.btnText, { color: '#fff' }]}>Continuar con Apple</Text>
                    </>
                  )}
                </Pressable>
              )}

              {GOOGLE_CONFIGURED ? (
                <GoogleButton
                  loading={loading === 'google'}
                  disabled={loading !== null}
                  setLoading={setLoading}
                  onSuccess={(u) => {
                    closeSignIn();
                    finalizeSession(u);
                  }}
                />
              ) : (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Google no disponible',
                      'Aún falta configurar los Client IDs de Google.',
                    )
                  }
                  disabled={loading !== null}
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnLight,
                    { opacity: pressed || loading !== null ? 0.9 : 1 },
                  ]}
                >
                  <GoogleGlyph />
                  <Text style={[styles.btnText, { color: '#0A0A0A' }]}>Continuar con Google</Text>
                </Pressable>
              )}

              <View style={styles.dividerRow}>
                <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
                <Text style={[styles.dividerText, { color: cardSubText }]}>o</Text>
                <View style={[styles.dividerLine, { backgroundColor: dividerColor }]} />
              </View>

              <Pressable
                onPress={handleEmail}
                disabled={loading !== null}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: emailBtnBg, borderWidth: 1, borderColor: cardBorder },
                  { opacity: pressed || loading !== null ? 0.85 : 1 },
                ]}
              >
                <Mail size={20} color={cardText} />
                <Text style={[styles.btnText, { color: cardText }]}>Continuar con correo</Text>
              </Pressable>

              {biometricAvailable && user && (
                <Pressable
                  onPress={async () => {
                    await handleBiometric();
                    closeSignIn();
                  }}
                  disabled={loading !== null}
                  style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
                >
                  {loading === 'biometric' ? (
                    <ActivityIndicator color={cardText} />
                  ) : (
                    <Text style={[styles.linkSubdued, { color: cardSubText }]}>
                      Entrar con biometría
                    </Text>
                  )}
                </Pressable>
              )}
            </View>

            <Pressable onPress={closeSignIn} style={styles.signInRow} hitSlop={6}>
              <Text style={[styles.signInQuestion, { color: cardSubText }]}>
                ¿No tenés cuenta?{' '}
                <Text style={[styles.signInLink, { color: accent }]}>Crear cuenta</Text>
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Sub-componente para que el hook de Google sólo se monte cuando los IDs son válidos.
function GoogleButton({
  loading,
  disabled,
  setLoading,
  onSuccess,
}: {
  loading: boolean;
  disabled: boolean;
  setLoading: (v: LoadingKind) => void;
  onSuccess: (u: AuthUser) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Google = require('expo-auth-session/providers/google') as typeof import('expo-auth-session/providers/google');
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_IDS.expoClientId,
    iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
    androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
    webClientId: GOOGLE_CLIENT_IDS.webClientId,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type !== 'success') return;
    (async () => {
      try {
        const accessToken = response.authentication?.accessToken;
        if (!accessToken) throw new Error('Sin token de acceso');
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        onSuccess({
          id: data.id ?? (await Crypto.randomUUID()),
          name: data.name ?? data.given_name ?? 'Usuario',
          email: data.email ?? null,
          avatar: data.picture ?? null,
          provider: 'google',
        });
      } catch {
        Alert.alert('Error', 'No pudimos completar el inicio con Google.');
      } finally {
        setLoading(null);
      }
    })();
  }, [response, onSuccess, setLoading]);

  const onPress = async () => {
    if (!request) return;
    setLoading('google');
    const result = await promptAsync();
    if (result.type !== 'success') setLoading(null);
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!request || disabled}
      style={({ pressed }) => [
        styles.btn,
        styles.btnLight,
        { opacity: pressed || disabled ? 0.9 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#0A0A0A" />
      ) : (
        <>
          <GoogleGlyph />
          <Text style={[styles.btnText, { color: '#0A0A0A' }]}>Continuar con Google</Text>
        </>
      )}
    </Pressable>
  );
}

function GoogleGlyph() {
  return (
    <Svg width={22} height={22} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <Path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </Svg>
  );
}

function AppleGlyph() {
  return <Apple size={22} color="#FFFFFF" fill="#FFFFFF" />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  bgWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgLogo: {
    width: 320,
    height: 320,
    opacity: 0.18,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    alignSelf: 'center',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 2,
  },
  cardLogo: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginTop: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  btnGroup: {
    marginTop: 22,
    gap: 12,
  },
  btn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  btnDark: { backgroundColor: '#000', borderWidth: 1, borderColor: '#1F1F1F' },
  btnLight: { backgroundColor: '#FFFFFF' },
  btnText: { fontSize: 15, fontWeight: '700' },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },

  linkRow: { alignItems: 'center', paddingVertical: 6 },
  linkSubdued: { fontSize: 13 },

  signInRow: {
    marginTop: 22,
    alignItems: 'center',
  },
  signInQuestion: { fontSize: 14, fontWeight: '500' },
  signInLink: { fontWeight: '700' },

  legal: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 16,
  },
  legalLink: { textDecorationLine: 'underline' },

  googleGlyph: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGlyphText: {
    color: '#4285F4',
    fontWeight: '900',
    fontSize: 14,
  },
  appleGlyph: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleGlyphText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: -2,
  },
});
