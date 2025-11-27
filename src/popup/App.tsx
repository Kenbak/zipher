import { useEffect } from 'react';
import { useAppStore } from '@/lib/storage/store';
import { vaultExists } from '@/lib/storage/secure-storage';
import { Unlock } from '@/pages/Unlock';
import { Welcome } from '@/pages/Welcome';
import { CreateWallet } from '@/pages/CreateWallet';
import { ConfirmSeed } from '@/pages/ConfirmSeed';
import { ImportWallet } from '@/pages/ImportWallet';
import { SetPassword } from '@/pages/SetPassword';
import { Home } from '@/pages/Home';

function App() {
  const currentPage = useAppStore((state) => state.currentPage);
  const navigateTo = useAppStore((state) => state.navigateTo);

  useEffect(() => {
    // Check if wallet exists on mount
    const checkWallet = async () => {
      const exists = await vaultExists();
      console.log('[App] Vault exists:', exists);
      
      if (exists) {
        // Wallet already created → show unlock screen
        navigateTo('unlock');
      } else {
        // No wallet → show welcome/onboarding
        navigateTo('welcome');
      }
    };
    
    checkWallet();
  }, [navigateTo]);

  // Simple router based on currentPage
  switch (currentPage) {
    case 'unlock':
      return <Unlock />;
    case 'welcome':
      return <Welcome />;
    case 'create-wallet':
      return <CreateWallet />;
    case 'confirm-seed':
      return <ConfirmSeed />;
    case 'import-wallet':
      return <ImportWallet />;
    case 'set-password':
      return <SetPassword />;
    case 'home':
      return <Home />;
    default:
      return <Unlock />;
  }
}

export default App;
