import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignInDialog = ({ open, onOpenChange }: SignInDialogProps) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In Required</DialogTitle>
          <DialogDescription>
            Please sign in to use this feature. Create an account or sign in to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSignIn} className="flex-1">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInDialog;
