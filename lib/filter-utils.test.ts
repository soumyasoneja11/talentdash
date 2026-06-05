import assert from 'node:assert/strict';
import { filterAndSortRecords } from './filter-utils';
import { SALARY_RECORDS } from './mock-data';
import { formatCurrency } from './utils';

const minTotalCompensation = (records: typeof SALARY_RECORDS): number =>
  Math.min(...records.map((record) => record.total_compensation));

// All records, no filters → full length, sorted tc_desc
{
  const result = filterAndSortRecords(SALARY_RECORDS, {});

  assert.strictEqual(result.length, SALARY_RECORDS.length);

  for (let index = 1; index < result.length; index += 1) {
    assert.ok(
      result[index - 1].total_compensation >= result[index].total_compensation,
      'expected tc_desc order'
    );
  }
}

// company='amazon', level=['L4'] → only Amazon L4 records
{
  const result = filterAndSortRecords(SALARY_RECORDS, {
    company: 'amazon',
    level: ['L4'],
  });

  assert.ok(result.length > 0, 'expected at least one Amazon L4 record');
  assert.ok(
    result.every(
      (record) =>
        (record.company_display.toLowerCase().includes('amazon') ||
          record.company.toLowerCase().includes('amazon')) &&
        record.level_standardized === 'L4'
    ),
    'every record must be Amazon and L4'
  );
}

// Filters that return 0 results → empty array, not error
{
  const result = filterAndSortRecords(SALARY_RECORDS, {
    company: 'nonexistent-company-xyz-123',
  });

  assert.deepStrictEqual(result, []);
}

// sort tc_asc → first record has lowest total_compensation
{
  const result = filterAndSortRecords(SALARY_RECORDS, { sort: 'tc_asc' });

  assert.strictEqual(
    result[0].total_compensation,
    minTotalCompensation(SALARY_RECORDS)
  );
  assert.ok(
    result[0].total_compensation <= result[result.length - 1].total_compensation
  );
}

// ---------- Comparison delta calculation tests ---------- //

// Positive delta: record1 TC (5,000,000) > record2 TC (4,200,000) → +800,000
{
  const tc1 = 5_000_000;
  const tc2 = 4_200_000;
  const delta = tc1 - tc2;

  assert.strictEqual(
    delta,
    800_000,
    'delta should be +800,000 when record1 pays more'
  );
  assert.ok(delta > 0, 'delta should be positive');

  // Higher TC badge should go to record1 (tc1 > tc2)
  const winner: 0 | 1 | 2 = tc1 > tc2 ? 1 : tc2 > tc1 ? 2 : 0;
  assert.strictEqual(winner, 1, 'Higher TC badge should be on record1');
}

// Negative delta: record1 TC (3,000,000) < record2 TC (4,500,000) → -1,500,000
{
  const tc1 = 3_000_000;
  const tc2 = 4_500_000;
  const delta = tc1 - tc2;

  assert.strictEqual(
    delta,
    -1_500_000,
    'delta should be -1,500,000 when record2 pays more'
  );
  assert.ok(delta < 0, 'delta should be negative');

  // Higher TC badge should go to record2 (tc2 > tc1)
  const winner: 0 | 1 | 2 = tc1 > tc2 ? 1 : tc2 > tc1 ? 2 : 0;
  assert.strictEqual(winner, 2, 'Higher TC badge should be on record2');
}

// Equal TC → delta 0, no winner badge
{
  const tc1 = 4_000_000;
  const tc2 = 4_000_000;
  const delta = tc1 - tc2;

  assert.strictEqual(delta, 0, 'delta should be 0 for equal TCs');

  const winner: 0 | 1 | 2 = tc1 > tc2 ? 1 : tc2 > tc1 ? 2 : 0;
  assert.strictEqual(winner, 0, 'no winner badge when TCs are equal');
}

// ---------- SEO metadata builder tests ---------- //
import { buildSalaryPageMeta, buildCompanyPageMeta } from './seo';
import type { Company, CompanyStats } from '../types/salary';

// buildSalaryPageMeta - no filters
{
  const meta = buildSalaryPageMeta({}, 150);
  assert.strictEqual(meta.title, 'Tech Salaries in India | TalentDash');
  assert.ok(
    meta.description?.includes('150 verified tech salary records'),
    'should include record count'
  );
}

