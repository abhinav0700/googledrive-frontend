import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

type ActivationStatus = 'loading' | 'success' | 'error';

const ActivateAccount = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<ActivationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const activateAccount = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid activation link');
        return;
      }

      try {
        const response = await api.activateAccount(token);
        if (response.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(response.message || 'Activation failed');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 'Unable to activate account. The link may be expired.'
        );
      }
    };

    activateAccount();
  }, [token]);

  return (
    <AuthLayout 
      title={
        status === 'loading' 
          ? 'Activating...' 
          : status === 'success' 
            ? 'Account activated!' 
            : 'Activation failed'
      }
      subtitle={
        status === 'loading' 
          ? 'Please wait while we activate your account'
          : status === 'success'
            ? 'Your account is now ready to use'
            : undefined
      }
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        {status === 'loading' && (
          <>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-muted-foreground">
              This should only take a moment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <p className="text-muted-foreground">
              You can now sign in to your account and start using CloudDrive.
            </p>
            <Link to="/login">
              <Button className="w-full">Go to login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-muted-foreground">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link to="/register">
                <Button className="w-full">Create new account</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to login</Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ActivateAccount;
