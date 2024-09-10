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

export const createSLPToken = async (
  imageURI: string,
  tokenName: string,
  tokenSymbol: string
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
    decimals: 0, // set the amount of decimals you want your token to have.
  });

  const tx = await createFungibleIx.sendAndConfirm(umi);

  const signature = base58.deserialize(tx.signature)[0];

  // Store mintSigner.publicKey in the database along with other token details
  // Example: await database.saveToken({ mintPublicKey: mintSigner.publicKey, tokenName, tokenSymbol, metadataUri });

  return { signature, mintPublicKey: mintSigner.publicKey };
};

export const mintSLPToken = async (
  mintPublicKey: PublicKey,
  receiverWalletAddress: PublicKey,
  amount: number
) => {
  const createTokenIx = createTokenIfMissing(umi, {
    mint: mintPublicKey,
    owner: receiverWalletAddress,
    ataProgram: getSplAssociatedTokenProgramId(umi),
  });

  const mintTokensIx = mintTokensTo(umi, {
    mint: mintPublicKey,
    token: findAssociatedTokenPda(umi, {
      mint: mintPublicKey,
      owner: receiverWalletAddress,
    }),
    amount: BigInt(amount),
  });

  const tx = await createTokenIx.add(mintTokensIx).sendAndConfirm(umi);

  const signature = base58.deserialize(tx.signature)[0];

  return { signature };
};

// export const mintSLPToken = async (
//   imageURI: string,
//   tokenName: string,
//   tokenSymbol: string,
//   receiverWalletAddress: PublicKey,
//   amount: number
// ) => {
//   const metadataUri = await umi.uploader
//     .uploadJson({
//       name: tokenName,
//       symbol: tokenSymbol,
//       description: "", // Integrate Later
//       image: imageURI,
//     })
//     .catch((err) => {
//       throw new HTTPException(500, {
//         message: "Error with Uploading Metadata",
//         cause: err,
//       });
//     });

//   const mintSigner = generateSigner(umi);

//   const createFungibleIx = await createFungible(umi, {
//     mint: mintSigner,
//     name: tokenName,
//     uri: metadataUri,
//     sellerFeeBasisPoints: percentAmount(0),
//     decimals: 0, // set the amount of decimals you want your token to have.
//   });

//   const createTokenIx = createTokenIfMissing(umi, {
//     mint: mintSigner.publicKey,
//     owner: receiverWalletAddress,
//     ataProgram: getSplAssociatedTokenProgramId(umi),
//   });

//   const mintTokensIx = mintTokensTo(umi, {
//     mint: mintSigner.publicKey,
//     token: findAssociatedTokenPda(umi, {
//       mint: mintSigner.publicKey,
//       owner: receiverWalletAddress,
//     }),
//     amount: BigInt(amount),
//   });

//   const tx = await createFungibleIx
//     .add(createTokenIx)
//     .add(mintTokensIx)
//     .sendAndConfirm(umi);

//   const signature = base58.deserialize(tx.signature)[0];

//   return { signature };
// };
