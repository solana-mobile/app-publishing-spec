import { Connection, Keypair } from "@solana/web3.js";
import type { SignWithPublisherKeypair } from "@solana-mobile/dapp-store-publishing-tools";
import { publishRemove } from "@solana-mobile/dapp-store-publishing-tools";
import { getConfigFile } from "../../utils.js";
import nacl from "tweetnacl";

type PublishRemoveCommandInput = {
  appMintAddress: string;
  releaseMintAddress: string;
  signer: Keypair;
  url: string;
  dryRun: boolean;
  requestorIsAuthorized: boolean;
  critical: boolean;
};

export const publishRemoveCommand = async ({
  appMintAddress,
  releaseMintAddress,
  signer,
  url,
  dryRun = false,
  requestorIsAuthorized = false,
  critical = false,
}: PublishRemoveCommandInput) => {
  if (!requestorIsAuthorized) {
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
  } = await getConfigFile();
  const sign = ((buf: Buffer) =>
    nacl.sign(buf, signer.secretKey)) as SignWithPublisherKeypair;

  await publishRemove(
    { connection, sign },
    {
      appMintAddress: appMintAddress ?? appDetails.address,
      releaseMintAddress: releaseMintAddress ?? releaseDetails.address,
      publisherDetails,
      requestorIsAuthorized,
      criticalUpdate: critical,
    },
    dryRun
  );
};
