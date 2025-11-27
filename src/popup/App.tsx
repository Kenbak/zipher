import { useAppStore } from '@/lib/storage/store';
import { Welcome } from '@/pages/Welcome';
import { CreateWallet } from '@/pages/CreateWallet';
import { ConfirmSeed } from '@/pages/ConfirmSeed';
import { ImportWallet } from '@/pages/ImportWallet';
import { SetPassword } from '@/pages/SetPassword';
import { Home } from '@/pages/Home';

function App() {
  const currentPage = useAppStore((state) => state.currentPage);

  // Simple router based on currentPage
  switch (currentPage) {
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
      return <Welcome />;
  }
}

export default App;

