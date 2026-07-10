import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <main className="flex max-w-2xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Midnight Network &middot; 1AM Wallet
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Counter DApp
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
          A privacy-preserving counter smart contract on Midnight Network.
          Deploy, increment, and query state — all with zero gas fees via
          the 1AM wallet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/counter"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Open Counter DApp
          </Link>
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900"
          >
            Midnight Docs
          </a>
        </div>

        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold">1. Connect Wallet</h3>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Use the 1AM browser extension to connect to Midnight.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold">2. Deploy Contract</h3>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Deploy a fresh counter contract. 1AM sponsors all fees.
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold">3. Increment &amp; Query</h3>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Call the increment circuit and read the on-chain state.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
