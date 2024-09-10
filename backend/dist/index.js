// src/index.ts
import { serve } from "@hono/node-server";
import * as dotenv from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// src/campaigns/campaign.service.ts
import { HTTPException as HTTPException2 } from "hono/http-exception";

// src/shared/utils.shared.ts
import { createMiddleware } from "hono/factory";
var paginatedData = async (model, _page, _limit, query = {}) => {
  const page = _page < 1 ? 1 : _page;
  const limit = _limit ?? "10";
  const total = await model.countDocuments(query);
  const results = await model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  return {
    data: results,
    metaData: {
      page,
      limit,
      total
    }
  };
};
var validationMiddleware = (schema) => createMiddleware(async (c, next) => {
  const jsonData = await getJsonData(c);
  const queryData = c.req.query();
  const paramData = c.req.param();
  const data = { ...jsonData, ...queryData, ...paramData };
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    console.log("errors");
    c.status(400);
    c.res = new Response(
      JSON.stringify({ error: error.details.map((e) => e.message) }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return;
  }
  await next();
});
var getJsonData = async (c) => {
  try {
    return await c.req.json();
  } catch (error) {
    console.log(error);
    return {};
  }
};
var generateFile = async (image) => {
  let imageUri;
  if (typeof image === "string") {
    if (image.startsWith("data:image")) {
      const base64Data = image.split(",")[1];
      const mimeType = image.match(/data:(.*?);base64/)?.[1];
      const binary = atob(base64Data);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const imageBuffer = new Uint8Array(array);
      const blob = new Blob([imageBuffer], { type: mimeType });
      const file = new File([blob], "image.png", { type: mimeType });
      return { file, imageBuffer };
    }
  }
  throw new Error("Invalid image data");
};

// src/campaigns/campaign-leaderboard.schema.ts
import mongoose, { Schema } from "mongoose";
var CampaignLeaderBoardSchema = new Schema({
  campaign: {
    type: Schema.Types.ObjectId,
    ref: "Campaigns",
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, { timestamps: true });
var CampaignLeaderBoardModel = mongoose.model("CampaignLeaderBoard", CampaignLeaderBoardSchema);
CampaignLeaderBoardSchema.set("toJSON", {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

// src/campaigns/campaign.schema.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var CampaignStatus = /* @__PURE__ */ ((CampaignStatus2) => {
  CampaignStatus2["ACTIVE"] = "active";
  CampaignStatus2["INACTIVE"] = "inactive";
  return CampaignStatus2;
})(CampaignStatus || {});
var DistributionType = /* @__PURE__ */ ((DistributionType2) => {
  DistributionType2["NFT"] = "NFT";
  DistributionType2["TOKEN"] = "TOKEN";
  return DistributionType2;
})(DistributionType || {});
var CampaignSchema = new Schema2(
  {
    title: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      unique: true,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    creator: {
      type: String,
      trim: true,
      required: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: CampaignStatus,
      default: true
    },
    tokenName: {
      type: String
    },
    tokenSymbol: {
      type: String
    },
    distribution: {
      type: String,
      enum: DistributionType,
      required: true
    },
    maxDistribution: {
      type: Number,
      required: true
    },
    requiredNumberOfDSCVRPoints: {
      type: Number,
      required: true
    },
    requiredDSCVRStreakDays: {
      type: Number,
      required: true
    },
    allowRecentAccounts: {
      type: Boolean,
      required: true
    },
    shouldFollowCreator: {
      type: Boolean,
      required: true
    },
    shouldReactToPost: {
      type: Boolean,
      required: true
    },
    shouldCommentOnPost: {
      type: Boolean,
      required: true
    },
    shouldBePortalMember: {
      type: Boolean,
      required: true
    },
    distributedTokenAddress: {
      type: String,
      required: false
    },
    numberOfTokensAlreadyDistributed: {
      type: String,
      required: false
    },
    imageURI: {
      type: String,
      required: false
    },
    tokenMintAddress: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);
var CampaignModel = mongoose2.model("Campaigns", CampaignSchema);
CampaignSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret._id = void 0;
    ret.__v = void 0;
  }
});

// src/campaigns/campaign.service.ts
import { Types } from "mongoose";

// src/metaplex/SLP_Tokens.ts
import {
  generateSigner,
  percentAmount
} from "@metaplex-foundation/umi";

// src/metaplex/UMI.ts
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  keypairIdentity,
  createSignerFromKeypair
} from "@metaplex-foundation/umi";
import base58 from "bs58";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
var DEVNET_SECRET_KEY = process.env.DEVNET_SECRET_KEY;
var secret = base58.decode(DEVNET_SECRET_KEY || "");
var umi = createUmi("https://api.devnet.solana.com").use(mplTokenMetadata()).use(mplToolbox()).use(irysUploader());
var myKeypair = umi.eddsa.createKeypairFromSecretKey(secret);
var myKeypairSigner = createSignerFromKeypair(umi, myKeypair);
umi.use(keypairIdentity(myKeypairSigner));
var UMI_default = umi;

