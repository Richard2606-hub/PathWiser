import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const spec = parse(await readFile(new URL('../openapi.yaml', import.meta.url), 'utf8'));
const navigate = spec?.paths?.['/api/engine/navigate']?.post;
const request = spec?.components?.schemas?.NavigateRequest;

if (spec?.openapi !== '3.1.0') throw new Error('openapi.yaml must declare OpenAPI 3.1.0.');
if (!navigate?.responses?.['200'] || !navigate.responses?.['503']) {
  throw new Error('Navigation API must document both successful and temporarily unavailable responses.');
}
if (!request?.properties?.evidenceMode?.enum?.includes('modelled') ||
    !request.properties.evidenceMode.enum.includes('community')) {
  throw new Error('NavigateRequest must document the modelled/community evidence contract.');
}

console.log(JSON.stringify({
  openapi: spec.openapi,
  paths: Object.keys(spec.paths || {}).length,
  schemas: Object.keys(spec.components?.schemas || {}).length,
}));
