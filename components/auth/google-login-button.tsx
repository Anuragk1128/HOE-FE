'use client';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

// Wrapper component to handle Google OAuth provider
export default function GoogleLoginWrapper() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <GoogleLoginButton />
    </GoogleOAuthProvider>
  );
}

function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticatedUser } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      toast.error('No credential received from Google');
      return;
    }
    
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hoe-be.onrender.com';
      const response = await fetch(`${baseUrl}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });
      
      if (!response.ok) {
        // Try to parse JSON error, but guard against HTML responses
        let message = 'Login failed';
        try {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            message = errorData.message || message;
          } else {
            const text = await response.text();
            if (text) message = text.slice(0, 200);
          }
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
  
      // Store authentication data
      localStorage.setItem('authToken', data.token);
      
      // Store user data with correct field mapping
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        authProvider: data.user.authProvider
      };
      
      localStorage.setItem('user', JSON.stringify(userData));

      // Inform global auth context immediately so UI updates without reload
      setAuthenticatedUser({ id: userData.id, name: userData.name, email: userData.email }, data.token);
  
      toast.success('Login successful!');
      router.push('/');
      router.refresh();
      
    } catch (error) {
      console.error('Google login error:', error);
      toast.error((error as Error).message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        shape="rectangular"
        theme="outline"
        size="large"
        text="signin_with"
        locale="en"
        useOneTap={false} // Disable One Tap as it can cause issues
        auto_select={false}
        disabled={isLoading}
      />
    </div>
  );
}
