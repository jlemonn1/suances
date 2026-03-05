import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Rol, LoginRequest } from '../types/auth';
import { authService } from '../services/authService';
import { setAuthToken } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  isOwner: () => boolean;
  isStaff: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      const { accessToken, userInfo } = response;
      
      const user: User = {
        id: userInfo.id,
        nombre: userInfo.fullName,
        rol: userInfo.role,
      };
      
      await AsyncStorage.setItem('auth_token', accessToken);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      
      setAuthToken(accessToken);
      console.log('Token set:', accessToken.substring(0, 20) + '...');
      set({ token: accessToken, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
      ]);

      if (token && userJson) {
        console.log('Found stored token:', token.substring(0, 20) + '...');
        setAuthToken(token);
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        console.log('No stored auth found');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({ isLoading: false });
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
