import express, { Request, Response } from "express";
import cors from 'cors';
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

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable credentials (if needed)
}));

app.use(express.json());

// Add health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const SENDER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/{id}";
const RECEIVER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/836c1bdf";
const PRIVATE_KEY_PATH = "/Users/justintimo/HackoMania2025/backend/private.key";
const KEY_ID = "ee699895-7946-4498-8594-901b58d642cf";

let client: any;

// Initialize the authenticated client
(async () => {
  try {
    client = await createAuthenticatedClient({
      walletAddressUrl: RECEIVER_WALLET_ADDRESS,
      privateKey: PRIVATE_KEY_PATH,
      keyId: KEY_ID,
    });
    console.log("✅ Client initialized successfully");
  } catch (error) {
    console.error("🚨 Error initializing client:", error);
  }
})();

// GET Wallets
app.get("/wallets", async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, userId } = req.body;
    // Construct the dynamic sender wallet address
    const SENDER_WALLET_ADDRESS = `https://ilp.interledger-test.dev/${userId}`; 
    console.log("📨 Fetching wallet addresses...");
    const sendingWalletAddress = await client.walletAddress.get({
      url: SENDER_WALLET_ADDRESS,
    });
    const receivingWalletAddress = await client.walletAddress.get({
      url: RECEIVER_WALLET_ADDRESS,
    });
    
    console.log("✅ Wallet addresses fetched successfully");
    res.json({ sendingWalletAddress, receivingWalletAddress });
  } catch (error) {
    console.error("🚨 Error fetching wallets:", error);
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

// POST Incoming Payment
app.post("/incoming-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📨 Creating incoming payment...");
    const receivingWalletAddress = await client.walletAddress.get({
      url: RECEIVER_WALLET_ADDRESS,
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
    
    if (isFinalizedGrant(incomingPaymentGrant)) {
      console.log("✅ Incoming payment grant received");
      
      const incomingPayment = await client.incomingPayment.create(
        {
          url: receivingWalletAddress.resourceServer,
          accessToken: incomingPaymentGrant.access_token.value,
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
      
      console.log("✅ Incoming payment created successfully");
      res.json(incomingPayment);
    }
  } catch (error) {
    console.error("🚨 Error creating incoming payment:", error);
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

// POST Create a Quote
app.post("/quote", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(req.body)  
    const { amount, id } = req.body;
    // Construct the dynamic sender wallet address
    const SENDER_WALLET_ADDRESS = `https://ilp.interledger-test.dev/${id}`; 
    const sendingWalletAddress = await client.walletAddress.get({
    url: SENDER_WALLET_ADDRESS,  // ✅ Now uses the user-provided ID dynamically
    });
    const receivingWalletAddress = await client.walletAddress.get({
      url: RECEIVER_WALLET_ADDRESS,
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
    
    if (isFinalizedGrant(incomingPaymentGrant)) {
      console.log("✅ Incoming payment grant received");

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
            value: String(amount)
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
        console.log("✅ Quote grant received");
      
        const quote = await client.quote.create(
          {
            url: sendingWalletAddress.resourceServer,
            accessToken: quoteGrant.access_token.value,
          },
          {
            walletAddress: sendingWalletAddress.id,
            receiver: incomingPayment.id,
            method: "ilp",
          }
        );
        
        console.log("✅ Quote created successfully:", quote);
        res.json(quote);
      }
    }
  } catch (error) {
    console.error("🚨 Error creating quote:", error);
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

const pendingGrants: Record<string, { continueUri: string; accessToken: string; quoteId: string }> = {};

// POST Outgoing Payment Grant
app.post("/outgoing-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📨 Creating outgoing payment...");
    console.log("Request body:", req.body);
    // Construct the dynamic sender wallet address
    
    const quote: Quote = req.body.quote;
    const SENDER_WALLET_ADDRESS = req.body.quote.walletId; 
    console.log(SENDER_WALLET_ADDRESS)

    const sendingWalletAddress: WalletAddress = await client.walletAddress.get({ url: SENDER_WALLET_ADDRESS });

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
      console.log("✅ Payment grant created, storing details");
      console.log("🔗 Redirect URL:", outgoingPaymentGrant.interact.redirect);

      pendingGrants[sendingWalletAddress.id] = {
        continueUri: outgoingPaymentGrant.continue.uri,
        accessToken: outgoingPaymentGrant.continue.access_token.value,
        quoteId: quote.id,
      };
      
      console.log("✅ Grant stored for wallet:", sendingWalletAddress.id);
    }

    res.json(outgoingPaymentGrant);
  } catch (error) {
    console.error("🚨 Error in outgoing payment:", error);
    res.status(500).json({ error: (error as Error).message || "Unexpected error occurred" });
  }
});

// POST Finish Payment
app.post("/finish-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletId, quoteId } = req.body;
    console.log("📨 Finishing payment for wallet:", walletId);
    const SENDER_WALLET_ADDRESS = walletId; 
    if (!walletId || !quoteId) {
      throw new Error("Wallet ID and Quote ID are required");
    }

    const grantData = pendingGrants[walletId];
    if (!grantData) {
      console.log("🚨 No pending grant found for wallet:", walletId);
      throw new Error("No pending grant found for this wallet");
    }

    // Verify quote ID matches
    if (grantData.quoteId !== quoteId) {
      throw new Error("Quote ID mismatch");
    }

    console.log("✅ Found grant data, continuing process");

    const finalizedOutgoingPaymentGrant = await client.grant.continue({
      url: grantData.continueUri,
      accessToken: grantData.accessToken,
    });

    if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
      throw new Error("Grant approval incomplete. Please try again after accepting the grant.");
    }

    console.log("✅ Grant finalized successfully");
    console.log(SENDER_WALLET_ADDRESS)
    const sendingWalletAddress: WalletAddress = await client.walletAddress.get({ 
      url: SENDER_WALLET_ADDRESS 
    });

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

    // Clean up the pending grant after successful payment
    delete pendingGrants[walletId];

    console.log("✅ Payment completed successfully");
    res.json({ 
      message: "Payment sent successfully", 
      outgoingPayment,
      success: true 
    });

  } catch (error) {
    console.error("🚨 Error in finish-payment:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Unexpected error occurred",
      success: false
    });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 CORS enabled for frontend at http://localhost:3000`);
});