
import mongoose from 'mongoose';

export const connectToMongoDB = (connectionString: string, cb: () => void): void => {
  mongoose.connect(connectionString, {})
    .then(() => {
      cb();
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
    });
};
