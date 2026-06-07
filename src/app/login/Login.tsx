'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLogin();

  // Check authentication and redirect - but only after a delay to prevent the redirect loop
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated) {
        router.replace('/admin/dashboard');
      }
    };

    // Add a small delay to prevent immediate redirect during logout
    const timeoutId = setTimeout(checkAuth, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, router]);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    newErrors.email = validateEmail(email);
    newErrors.password = validatePassword(password);

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await loginMutation.mutateAsync({
        email,
        password,
      });

      // Redirect on success
      router.replace('/admin/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <Container
      maxWidth="lg"
      sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}
      suppressHydrationWarning
    >
      <Grid
        container
        spacing={4}
        alignItems="center"
        justifyContent="space-around"
        width="100%"
      >
        {/* Logo Section */}
        <Grid>
          <Box sx={{ textAlign: 'center' }}>
            <Image
              src="/Logo.png"
              alt="ERMM Logo"
              width={429}
              height={229}
              priority
            />
          </Box>
        </Grid>

        {/* Login Form Section */}
        <Grid>
          <Box
            sx={{
              maxWidth: 400,
              margin: '0 auto',
              padding: 3,
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              color="#333333"
              fontWeight="700"
            >
              Hello Again!
            </Typography>
            <Typography
              variant="subtitle1"
              color="#333333"
              gutterBottom
              fontWeight="400"
            >
              Welcome Back
            </Typography>

            {/* Error Alert */}
            {loginMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginMutation.error.message ||
                  'Login failed. Please try again.'}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                placeholder="Email Address"
                type="email"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loginMutation.isPending}
                InputLabelProps={{ shrink: false }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#666', width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                      borderRadius: '30px',
                    },
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={handlePasswordChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loginMutation.isPending}
                InputLabelProps={{ shrink: false }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#666', width: 20, height: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                        onClick={handleTogglePasswordVisibility}
                        disabled={loginMutation.isPending}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                      borderRadius: '30px',
                    },
                  },
                }}
              />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!isFormValid || loginMutation.isPending}
                  sx={{
                    mt: 2,
                    mb: 2,
                    p: 2,
                    backgroundColor: '#F9A922',
                    '&:hover': { backgroundColor: '#E8981F' },
                    '&:disabled': { backgroundColor: '#ccc' },
                    borderRadius: '30px',
                    fontWeight: 700,
                    fontFamily: 'Poppins, sans-serif',
                    textTransform: 'none',
                    position: 'relative',
                  }}
                >
                  {loginMutation.isPending ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: 'white' }}
                      />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                {/* Links */}
                <Link
                  href="/forgot"
                  color="error"
                  sx={{ textDecoration: 'none', mb: 1 }}
                >
                  Forgot Password?
                </Link>
                <Link
                  href="/signup"
                  color="primary"
                  sx={{ textDecoration: 'none' }}
                >
                  Don&apos;t have an account? Register
                </Link>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
