/**
 * This script sets up an incoming payment on a receiving wallet address,
 * and a quote on the sending wallet address (after getting grants for both of the resources).
 *
 * The final step is asking for an outgoing payment grant for the sending wallet address.
 * Since this needs user interaction, you will need to navigate to the URL, and accept the interactive grant.
 *
 * To start, please add the variables for configuring the client & the wallet addresses for the payment.
 */

import {
  createAuthenticatedClient,
  OpenPaymentsClientError,
  isFinalizedGrant,
} from "@interledger/open-payments";
import readline from "readline/promises";


const SENDER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/7c5b53a4"; // qing rong's
const RECEIVER_WALLET_ADDRESS = "https://ilp.interledger-test.dev/836c1bdf"; // yx
const PRIVATE_KEY_PATH = "/home/crabis/HackoMania2025/HackoMania2025/backend/private.key" //yx
const KEY_ID = "ee699895-7946-4498-8594-901b58d642cf";

(async () => {
  const client = await createAuthenticatedClient({
    walletAddressUrl: RECEIVER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $), and has no trailing slashes
    privateKey: PRIVATE_KEY_PATH,
    keyId: KEY_ID,
  });

  const sendingWalletAddress = await client.walletAddress.get({
    url: SENDER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
  });
  const receivingWalletAddress = await client.walletAddress.get({
    url: RECEIVER_WALLET_ADDRESS, // Make sure the wallet address starts with https:// (not $)
  });

  console.log(
    "Got wallet addresses. We will set up a payment between the sending and the receiving wallet address",
    { receivingWalletAddress, sendingWalletAddress }
  );

  // Step 1: Get a grant for the incoming payment, so we can create the incoming payment on the receiving wallet address
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
  
    console.log(
      "\nStep 2: created incoming payment on receiving wallet address",
      incomingPayment
    );
  } else {
    console.log("Grant is still pending. Please complete the grant process.");
    process.exit();
  }
  
  

  // Step 2: Create the incoming payment. This will be where funds will be received.
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

  console.log(
    "\nStep 2: created incoming payment on receiving wallet address",
    incomingPayment
  );

  // Step 3: Get a quote grant, so we can create a quote on the sending wallet address
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
  
    console.log("\nStep 4: got quote on sending wallet address", quote);
  } else {
    console.log("Quote grant is still pending. Please complete the grant process.");
    process.exit();
  }
  

  // Step 4: Create a quote, this gives an indication of how much it will cost to pay into the incoming payment
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

  console.log("\nStep 4: got quote on sending wallet address", quote);

  // Step 5: Start the grant process for the outgoing payments.
  // This is an interactive grant: the user (in this case, you) will need to accept the grant by navigating to the outputted link.
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
  } 
  
  console.log("\nStep 5: got finalized outgoing payment grant", outgoingPaymentGrant);
  console.log(
    "Please navigate to the following URL, to accept the interaction from the sending wallet:"
  );
  // console.log(outgoingPaymentGrant.interact.redirect);

  await readline
    .createInterface({ input: process.stdin, output: process.stdout })
    .question("\nPlease accept grant and press enter...");

  let finalizedOutgoingPaymentGrant;

  const grantContinuationErrorMessage =
    "\nThere was an error continuing the grant. You probably have not accepted the grant at the url (or it has already been used up, in which case, rerun the script).";

  try {
    finalizedOutgoingPaymentGrant = await client.grant.continue({
      url: outgoingPaymentGrant.continue.uri,
      accessToken: outgoingPaymentGrant.continue.access_token.value,
    });
  } catch (err) {
    if (err instanceof OpenPaymentsClientError) {
      console.log(grantContinuationErrorMessage);
      process.exit();
    }

    throw err;
  }

  if (!isFinalizedGrant(finalizedOutgoingPaymentGrant)) {
    console.log(
      "There was an error continuing the grant. You probably have not accepted the grant at the url."
    );
    process.exit();
  }

  console.log(
    "\nStep 6: got finalized outgoing payment grant",
    finalizedOutgoingPaymentGrant
  );

  // Step 7: Finally, create the outgoing payment on the sending wallet address.
  // This will make a payment from the outgoing payment to the incoming one (over ILP)
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: sendingWalletAddress.resourceServer,
      accessToken: finalizedOutgoingPaymentGrant.access_token.value,
    },
    {
      walletAddress: sendingWalletAddress.id,
      quoteId: quote.id,
    }
  );

  console.log(
    "\nStep 7: Created outgoing payment. Funds will now move from the outgoing payment to the incoming payment.",
    outgoingPayment
  );

  process.exit();
})();