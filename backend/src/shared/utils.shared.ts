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