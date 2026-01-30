import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HardDrive } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-primary-foreground/20 rounded-xl backdrop-blur-sm">
                <HardDrive className="h-10 w-10 text-primary-foreground" />
              </div>
              <span className="text-3xl font-display font-bold text-primary-foreground">
                CloudDrive
              </span>
            </div>
            
            <h2 className="text-4xl font-display font-bold text-primary-foreground mb-4">
              Your files, everywhere
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Store, share, and access your files from anywhere. Secure cloud storage that keeps your data safe and accessible.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-primary-foreground/90">
              <div className="text-center">
                <div className="text-3xl font-bold">15GB</div>
                <div className="text-sm opacity-80">Free Storage</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">256-bit</div>
                <div className="text-sm opacity-80">Encryption</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Access</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-primary rounded-lg">
              <HardDrive className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              CloudDrive
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};
