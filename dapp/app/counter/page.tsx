import CounterClient from './CounterClient';

export const metadata = {
  title: 'Counter DApp - Midnight Network',
  description: 'Privacy-preserving counter on Midnight Network via 1AM Wallet',
};

export default function CounterPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <CounterClient />
    </div>
  );
}
