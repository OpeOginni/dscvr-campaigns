import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  createUmi,
  keypairIdentity,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage";
import base58 from "bs58";

const DEVNET_SECRET_KEY = process.env.DEVNET_SECRET_KEY;

const secret = base58.decode(DEVNET_SECRET_KEY || "");

const umi = createUmi("https://api.devnet.solana.com")
  .use(mplTokenMetadata())
  .use(mplToolbox());

const myKeypair = umi.eddsa.createKeypairFromSecretKey(secret);
const myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
umi.use(keypairIdentity(myKeypairSigner));

umi.use(nftStorageUploader({ token: process.env.NFT_STORAGE_API_TOKEN || "" }));

export default umi;
