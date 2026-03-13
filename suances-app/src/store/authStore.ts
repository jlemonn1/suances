import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, WaiterSession } from '../types/auth';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const WAITER_SESSIONS_KEY = 'waiter_sessions';

const getTodayKey = () => new Date().toISOString().split('T')[0];

const sanitizeWaiterSessions = (sessions: WaiterSession[]): WaiterSession[] => {
  const today = getTodayKey();
  return sessions.filter(
    (session) => session.loginDate === today && session.user.rol === 'WAITER'
  );
};

const persistWaiterSessions = async (sessions: WaiterSession[]) => {
  if (!sessions.length) {
    await AsyncStorage.removeItem(WAITER_SESSIONS_KEY);
    return;
  }
  await AsyncStorage.setItem(WAITER_SESSIONS_KEY, JSON.stringify(sessions));
};

const loadStoredWaiterSessions = async (): Promise<WaiterSession[]> => {
  try {
    const raw = await AsyncStorage.getItem(WAITER_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WaiterSession[];
    const sanitized = sanitizeWaiterSessions(parsed);
    if (sanitized.length !== parsed.length) {
      await persistWaiterSessions(sanitized);
    }
    return sanitized;
  } catch (error) {
    console.error('[AuthStore] Error parsing waiter sessions:', error);
    await AsyncStorage.removeItem(WAITER_SESSIONS_KEY);
    return [];
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  waiterSessions: WaiterSession[];
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAndForget: () => Promise<void>;
  switchWaiter: (waiterId: string) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  isOwner: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  waiterSessions: [],

  login: async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      const { accessToken, userInfo } = response;

      const user: User = {
        id: userInfo.id,
        nombre: userInfo.fullName,
        rol: userInfo.role,
      };

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

      let waiterSessions = sanitizeWaiterSessions(get().waiterSessions);
      if (user.rol === 'WAITER') {
        const updatedSessions: WaiterSession[] = [
          ...waiterSessions.filter((session) => session.user.id !== user.id),
          { user, token: accessToken, loginDate: getTodayKey() },
        ];
        waiterSessions = updatedSessions;
        await persistWaiterSessions(updatedSessions);
      } else if (waiterSessions.length !== get().waiterSessions.length) {
        await persistWaiterSessions(waiterSessions);
      }

      setAuthToken(accessToken);
      console.log('Token set:', accessToken.substring(0, 20) + '...');
      set({ token: accessToken, user, isAuthenticated: true, isLoading: false, waiterSessions });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    const { waiterSessions } = get();
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setAuthToken(null);

    const sanitized = sanitizeWaiterSessions(waiterSessions);
    await persistWaiterSessions(sanitized);

    set({ user: null, token: null, isAuthenticated: false, isLoading: false, waiterSessions: sanitized });
  },

  logoutAndForget: async () => {
    const { user, waiterSessions } = get();
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setAuthToken(null);

    let remaining = sanitizeWaiterSessions(waiterSessions);
    if (user) {
      remaining = remaining.filter((session) => session.user.id !== user.id);
    }
    await persistWaiterSessions(remaining);

    set({ user: null, token: null, isAuthenticated: false, isLoading: false, waiterSessions: remaining });
  },

  switchWaiter: async (waiterId: string) => {
    const waiterSessions = sanitizeWaiterSessions(get().waiterSessions);
    const session = waiterSessions.find((s) => s.user.id === waiterId);
    if (!session) {
      await persistWaiterSessions(waiterSessions);
      set({ waiterSessions });
      throw new Error('El camarero no tiene una sesión activa hoy');
    }

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    setAuthToken(session.token);

    set({ token: session.token, user: session.user, isAuthenticated: true, isLoading: false, waiterSessions });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);
      const waiterSessions = await loadStoredWaiterSessions();

      if (token && userJson) {
        console.log('Found stored token:', token.substring(0, 20) + '...');
        setAuthToken(token);
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, isLoading: false, waiterSessions });
      } else {
        console.log('No stored auth found');
        set({ isLoading: false, waiterSessions });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({ isLoading: false, waiterSessions: [] });
    }
  },

  isOwner: () => {
    const { user } = get();
    return user?.rol === 'OWNER';
  },

  isStaff: () => {
    const { user } = get();
    return user?.rol === 'MANAGER' || user?.rol === 'WAITER';
  },
}));
