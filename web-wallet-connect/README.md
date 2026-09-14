# Web Contract Deployer for Midnight

This is a dedicated browser app whose only purpose is to deploy the compiled Tip Jar contract to Midnight Preprod through Lace.

## Features
- Connects through the DApp Connector `connect("preprod")` API.
- Reads and displays the connected wallet's **unshielded** address.
- Uses that unshielded address as the Compact constructor recipient.
- Builds, proves, balances, submits, and confirms a real deployment with Midnight.js.
- Has no mock, simulation, generated-hash, or fallback-success path.

## Usage

```bash
cd ..
npm install
npm run dev:deployer
```

Open http://localhost:3001, connect Lace on Preprod, and approve the deployment. A failed or rejected on-chain deployment is shown as an error and never as success.
