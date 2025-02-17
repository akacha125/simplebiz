import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
  email: string;
  password: string;
  business_name?: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const [error, setError] = React.useState<string | null>(null);

  // Check for email verification status on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'access_denied' && params.get('error_description')?.includes('Email link is invalid or has expired')) {
      setError('Verification link has expired. Please try signing up again.');
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    console.log('Form submitted with:', data);
    try {
      if (isSignUp) {
        console.log('Attempting signup...');
        // Try to sign up directly without email confirmation
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              business_name: data.business_name || '',
            },
          }
        });

        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }

        console.log('Signup successful:', signUpData);
        navigate('/');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) throw signInError;
        navigate('/');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to SimpleBiz'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className={`rounded-md ${error.includes('verify') ? 'bg-blue-50' : 'bg-red-50'} p-4`}>
              <div className={`text-sm ${error.includes('verify') ? 'text-blue-700' : 'text-red-700'}`}>
                {error}
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="business_name" className="sr-only">Business Name</label>
                <input
                  {...register('business_name', { 
                    required: isSignUp ? 'Business name is required' : false 
                  })}
                  type="text"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Business Name"
                />
                {errors.business_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.business_name.message}</p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                type="password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : (isSignUp ? 'Sign up' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Don\'t have an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}