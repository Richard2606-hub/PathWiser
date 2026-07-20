import fs from 'fs';
import path from 'path';
import { generateCorpus, getCorpusStats } from '../lib/corpus';

function main() {
  console.log('Generating synthetic trajectory corpus...');
  const start = Date.now();
  const corpus = generateCorpus(1500, 42);
  const duration = Date.now() - start;

  console.log(`\n\x1b[32m✓ Generated ${corpus.length} trajectories in ${duration}ms\x1b[0m`);

  // Print statistics
  const stats = getCorpusStats();
  console.log('\nCorpus Breakdown:');
  console.log('=================');
  console.log(`Total Trajectories: ${stats.total}`);
  
  console.log('\nSectors:');
  for (const [sector, count] of Object.entries(stats.sectors)) {
    console.log(`  - ${sector}: ${count}`);
  }

  console.log('\nLife Stages:');
  for (const [stage, count] of Object.entries(stats.life_stages)) {
    console.log(`  - ${stage}: ${count}`);
  }

  // Save the raw generated corpus to a JSON file for inspection/caching
  const outputPath = path.join(process.cwd(), 'scripts', 'corpus-raw.json');
  console.log(`\nSaving raw corpus data to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(corpus, null, 2), 'utf8');
  console.log('\x1b[32m✓ Saved successfully!\x1b[0m');
}

main();