// src/metaplex/SLP_Tokens.ts
import { HTTPException } from "hono/http-exception";
import { createFungible } from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo
} from "@metaplex-foundation/mpl-toolbox";
import { base58 as base582 } from "@metaplex-foundation/umi/serializers";
var createSLPToken = async (imageURI, tokenName, tokenSymbol) => {
  const metadataUri = await UMI_default.uploader.uploadJson({
    name: tokenName,
    symbol: tokenSymbol,
    description: "",
    // Integrate Later
    image: imageURI
  }).catch((err) => {
    throw new HTTPException(500, {
      message: "Error with Uploading Metadata",
      cause: err
    });
  });
  const mintSigner = generateSigner(UMI_default);
  const createFungibleIx = await createFungible(UMI_default, {
    mint: mintSigner,
    name: tokenName,
    uri: metadataUri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 0
    // set the amount of decimals you want your token to have.
  });
  const tx = await createFungibleIx.sendAndConfirm(UMI_default);
  const signature = base582.deserialize(tx.signature)[0];
  return { signature, mintPublicKey: mintSigner.publicKey };
};
var mintSLPToken = async (mintPublicKey, receiverWalletAddress, amount) => {
  const createTokenIx = createTokenIfMissing(UMI_default, {
    mint: mintPublicKey,
    owner: receiverWalletAddress,
    ataProgram: getSplAssociatedTokenProgramId(UMI_default)
  });
  const mintTokensIx = mintTokensTo(UMI_default, {
    mint: mintPublicKey,
    token: findAssociatedTokenPda(UMI_default, {
      mint: mintPublicKey,
      owner: receiverWalletAddress
    }),
    amount: BigInt(amount)
  });
  const tx = await createTokenIx.add(mintTokensIx).sendAndConfirm(UMI_default);
  const signature = base582.deserialize(tx.signature)[0];
  return { signature };
};

// src/campaigns/campaign.service.ts
import { createGenericFile, publicKey } from "@metaplex-foundation/umi";

// src/metaplex/NFT_Tokens.ts
import { createNft } from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner as generateSigner2,
  percentAmount as percentAmount2
} from "@metaplex-foundation/umi";
import { base58 as base583 } from "@metaplex-foundation/umi/serializers";
var mintNFTToken = async (imageURI, nftName, receiverWalletAddress, amount) => {
  const uri = await UMI_default.uploader.uploadJson({
    name: nftName,
    description: "",
    image: imageURI
  });
  const mint = generateSigner2(UMI_default);
  const signatures = [];
  for (let i = 0; i < amount; i++) {
    const tx = await createNft(UMI_default, {
      mint,
      name: nftName,
      uri,
      sellerFeeBasisPoints: percentAmount2(0),
      tokenOwner: receiverWalletAddress
    }).sendAndConfirm(UMI_default);
    const signature = base583.deserialize(tx.signature)[0];
    signatures.push(signature);
  }
  return { signatures };
};

