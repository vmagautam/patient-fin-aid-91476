import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
}

const PageHeader = ({ title, subtitle, action, showBack = false }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-primary text-primary-foreground py-6 px-4 shadow-medium">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-primary-foreground hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>
          {action}
        </div>
        {subtitle && (
          <p className="text-primary-foreground/80 text-sm ml-11">{subtitle}</p>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
