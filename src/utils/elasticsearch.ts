import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const ELASTICSEARCH_USERNAME = process.env.ELASTICSEARCH_USERNAME || '';
const ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD || '';

export const createElasticsearchClient = (): Client => {
  const clientConfig: Record<string, any> = {
    node: ELASTICSEARCH_NODE,
  };

  if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
    clientConfig.auth = {
      username: ELASTICSEARCH_USERNAME,
      password: ELASTICSEARCH_PASSWORD,
    };
  }

  return new Client(clientConfig);
};

let clientInstance: Client | null = null;

export const getElasticsearchClient = (): Client => {
  if (!clientInstance) {
    clientInstance = createElasticsearchClient();
  }
  return clientInstance;
};