// src/campaigns/campaign.service.ts
var createCampaign = async (campaignData) => {
  const campaign = new CampaignModel(campaignData);
  campaign.slug = campaignData.title.toLowerCase().replace(/ /g, "_").replace(/^[a-zA-Z\_]$/, "");
  campaign.status = "active" /* ACTIVE */;
  if (campaignData.image) {
    try {
      const { file, imageBuffer } = await generateFile(campaignData.image);
      const tokenImageFile = createGenericFile(
        new Uint8Array(imageBuffer),
        file.name,
        {
          tags: [{ name: "contentType", value: file.type }]
        }
      );
      const [imageUri] = await UMI_default.uploader.upload([tokenImageFile]);
      campaign.imageURI = imageUri;
    } catch (err) {
      console.log(err);
      throw new HTTPException2(500, {
        message: "Error with Uploading Image",
        cause: err
      });
    }
  }
  return await campaign.save();
};
var getCampaigns = async (page, limit, query = {}) => {
  return await paginatedData(CampaignModel, page, limit, query);
};
var getCreatorCampaigns = async (walletAddress, page, limit, _query = {}) => {
  const query = { ..._query, creator: walletAddress.toLocaleLowerCase() };
  return await paginatedData(CampaignModel, page, limit, query);
};
var getCampaignLeaderBoard = async (campaignId, page, limit, _query = {}) => {
  const query = { ..._query, campaign: new Types.ObjectId(campaignId) };
  return await paginatedData(CampaignLeaderBoardModel, page, limit, query);
};
var getCampaignById = async (id) => {
  return await CampaignModel.findOne({ _id: id });
};
var interactWithCampaign = async (campaignId, userId, userWalletAddress) => {
  const campaign = await CampaignModel.findOne({ _id: campaignId });
  if (!campaign)
    throw new HTTPException2(404, { message: "Campaign not found" });
  if (campaign.maxDistribution === campaign.numberOfTokensAlreadyDistributed)
    throw new HTTPException2(400, { message: "Max Distribution Reached" });
  if (campaign.distribution === "TOKEN" /* TOKEN */) {
    if (campaign.tokenMintAddress) {
      const mintResponse2 = await mintSLPToken(
        publicKey(campaign.tokenMintAddress),
        publicKey(userWalletAddress),
        1
      );
      return mintResponse2.signature;
    }
    const response = await createSLPToken(
      campaign.imageURI,
      campaign.tokenName || "",
      campaign.tokenSymbol || ""
    );
    await CampaignModel.updateOne(
      {
        _id: campaignId
      },
      {
        tokenMintAddress: response.mintPublicKey,
        $inc: { numberOfTokensAlreadyDistributed: 1 }
      }
    );
    const mintResponse = await mintSLPToken(
      publicKey(response.mintPublicKey),
      publicKey(userWalletAddress),
      1
    );
    return mintResponse.signature;
  }
  if (campaign.distribution === "NFT" /* NFT */) {
    const response = await mintNFTToken(
      campaign.imageURI,
      campaign.tokenName || "",
      publicKey(userWalletAddress),
      1
    );
    return response.signatures[0];
  }
};

// src/campaigns/campaign.validation.ts
import Joi from "joi";
var createCampaignValidation = Joi.object({
  title: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  setEndDate: Joi.boolean().optional(),
  creator: Joi.string().required(),
  status: Joi.string().valid("ACTIVE", "INACTIVE").required(),
  image: Joi.any().optional(),
  imageURI: Joi.string().optional(),
  tokenName: Joi.string().optional(),
  tokenSymbol: Joi.string().optional(),
  distribution: Joi.string().valid("NFT", "TOKEN").required(),
  maxDistribution: Joi.number().required(),
  requiredNumberOfDSCVRPoints: Joi.number().required(),
  requiredDSCVRStreakDays: Joi.number().required(),
  allowRecentAccounts: Joi.boolean().required(),
  shouldFollowCreator: Joi.boolean().required(),
  shouldReactToPost: Joi.boolean().required(),
  shouldCommentOnPost: Joi.boolean().required(),
  shouldBePortalMember: Joi.boolean().required()
});
var queryValidation = Joi.object({
  page: Joi.number().optional().allow(null).empty("").integer().min(1).message("Page must be a positive integer"),
  limit: Joi.number().optional().allow(null).empty("").integer().min(1).message("Limit must be a positive integer")
});
var leaderBoardValidation = queryValidation.keys({
  campaignId: Joi.string().required()
});
var interactionValidation = Joi.object({
  campaignId: Joi.string().required(),
  userId: Joi.string().required(),
  walletAddress: Joi.string().required()
});

