#!/usr/bin/env node
// Valida el reporte JSON de la última corrida y resume el veredicto
// en una línea legible. Un reporte vacío o sin generar no cuenta
// como éxito: el script sale con error en ese caso.
import { readFileSync, existsSync } from 'node:fs';

const REPORT = 'playwright-report/results.json';

if (!existsSync(REPORT)) {
  console.error(`Sin reporte: no se generó ${REPORT}. La corrida no cuenta como éxito.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(REPORT, 'utf8'));
const suites = report.suites ?? [];
const specs = suites.flatMap((s) => s.specs ?? []);
const results = specs.flatMap((s) =>
  (s.tests ?? []).flatMap((t) => (t.results ?? []).map((r) => ({ title: s.title, status: r.status }))),
);

const passed = results.filter((r) => r.status === 'passed').length;
const failed = results.filter((r) => r.status !== 'passed' && r.status !== 'skipped');
const skipped = results.filter((r) => r.status === 'skipped').length;

if (results.length === 0) {
  console.error('Reporte vacío: ninguna prueba registrada. La corrida no cuenta como éxito.');
  process.exit(1);
}

console.log(`Flujo inicial EFL (DEV): ${passed} pasaron, ${failed.length} fallaron, ${skipped} omitidas, de ${results.length}.`);
for (const f of failed) {
  console.log(`FALLÓ: ${f.title} (${f.status})`);
}
process.exit(failed.length > 0 ? 1 : 0);
