import { Connection, Keypair } from "@solana/web3.js";
import type { SignWithPublisherKeypair } from "@solana-mobile/dapp-store-publishing-tools";
import { publishSupport } from "@solana-mobile/dapp-store-publishing-tools";
import { getConfigFile } from "../../utils.js";
import nacl from "tweetnacl";

type PublishSupportCommandInput = {
  appMintAddress: string;
  releaseMintAddress: string;
  signer: Keypair;
  url: string;
  dryRun: boolean;
  requestorIsAuthorized: boolean;
  requestDetails: string;
};

export const publishSupportCommand = async ({
  appMintAddress,
  releaseMintAddress,
  signer,
  url,
  dryRun = false,
  requestorIsAuthorized = false,
  requestDetails,
}: PublishSupportCommandInput) => {
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

  await publishSupport(
    { connection, sign },
    {
      appMintAddress: appMintAddress ?? appDetails.address,
      releaseMintAddress: releaseMintAddress ?? releaseDetails.address,
      publisherDetails,
      requestorIsAuthorized,
      requestDetails,
    },
    dryRun
  );
};
