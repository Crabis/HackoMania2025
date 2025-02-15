import express, { Request, Response } from "express";
import {
  createAuthenticatedClient,
  OpenPaymentsClientError,
  isFinalizedGrant,
  WalletAddress,
  Grant,
  IncomingPayment,
  Quote,
} from "@interledger/open-payments";

const app = express();
app.use(express.json());


const SENDER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/7c5b53a4";
const RECEIVER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/836c1bdf";
const PRIVATE_KEY_PATH = "/home/crabis/HackoMania2025/HackoMania2025/backend/private.key";
const KEY_ID = "ee699895-7946-4498-8594-901b58d642cf";

let client: any;

// ✅ Initialize the authenticated client
(async () => {
  try {
    client = await createAuthenticatedClient({
      walletAddressUrl: RECEIVER_WALLET_ADDRESS,
      privateKey: PRIVATE_KEY_PATH,
      keyId: KEY_ID,
    });
    console.log("Client initialized successfully");
  } catch (error) {
    console.error("Error initializing client:", error);
  }
})();

// ✅ GET Wallets - Fix async issue
app.get("/wallets", async (req: Request, res: Response): Promise<void> => {
  try {
      const sendingWalletAddress = await client.walletAddress.get({
        url: SENDER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
      });
      const receivingWalletAddress = await client.walletAddress.get({
        url: RECEIVER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
      });
    
    res.json({ sendingWalletAddress, receivingWalletAddress });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

// ✅ POST Incoming Payment
app.post("/incoming-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    const receivingWalletAddress = await client.walletAddress.get({
        url: RECEIVER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
      });
    const incomingPaymentGrant = await client.grant.request(
        {
          url: receivingWalletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "incoming-payment",
                actions: ["read", "complete", "create"],
              },
            ],
          },
        }
      );
      
      // FIX: Ensure the grant is finalized before accessing access_token
      if (isFinalizedGrant(incomingPaymentGrant)) {
        console.log(
          "\nStep 1: got incoming payment grant for receiving wallet address",
          incomingPaymentGrant
        );
      
        const incomingPayment = await client.incomingPayment.create(
          {
            url: receivingWalletAddress.resourceServer,
            accessToken: incomingPaymentGrant.access_token.value, // ✅ No more errors!
          },
          {
            walletAddress: receivingWalletAddress.id,
            incomingAmount: {
              assetCode: receivingWalletAddress.assetCode,
              assetScale: receivingWalletAddress.assetScale,
              value: "1000",
            },
          }
        );
        
    res.json(incomingPayment);
  }} catch (error) {
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

// ✅ POST Create a Quote
app.post("/quote", async (req: Request, res: Response): Promise<void> => {
  try {
     const { amount } = req.body;
    const sendingWalletAddress = await client.walletAddress.get({
        url: SENDER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
    });
    const receivingWalletAddress = await client.walletAddress.get({
    url: RECEIVER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
    });
    const incomingPaymentGrant = await client.grant.request(
        {
          url: receivingWalletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "incoming-payment",
                actions: ["read", "complete", "create"],
              },
            ],
          },
        }
      );
      
      // FIX: Ensure the grant is finalized before accessing access_token
    if (isFinalizedGrant(incomingPaymentGrant)) {
    console.log(
        "\nStep 1: got incoming payment grant for receiving wallet address",
        incomingPaymentGrant
    );
    const incomingPayment = await client.incomingPayment.create(
        {
          url: receivingWalletAddress.resourceServer,
          accessToken: incomingPaymentGrant.access_token.value
        },
        {
          walletAddress: receivingWalletAddress.id,
          incomingAmount: {
            assetCode: receivingWalletAddress.assetCode,
            assetScale: receivingWalletAddress.assetScale,
            value: String(amount) // ✅ Use dynamic amount from frontend
          }
        }
      );
    const quoteGrant = await client.grant.request(
        {
          url: sendingWalletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "quote",
                actions: ["create", "read"],
              },
            ],
          },
        }
      );
      
      if (isFinalizedGrant(quoteGrant)) {
        console.log("\nStep 3: got quote grant on sending wallet address", quoteGrant);
      
        const quote = await client.quote.create(
          {
            url: sendingWalletAddress.resourceServer,
            accessToken: quoteGrant.access_token.value, // ✅ No error
          },
          {
            walletAddress: sendingWalletAddress.id,
            receiver: incomingPayment.id,
            method: "ilp",
          }
        );
        
        res.json(quote);
        console.log("\nStep 4: got quote on sending wallet address", quote);
  }}} catch (error) {
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});
const pendingGrants: Record<string, { continueUri: string; accessToken: string; quoteId: string }> = {};
// ✅ POST Outgoing Payment Grant
app.post("/outgoing-payment", async (req: Request, res: Response): Promise<void> => {
//   try {
    const sendingWalletAddress: WalletAddress = await client.walletAddress.get({ url: SENDER_WALLET_ADDRESS });
    const quote: Quote = req.body.quote;

    const outgoingPaymentGrant = await client.grant.request(
        {
          url: sendingWalletAddress.authServer,
        },
        {
          access_token: {
            access: [
              {
                type: "outgoing-payment",
                actions: ["read", "create"],
                limits: {
                  debitAmount: {
                    assetCode: quote.debitAmount.assetCode,
                    assetScale: quote.debitAmount.assetScale,
                    value: quote.debitAmount.value,
                  },
                },
                identifier: sendingWalletAddress.id,
              },
            ],
          },
          interact: {
            start: ["redirect"],
          },
        }
      );
      
      if (!isFinalizedGrant(outgoingPaymentGrant)) {
        console.log(
          "Please navigate to the following URL to accept the interaction from the sending wallet:"
        );
        console.log(outgoingPaymentGrant.interact.redirect);
        console.log("🔹 Received quote in request body:", quote);
        console.log("🔹 Storing quoteId:", quote?.id);

        pendingGrants[sendingWalletAddress.id] = {
            continueUri: outgoingPaymentGrant.continue.uri,
            accessToken: outgoingPaymentGrant.continue.access_token.value,
            quoteId: quote.id, // ✅ Store quote ID for later use
        };
      } 
      
      console.log("🔹 Storing grant for wallet:", sendingWalletAddress.id);
        console.log("🔹 Grant Data:", {
        continueUri: outgoingPaymentGrant.continue.uri,
        accessToken: outgoingPaymentGrant.continue.access_token.value,
        quoteID: pendingGrants.quoteId
            });

      res.json(outgoingPaymentGrant);
    
    })

