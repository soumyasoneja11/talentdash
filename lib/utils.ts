import type { CurrencyEnum, LevelEnum, SalaryFilters } from '@/types/salary';
import { CONVERSION_RATES } from '@/lib/mock-data';

// CONVERSION_RATES is the SINGLE source of truth for currency conversion. Never hardcode rates elsewhere.

const LEVELS: LevelEnum[] = [
  'L3',
  'L4',
  'L5',
  'L6',
  'SDE_I',
  'SDE_II',
  'SDE_III',
  'STAFF',
  'PRINCIPAL',
  'IC4',
  'IC5',
];

const LEVEL_SET = new Set<LevelEnum>(LEVELS);

const normalizeAmount = (amount: number): number =>
  Number.isFinite(amount) ? amount : 0;

const formatCompactNumber = (value: number, suffix: string): string => {
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1);
  return `${formatted}${suffix}`;
};

const isInrOrUsd = (currency: CurrencyEnum): currency is 'INR' | 'USD' =>
  currency === 'INR' || currency === 'USD';

const formatAmount = (
  amount: number,
  currency: 'INR' | 'USD',
  options?: { compact?: boolean }
): string => {
  const compact = options?.compact ?? false;

  if (currency === 'INR') {
    if (compact) {
      if (amount >= 10000000) {
        return `₹${formatCompactNumber(amount / 10000000, 'Cr')}`;
      }
      if (amount >= 100000) {
        return `₹${formatCompactNumber(amount / 100000, 'L')}`;
      }
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  if (compact) {
    if (amount >= 1000000) {
      return `$${formatCompactNumber(amount / 1000000, 'M')}`;
    }
    if (amount >= 1000) {
      return `$${formatCompactNumber(amount / 1000, 'K')}`;
    }
  }

  return `$${amount.toLocaleString('en-US')}`;
};

/**
 * Formats a monetary amount, converting from record currency to display currency when needed.
 */
export const formatCurrency = (
  amount: number,
  recordCurrency: CurrencyEnum,
  displayCurrency: CurrencyEnum,
  options?: { compact?: boolean }
): string => {
  const safeAmount = normalizeAmount(amount);

  if (recordCurrency === displayCurrency) {
    return formatAmount(
      safeAmount,
      isInrOrUsd(displayCurrency) ? displayCurrency : 'INR',
      options
    );
  }

  if (isInrOrUsd(recordCurrency) && isInrOrUsd(displayCurrency)) {
    return formatAmount(
      convertCurrency(safeAmount, recordCurrency, displayCurrency),
      displayCurrency,
      options
    );
  }

  return formatAmount(
    safeAmount,
    isInrOrUsd(recordCurrency) ? recordCurrency : 'INR',
    options
  );
};

/**
 * Converts an amount between INR and USD using shared conversion rates.
 */
export const convertCurrency = (
  amount: number,
  from: 'INR' | 'USD',
  to: 'INR' | 'USD'
): number => {
  const safeAmount = normalizeAmount(amount);
  if (from === to) {
    return Math.round(safeAmount);
  }
  if (from === 'INR' && to === 'USD') {
    return Math.round(safeAmount * CONVERSION_RATES.INR_TO_USD);
  }
  return Math.round(safeAmount * CONVERSION_RATES.USD_TO_INR);
};

/**
 * Computes the statistical median for a numeric array.
 */
export const computeMedian = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
};

/**
 * Returns Tailwind badge styles and label for the supplied level.
 */
export const getLevelBadgeStyle = (
  level: LevelEnum
): { bg: string; text: string; label: string } => {
  switch (level) {
    case 'L3':
    case 'SDE_I':
      return { bg: 'bg-slate-100', text: 'text-slate-700', label: level };
    case 'L4':
    case 'SDE_II':
      return { bg: 'bg-blue-100', text: 'text-blue-700', label: level };
    case 'L5':
    case 'SDE_III':
      return { bg: 'bg-indigo-100', text: 'text-indigo-700', label: level };
    case 'L6':
    case 'STAFF':
      return { bg: 'bg-purple-100', text: 'text-purple-700', label: level };
    case 'PRINCIPAL':
      return { bg: 'bg-navy-100', text: 'text-navy-800', label: level };
    case 'IC4':
      return { bg: 'bg-cyan-100', text: 'text-cyan-700', label: level };
    case 'IC5':
      return { bg: 'bg-teal-100', text: 'text-teal-700', label: level };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', label: level };
  }
};

/**
 * Produces a URL-safe slug from an input string.
 */
export const slugify = (text: string): string => {
  const trimmed = text.trim().toLowerCase();
  const dashed = trimmed.replace(/\s+/g, '-');
  const stripped = dashed.replace(/[^a-z0-9-]/g, '');
  return stripped.replace(/-+/g, '-');
};

/**
 * Formats experience in years for display.
 */
export const formatExperience = (years: number): string => {
  if (years <= 0) {
    return '< 1 yr';
  }
  if (years === 1) {
    return '1 yr';
  }
  return `${years} yrs`;
};

/**
 * Serializes salary filters to a URL query string.
 */
export const buildSearchParams = (filters: Partial<SalaryFilters>): string => {
  const params = new URLSearchParams();

  const appendValue = (key: string, value: string): void => {
    if (value.trim().length === 0) {
      return;
    }
    params.append(key, value);
  };

  if (filters.company) {
    appendValue('company', filters.company);
  }
  if (filters.role) {
    appendValue('role', filters.role);
  }
  if (filters.location) {
    appendValue('location', filters.location);
  }
  if (filters.currency) {
    appendValue('currency', filters.currency);
  }
  if (filters.sort) {
    appendValue('sort', filters.sort);
  }
  if (filters.page !== undefined && Number.isFinite(filters.page)) {
    appendValue('page', String(filters.page));
  }
  if (filters.limit !== undefined && Number.isFinite(filters.limit)) {
    appendValue('limit', String(filters.limit));
  }
  if (filters.level && filters.level.length > 0) {
    filters.level.forEach((level) => appendValue('level', level));
  }

  return params.toString();
};

/**
 * Parses URL search parameters into salary filter state.
 */
export const parseSearchParams = (
  params: URLSearchParams
): Partial<SalaryFilters> => {
  const filters: Partial<SalaryFilters> = {};

  const company = params.get('company');
  const role = params.get('role');
  const location = params.get('location');
  const currency = params.get('currency');
  const sort = params.get('sort');
  const page = params.get('page');
  const limit = params.get('limit');
  const levels = params.getAll('level');

  if (company) {
    filters.company = company;
  }
  if (role) {
    filters.role = role;
  }
  if (location) {
    filters.location = location;
  }
  if (
    currency === 'INR' ||
    currency === 'USD' ||
    currency === 'GBP' ||
    currency === 'EUR'
  ) {
    filters.currency = currency;
  }
  if (
    sort &&
    (/^(company|role|level|location|experience|base|bonus|stock|tc)_(asc|desc)$/.test(
      sort
    ) ||
      sort === 'date_desc' ||
      sort === 'date_asc')
  ) {
    filters.sort = sort;
  }
  if (page) {
    const parsedPage = Number.parseInt(page, 10);
    if (Number.isFinite(parsedPage)) {
      filters.page = parsedPage;
    }
  }
  if (limit) {
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isFinite(parsedLimit)) {
      filters.limit = parsedLimit;
    }
  }
  if (levels.length > 0) {
    const parsedLevels = levels.filter((level): level is LevelEnum =>
      LEVEL_SET.has(level as LevelEnum)
    );
    if (parsedLevels.length > 0) {
      filters.level = parsedLevels;
    }
  }

  return filters;
};

/**
 * Clamps a number between inclusive min and max values.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * Joins class names, skipping falsy entries.
 */
export const cn = (...classes: (string | undefined | false | null)[]): string =>
  classes.filter((cls): cls is string => Boolean(cls)).join(' ');
