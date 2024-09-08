import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import Joi from 'joi';
import { Model } from 'mongoose';

export const paginatedData = async <T>(model: Model<T>, page: number, limit: number, query = {}) => {
  page = page < 1 ? 1 : page;
  limit = limit ?? '10';
  const total = await model.countDocuments(query);
  const results = await model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  return {
    data: results,
    metaData: {
      page,
      limit,
      total,
    }
  }
}

export const validationMiddleware = (schema: Joi.ObjectSchema) => createMiddleware(async (c, next) => {
  const jsonData = await getJsonData(c);
  const queryData = c.req.query();
  const paramData = c.req.param();
  const data = { ...jsonData, ...queryData, ...paramData };
  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    console.log('errors')
    c.status(400);
    c.res = new Response(JSON.stringify({ error: error.details.map(e => e.message) }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return;
  }
  await next();
});


export const getJsonData = async (c: Context<any, string, {}>) => {
  try {
    return await c.req.json();
  } catch (error) {
    return {};
  }
}