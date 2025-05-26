import { getElasticsearchClient } from '../utils/elasticsearch';
import { IndexConfig } from '../models/types';
import fs from 'fs';
import path from 'path';

async function setupIndices(): Promise<void> {
  try {
    console.log('Starting indices setup...');
    const client = getElasticsearchClient();

    const configPath = path.resolve(__dirname, '../config/indices.json');
    const indicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')) as IndexConfig[];

    console.log(`Found ${indicesConfig.length} indices in configuration`);

    for (const indexConfig of indicesConfig) {
      const { name, reindex, body, metadata } = indexConfig;

      const indexExists = await client.indices.exists({ index: name });

      if (indexExists && reindex) {
        console.log(`Index ${name} exists and reindex is true. Deleting existing index...`);
        await client.indices.delete({ index: name });
        console.log(`Index ${name} deleted.`);
      }

      if (!indexExists || reindex) {
        console.log(`Creating index ${name}...`);

        const createIndexParams: any = {
          index: name,
          body: {
            mappings: body.mappings,
            settings: metadata.settings
          }
        };

        await client.indices.create(createIndexParams);

        console.log(`Index ${name} created successfully.`);
      } else {
        console.log(`Index ${name} already exists and reindex is false. Skipping.`);
      }
    }

    console.log('Indices setup completed successfully!');
  } catch (error) {
    console.error('Error setting up indices:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setupIndices()
    .then(() => {
      console.log('Indices setup completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to set up indices:', error);
      process.exit(1);
    });
}

export default setupIndices;