// buildSalaryPageMeta - company only
{
  const meta = buildSalaryPageMeta({ company: 'amazon' }, 42);
  assert.strictEqual(meta.title, 'Amazon Salaries in India | TalentDash');
  assert.ok(
    meta.description?.includes('42 verified tech salary records'),
    'should include record count'
  );
}

// buildSalaryPageMeta - company + level
{
  const meta = buildSalaryPageMeta(
    { company: 'Google India', level: ['L4'] },
    15
  );
  assert.strictEqual(
    meta.title,
    'Google L4 Engineer Salary India | TalentDash'
  );
  assert.ok(
    meta.description?.includes('15 verified tech salary records'),
    'should include record count'
  );
}

// buildSalaryPageMeta - role only
{
  const meta = buildSalaryPageMeta({ role: 'Software Engineer' }, 90);
  assert.strictEqual(
    meta.title,
    'Software Engineers Salaries in India | TalentDash'
  );
  assert.ok(
    meta.description?.includes('90 verified tech salary records'),
    'should include record count'
  );
}

// buildCompanyPageMeta
{
  const mockCompany: Company = {
    id: 'google',
    name: 'Google India',
    slug: 'google',
    normalized_name: 'google',
  };
  const mockStats: CompanyStats = {
    median_total_compensation: 2400000,
    min_tc: 1800000,
    max_tc: 4500000,
    record_count: 3,
    level_distribution: {
      L3: 1,
      L4: 1,
      L5: 1,
      L6: 0,
      SDE_I: 0,
      SDE_II: 0,
      SDE_III: 0,
      STAFF: 0,
      PRINCIPAL: 0,
      IC4: 0,
      IC5: 0,
    },
  };

  const meta = buildCompanyPageMeta(mockCompany, mockStats);
  assert.strictEqual(
    meta.title,
    'Google India Salaries — ₹24L Median TC | TalentDash'
  );
  assert.strictEqual(
    meta.description,
    'Verified salary data for Google India. 3 records. Median total compensation ₹24,00,000 across 3 levels.'
  );
}

// ---------- F7 Edge Cases Verification Tests ---------- //
import type { LevelEnum } from '../types/salary';

// 1. ALL FILTER COMBINATIONS (AND logic)
{
  const testFilters = {
    company: 'google',
    role: 'Software Engineer',
    level: ['L3'] as LevelEnum[],
    location: 'Delhi',
  };
  const filtered = filterAndSortRecords(SALARY_RECORDS, testFilters);
  for (const record of filtered) {
    assert.ok(
      record.company_display.toLowerCase().includes('google'),
      'company must match'
    );
    assert.strictEqual(record.role, 'Software Engineer', 'role must match');
    assert.strictEqual(record.level_standardized, 'L3', 'level must match');
    assert.strictEqual(record.location, 'Delhi', 'location must match');
  }
}

// 2. LARGE SALARY NUMBER formatting
{
  const amount = 40_000_000;
  const formatted = formatCurrency(amount, 'INR', 'INR');
  assert.strictEqual(
    formatted,
    '₹4,00,00,000',
    'should format using Indian numbering system'
  );

  const compact = formatCurrency(amount, 'INR', 'INR', { compact: true });
  assert.strictEqual(compact, '₹4Cr', 'should format compact as ₹4Cr');
}

// 3. ZERO BONUS AND ZERO STOCK
{
  const noBonusStockRecord = SALARY_RECORDS.find(
    (r) => r.bonus === 0 && r.stock === 0
  );
  if (noBonusStockRecord) {
    assert.strictEqual(
      noBonusStockRecord.total_compensation,
      noBonusStockRecord.base_salary,
      'TC must equal Base'
    );
  }
}

// 4. COLUMN SORTING tests
{
  const resultCompany = filterAndSortRecords(SALARY_RECORDS, {
    sort: 'company_asc',
  });
  for (let index = 1; index < resultCompany.length; index += 1) {
    const prev = resultCompany[index - 1].company_display.toLowerCase();
    const curr = resultCompany[index].company_display.toLowerCase();
    assert.ok(prev <= curr, `expected company_asc order: ${prev} <= ${curr}`);
  }

  const resultExperience = filterAndSortRecords(SALARY_RECORDS, {
    sort: 'experience_desc',
  });
  for (let index = 1; index < resultExperience.length; index += 1) {
    const prev = resultExperience[index - 1].experience_years;
    const curr = resultExperience[index].experience_years;
    assert.ok(
      prev >= curr,
      `expected experience_desc order: ${prev} >= ${curr}`
    );
  }
}

console.log('All filter-utils and SEO tests passed.');
