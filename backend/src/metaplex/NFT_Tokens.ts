import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  percentAmount,
  type PublicKey,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import umi from "./UMI";

export const mintNFTToken = async (
  imageURI: string,
  nftName: string,
  receiverWalletAddress: PublicKey,
  amount: number
) => {
  const uri = await umi.uploader.uploadJson({
    name: nftName,
    description: "",
    image: imageURI,
  });

  const mint = generateSigner(umi);

  const signatures = [];
  for (let i = 0; i < amount; i++) {
    const tx = await createNft(umi, {
      mint,
      name: nftName,
      uri: uri,
      sellerFeeBasisPoints: percentAmount(5.5),
      tokenOwner: receiverWalletAddress,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    signatures.push(signature);
  }

  return { signatures };
};
