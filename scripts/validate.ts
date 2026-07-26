import { validateEvidence } from '../src/utils/validateEvidence';

const issues = validateEvidence();
const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');

for (const i of issues) {
  console.log(`${i.level === 'error' ? 'ERROR' : 'warn '}  ${i.where}: ${i.message}`);
}
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length > 0 ? 1 : 0);
