import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import Joi from "joi";
import { Model } from "mongoose";

export const paginatedData = async <T>(
  model: Model<T>,
  _page: number,
  _limit: number,
  query = {}
) => {
  const page = _page < 1 ? 1 : _page;
  const limit = _limit ?? "10";
  const total = await model.countDocuments(query);
  const results = await model
    .find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return {
    data: results,
    metaData: {
      page,
      limit,
      total,
    },
  };
};

export const validationMiddleware = (schema: Joi.ObjectSchema) =>
  createMiddleware(async (c, next) => {
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
            "Content-Type": "application/json",
          },
        }
      );
      return;
    }
    await next();
  });

export const getJsonData = async (c: Context<any, string, {}>) => {
  try {
    return await c.req.json();
  } catch (error) {
    console.log(error);
    return {};
  }
};

export const generateFile = async (image: any) => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let imageUri;
  if (typeof image === "string") {
    if (image.startsWith("data:image")) {
      // If it's a base64 string, convert it to a File object
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