app.post("/finish-payment", async (req: Request, res: Response): Promise<void> => {
        try {
            const { walletId } = req.body;
    
            if (!walletId) {
                res.status(400).json({ error: "Wallet ID is required" });
                return;
            }
    
            if (!pendingGrants[walletId]) {
                console.log("🚨 No pending grant found for wallet:", walletId);
                res.status(400).json({ error: "No pending grant found for this wallet." });
                return;
            }
    
            const grantData = pendingGrants[walletId];
            delete pendingGrants[walletId]; // Remove the stored grant after use
    
            console.log("✅ Found grant for wallet:", walletId);
            console.log("✅ Continuing grant process...");
    
            // ✅ Continue the grant process
            const finalizedOutgoingPaymentGrant = await client.grant.continue({
                url: grantData.continueUri,
                accessToken: grantData.accessToken,
            });
    
            if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
                console.log("🚨 Grant approval incomplete.");
                res.status(400).json({
                    error: "Grant approval incomplete. Please try again after accepting the grant.",
                });
                return;
            }
    
            console.log("✅ Outgoing Payment Grant Approved:", finalizedOutgoingPaymentGrant);
    
            // ✅ Retrieve the sending wallet address
            const sendingWalletAddress: WalletAddress = await client.walletAddress.get({ url: SENDER_WALLET_ADDRESS });
    
            // ✅ Create the outgoing payment (Fixing incorrect `quoteId` retrieval)
            const outgoingPayment = await client.outgoingPayment.create(
                {
                    url: sendingWalletAddress.resourceServer,
                    accessToken: finalizedOutgoingPaymentGrant.access_token.value,
                },
                {
                    walletAddress: sendingWalletAddress.id,
                    quoteId: grantData.quoteId,
                }
            );
    
            console.log("✅ Payment successfully created:", outgoingPayment);
            res.json({ message: "Payment sent successfully", outgoingPayment });
    
        } catch (error) {
            console.log("🚨 Error in finish-payment:", error);
            res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
        }
    });
    
    
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




