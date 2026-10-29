const { z } = require('zod');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD')
  .refine((s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().startsWith(s), {
    message: 'Fecha inválida',
  });

const MAX_RANGE_DAYS = 366 * 3;

const dateRange = z
  .object({ from: isoDate, to: isoDate })
  .refine((d) => d.from <= d.to, {
    message: '"from" debe ser anterior o igual a "to"',
    path: ['from'],
  })
  .refine((d) => (Date.parse(d.to) - Date.parse(d.from)) / 86_400_000 <= MAX_RANGE_DAYS, {
    message: 'El rango máximo es de 3 años',
    path: ['to'],
  });

const empty = z.object({});

const topProducts = z
  .object({
    from: isoDate,
    to: isoDate,
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .superRefine((d, ctx) => {
    const r = dateRange.safeParse({ from: d.from, to: d.to });
    if (!r.success) r.error.issues.forEach((i) => ctx.addIssue(i));
  });

const cohorts = z
  .object({
    from: isoDate,
    to: isoDate,
    months: z.coerce.number().int().min(0).max(12).default(6),
  })
  .superRefine((d, ctx) => {
    const r = dateRange.safeParse({ from: d.from, to: d.to });
    if (!r.success) r.error.issues.forEach((i) => ctx.addIssue(i));
  });

module.exports = { dateRange, empty, topProducts, cohorts };