// src/database/mongoose.connection.ts
import mongoose3 from "mongoose";
var connectToMongoDB = (connectionString, cb) => {
  mongoose3.connect(connectionString, {}).then(() => {
    cb();
    console.log("Connected to MongoDB");
  }).catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
  });
};

// src/index.ts
import { HTTPException as HTTPException3 } from "hono/http-exception";
dotenv.config();
var MONGO_DB_URI = process.env.MONGO_DB_URI;
var PORT = process.env.PORT;
var app = new Hono();
app.use("*", cors());
app.use(logger());
app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.post(
  "/campaigns",
  validationMiddleware(createCampaignValidation),
  async (c) => {
    const body = await c.req.json();
    try {
      const newCampaign = await createCampaign(body);
      return c.json({
        message: "Campaign created successfully",
        data: newCampaign
      });
    } catch (e) {
      console.log(e);
      throw new HTTPException3(400, {
        message: "Campaign creation failed",
        cause: e.message
      });
    }
  }
);
app.get("/campaign/:id", async (c) => {
  const id = c.req.param("id");
  const campaign = await getCampaignById(id);
  if (!campaign) {
    c.status(404);
    return c.json({ message: "Campaign not found" });
  }
  return c.json({ message: "Campaign details", data: campaign });
});
app.get("/campaigns", validationMiddleware(queryValidation), async (c) => {
  const { limit = 10, page = 1, ...q } = c.req.query();
  const campaigns = await getCampaigns(Number(page), Number(limit));
  return c.json({ message: "All campaigns", ...campaigns });
});
app.patch("/campaigns", (c) => {
  return c.json({ message: "Hello Hono!" });
});
app.get(
  "/campaigns/creators",
  validationMiddleware(queryValidation),
  async (c) => {
    const { limit = 10, page = 1, ...q } = c.req.query();
    const authHeader = c.req.header("Authorization");
    const walletAddress = authHeader?.split(" ")[1];
    console.log(authHeader);
    if (!walletAddress) {
      c.status(400);
      return c.json({ message: "Invalid walletAddress" });
    }
    const creatorCampaigns = await getCreatorCampaigns(
      walletAddress,
      Number(page),
      Number(limit)
    );
    return c.json({ message: "All creator campaign", ...creatorCampaigns });
  }
);
app.post(
  "/campaigns/:campaignId/interact",
  validationMiddleware(interactionValidation),
  async (c) => {
    const { campaignId } = c.req.param();
    const body = await c.req.json();
    const signature = await interactWithCampaign(
      campaignId,
      body.userId,
      body.walletAddress
    );
    return c.json({ message: "Campaign interaction successful", signature });
  }
);
app.get(
  "/campaigns/:campaignId/leader-board",
  validationMiddleware(leaderBoardValidation),
  async (c) => {
    const { campaignId } = c.req.param();
    const { limit = 10, page = 1, ...q } = c.req.query();
    const leaderBoard = await getCampaignLeaderBoard(
      campaignId,
      Number(page),
      Number(limit)
    );
    return c.json({ message: "Campaign Leader board", ...leaderBoard });
  }
);
connectToMongoDB(MONGO_DB_URI, () => {
  console.log(`Server is running on port ${PORT}`);
  serve({
    fetch: app.fetch,
    port: Number(PORT)
  });
});
