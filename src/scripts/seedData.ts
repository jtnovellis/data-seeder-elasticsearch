import { getElasticsearchClient } from '../utils/elasticsearch';
import { IndexConfig, Document, Comment } from '../models/types';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';

const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_DOCUMENTS_PER_INDEX = 10000;

interface SeedOptions {
  batchSize?: number;
  documentsPerIndex?: number;
  specificIndices?: string[];
}

function generateComment(): Comment {
  return {
    type: faker.helpers.arrayElement(['info', 'warning', 'error', 'success']),
    content: faker.lorem.paragraph(),
    user: faker.internet.username(),
    timestamp: faker.date.recent(),
  };
}

function generateDocument(): Document {
  const commentsCount = faker.number.int({ min: 0, max: 5 });
  const comments: Comment[] = Array.from({ length: commentsCount }, () => generateComment());

  return {
    title: faker.lorem.sentence(),
    comments: comments,
    published_at: faker.date.recent().toISOString(),
    category: faker.helpers.arrayElement(['drug', 'lab', 'test', 'procedure']),
  };
}

async function seedData(options: SeedOptions = {}): Promise<void> {
  try {
    console.log('Starting data seeding process...');
    const client = getElasticsearchClient();

    const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
    const documentsPerIndex = options.documentsPerIndex || DEFAULT_DOCUMENTS_PER_INDEX;

    const configPath = path.resolve(__dirname, '../config/indices.json');
    const indicesConfig = JSON.parse(fs.readFileSync(configPath, 'utf8')) as IndexConfig[];

    const indicesToSeed = options.specificIndices
      ? indicesConfig.filter(config => options.specificIndices?.includes(config.name))
      : indicesConfig;

    console.log(`Seeding ${indicesToSeed.length} indices with ${documentsPerIndex} documents each`);

    for (const indexConfig of indicesToSeed) {
      const { name } = indexConfig;
      console.log(`Seeding index: ${name}`);

      for (let i = 0; i < documentsPerIndex; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, documentsPerIndex - i);
        console.log(`Processing batch ${i / batchSize + 1} (${currentBatchSize} documents)...`);

        const operations: any[] = [];

        for (let j = 0; j < currentBatchSize; j++) {
          const document = generateDocument();

          operations.push(
            { index: { _index: name } },
            document
          );
        }

        const bulkResponse = await client.bulk({
          operations,
          refresh: true
        });

        if (bulkResponse.errors) {
          console.error('Errors during bulk operation:',
            bulkResponse.items?.filter(item => item.index?.error).map(item => item.index?.error));
        }

        console.log(`Batch ${i / batchSize + 1} completed.`);
      }

      console.log(`Seeding completed for index: ${name}`);
    }

    console.log('Data seeding process completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const options: SeedOptions = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch-size' && args[i + 1]) {
      options.batchSize = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--documents-per-index' && args[i + 1]) {
      options.documentsPerIndex = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--indices' && args[i + 1]) {
      options.specificIndices = args[i + 1].split(',');
      i++;
    }
  }

  seedData(options)
    .then(() => {
      console.log('Data seeding completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed data:', error);
      process.exit(1);
    });
}

export default seedData;