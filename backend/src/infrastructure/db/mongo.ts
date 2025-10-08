/**
 * Simple MongoDB connection helper.
 * Creates a single client and database instance for reuse.
 */
import { MongoClient, Db } from "mongodb";

export interface MongoConfig {
  uri: string;
  dbName: string;
}

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectMongo = async (config: MongoConfig): Promise<Db> => {
  if (db) return db;
  client = new MongoClient(config.uri);
  await client.connect();
  db = client.db(config.dbName);
  return db;
};

export const closeMongo = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};
