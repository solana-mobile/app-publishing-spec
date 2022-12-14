import { Connection, Keypair } from "@solana/web3.js";
import type { SignWithPublisherKeypair } from "@solana-mobile/dapp-store-publishing-tools";
import { publishSubmit } from "@solana-mobile/dapp-store-publishing-tools";
import nacl from "tweetnacl";
import { getConfigFile } from "../../utils.js";

type PublishSubmitCommandInput = {
  appMintAddress: string;
  releaseMintAddress: string;
  signer: Keypair;
  url: string;
  dryRun: boolean;
  compliesWithSolanaDappStorePolicies: boolean;
  requestorIsAuthorized: boolean;
};

export const publishSubmitCommand = async ({
  appMintAddress,
  releaseMintAddress,
  signer,
  url,
  dryRun = false,
  compliesWithSolanaDappStorePolicies = false,
  requestorIsAuthorized = false,
}: PublishSubmitCommandInput) => {
  if (!compliesWithSolanaDappStorePolicies) {
    console.error(
      "ERROR: Cannot submit a request for which the requestor does not attest that it complies with Solana dApp Store policies"
    );
    return;
  } else if (!requestorIsAuthorized) {
    console.error(
      "ERROR: Cannot submit a request for which the requestor does not attest they are authorized to do so"
    );
    return;
  }

  const connection = new Connection(url);
  const {
    publisher: publisherDetails,
    app: appDetails,
    release: releaseDetails,
    solana_mobile_dapp_publisher_portal: solanaMobileDappPublisherPortalDetails,
  } = await getConfigFile();
  const sign = ((buf: Buffer) =>
    nacl.sign(buf, signer.secretKey)) as SignWithPublisherKeypair;

  await publishSubmit(
    { connection, sign },
    {
      appMintAddress: appMintAddress ?? appDetails.address,
      releaseMintAddress: releaseMintAddress ?? releaseDetails.address,
      publisherDetails,
      solanaMobileDappPublisherPortalDetails,
      compliesWithSolanaDappStorePolicies,
      requestorIsAuthorized,
    },
    dryRun
  );
};
