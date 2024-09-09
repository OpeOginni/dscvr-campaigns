import {
  generateSigner,
  percentAmount,
  type PublicKey,
} from "@metaplex-foundation/umi";
import umi from "./UMI";
import { HTTPException } from "hono/http-exception";
import { createFungible } from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
} from "@metaplex-foundation/mpl-toolbox";
import { base58 } from "@metaplex-foundation/umi/serializers";

export const mintSLPToken = async (
  imageURI: string,
  tokenName: string,
  tokenSymbol: string,
  receiverWalletAddress: PublicKey,
  amount: number
) => {
  const metadataUri = await umi.uploader
    .uploadJson({
      name: tokenName,
      symbol: tokenSymbol,
      description: "", // Integrate Later
      image: imageURI,
    })
    .catch((err) => {
      throw new HTTPException(500, {
        message: "Error with Uploading Metadata",
        cause: err,
      });
    });

  const mintSigner = generateSigner(umi);

  const createFungibleIx = await createFungible(umi, {
    mint: mintSigner,
    name: tokenName,
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 9, // set the amount of decimals you want your token to have.
  });

  const createTokenIx = createTokenIfMissing(umi, {
    mint: mintSigner.publicKey,
    owner: receiverWalletAddress,
    ataProgram: getSplAssociatedTokenProgramId(umi),
  });

  const mintTokensIx = mintTokensTo(umi, {
    mint: receiverWalletAddress,
    token: findAssociatedTokenPda(umi, {
      mint: mintSigner.publicKey,
      owner: receiverWalletAddress,
    }),
    amount: BigInt(amount),
  });

  const tx = await createFungibleIx
    .add(createTokenIx)
    .add(mintTokensIx)
    .sendAndConfirm(umi);

  const signature = base58.deserialize(tx.signature)[0];

  return { signature };
};
