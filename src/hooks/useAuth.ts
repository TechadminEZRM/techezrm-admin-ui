import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { ENDPOINTS } from '@/api/config/endpoints';

// API functions using your configured endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(ENDPOINTS.AUTH.PROFILE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  },
};

export const useLogin = () => {
  const { login, setLoading } = useAuthStore();

  return useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // Store token in localStorage
      if (data.data?.token) {
        localStorage.setItem('auth-token', data.data.token);
      }

      // Update auth store
      login(data.data.user, data.data.token);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useRegister = () => {
  const setLoading = useAuthStore((state) => state.setLoading);

  return useMutation({
    mutationFn: authAPI.register,
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Updated logout - no API call, just clear local data
export const useLogout = () => {
  const { logout, setLoading } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // No API call needed, just return a resolved promise
      return Promise.resolve();
    },
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      // Clear token from localStorage
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token'); // Remove this too if you have it

      // Clear auth storage (the persisted zustand data)
      localStorage.removeItem('auth-storage');

      // Update auth store
      logout();

      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still clear everything even on error
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
      localStorage.removeItem('auth-storage');
      logout();
      queryClient.clear();
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useProfile = () => {
  const { token, isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile(token!),
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
