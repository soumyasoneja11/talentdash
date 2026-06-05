import type { Metadata } from 'next';
import type { Company, CompanyStats, SalaryFilters } from '@/types/salary';
import { formatCurrency, convertCurrency } from '@/lib/utils';
import { COMPANIES, SALARY_RECORDS } from '@/lib/mock-data';

export const BASE_METADATA = {
  siteName: 'TalentDash',
  locale: 'en_IN',
  type: 'website',
} as const;

const cleanCompanySuffix = (name: string): string => {
  return name
    .replace(
      /\s+(India|Corporation|Pvt|Ltd|Internet|Corp|Services|Technologies|Ltd\.)\b/gi,
      ''
    )
    .trim();
};

const getCleanCompanyName = (companyInput: string): string => {
  const query = companyInput.trim().toLowerCase();
  const match = COMPANIES.find(
    (c) =>
      c.slug.toLowerCase() === query ||
      c.normalized_name.toLowerCase() === query ||
      c.name.toLowerCase().includes(query)
  );
  if (match) {
    return cleanCompanySuffix(match.name);
  }
  return (
    companyInput.trim().charAt(0).toUpperCase() + companyInput.trim().slice(1)
  );
};

export function buildSalaryPageMeta(
  filters: Partial<SalaryFilters>,
  recordCount: number
): Metadata {
  const hasCompany = !!filters.company?.trim();
  const hasRole = !!filters.role?.trim();
  const hasLevel = !!(filters.level && filters.level.length > 0);

  const company = hasCompany ? getCleanCompanyName(filters.company!) : '';
  const role = hasRole ? filters.role!.trim() : '';
  const level = hasLevel ? filters.level!.join('/') : '';

  let title = '';

  if (!hasCompany && !hasRole && !hasLevel) {
    title = 'Tech Salaries in India | TalentDash';
  } else if (hasCompany && !hasLevel && !hasRole) {
    title = `${company} Salaries in India | TalentDash`;
  } else if (hasCompany && hasLevel && !hasRole) {
    title = `${company} ${level} Engineer Salary India | TalentDash`;
  } else if (hasRole && !hasCompany && !hasLevel) {
    const rolePlural =
      role.toLowerCase().endsWith('engineer') ||
      role.toLowerCase().endsWith('analyst') ||
      role.toLowerCase().endsWith('manager')
        ? `${role}s`
        : role;
    title = `${rolePlural} Salaries in India | TalentDash`;
  } else if (hasCompany && hasRole && !hasLevel) {
    title = `${company} ${role} Salaries in India | TalentDash`;
  } else if (hasCompany && hasLevel && hasRole) {
    title = `${company} ${level} ${role} Salary India | TalentDash`;
  } else if (!hasCompany && hasLevel && hasRole) {
    title = `${level} ${role} Salaries in India | TalentDash`;
  } else if (!hasCompany && hasLevel && !hasRole) {
    title = `${level} Tech Salaries in India | TalentDash`;
  } else {
    title = 'Tech Salaries in India | TalentDash';
  }

  const filterText = [company, level, role].filter(Boolean).join(' ');
  const description = `Browse ${recordCount} verified tech salary record${
    recordCount === 1 ? '' : 's'
  } in India. See base salary, stock, bonus, and total compensation breakdowns${
    filterText ? ` for ${filterText}` : ''
  }.`;

  const canonical = 'https://talentdash.com/salaries';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: BASE_METADATA.siteName,
      locale: BASE_METADATA.locale,
      type: BASE_METADATA.type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}

export function buildCompanyPageMeta(
  company: Company,
  stats: CompanyStats
): Metadata {
  const companyRecords = SALARY_RECORDS.filter(
    (r) => r.company_slug === company.slug
  );
  const isPrimaryUsd =
    companyRecords.filter((r) => r.currency === 'USD').length >
    companyRecords.filter((r) => r.currency === 'INR').length;

  let medianInr = stats.median_total_compensation;
  if (isPrimaryUsd) {
    medianInr = convertCurrency(stats.median_total_compensation, 'USD', 'INR');
  }

  const compactVal = formatCurrency(medianInr, 'INR', 'INR', { compact: true });
  const compactMedian = compactVal.replace(/^₹/, '');

  const median = Math.round(medianInr).toLocaleString('en-IN');

  const levelCount = Object.values(stats.level_distribution).filter(
    (count) => count > 0
  ).length;

  const title = `${company.name} Salaries — ₹${compactMedian} Median TC | TalentDash`;
  const description = `Verified salary data for ${company.name}. ${stats.record_count} records. Median total compensation ₹${median} across ${levelCount} levels.`;
  const canonical = `https://talentdash.com/companies/${company.slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: BASE_METADATA.siteName,
      locale: BASE_METADATA.locale,
      type: BASE_METADATA.type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical,
    },
  };
}
