# Elasticsearch Data Seeder

A Node.js TypeScript Scripts for setting up Elasticsearch indices and seeding them with mock data.

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create an `.env` file based on the example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Elasticsearch connection details

## Configuration

### Index Configuration

Indices are configured in `src/config/indices.json`. Each index configuration includes:

- `name`: The name of the index
- `reindex`: Whether to recreate the index if it already exists
- `body`: Mappings and other index body configurations
- `metadata`: Settings for the index

## Usage

### Set up indices

To set up the indices defined in the configuration:

```bash
npm run setup-indices
```

### Seed data

To seed data with default settings (10,000 documents per index):

```bash
npm run seed-data
```

#### With custom document count

```bash
# Seed with 100 documents per index
npm run seed-data:small

# Seed with 1,000 documents per index
npm run seed-data:medium

# Seed with 10,000 documents per index
npm run seed-data:large
```

#### With custom parameters

You can also run the seed script directly with custom parameters:

```bash
# Specify batch size and documents per index
npx ts-node src/scripts/seedData.ts --batch-size 500 --documents-per-index 5000

# Seed only specific indices
npx ts-node src/scripts/seedData.ts --indices index1,index2
```