export type LevelEnum =
  | 'L3'
  | 'L4'
  | 'L5'
  | 'L6'
  | 'SDE_I'
  | 'SDE_II'
  | 'SDE_III'
  | 'STAFF'
  | 'PRINCIPAL'
  | 'IC4'
  | 'IC5';

export type CurrencyEnum = 'INR' | 'USD' | 'GBP' | 'EUR';

export type SourceEnum = 'CONTRIBUTOR' | 'SCRAPED' | 'AI_INFERRED';

export interface SalaryRecord {
  id: string;
  company: string; // normalized lowercase
  company_slug: string; // URL-safe slug
  company_display: string; // formatted display name e.g. "Google India"
  role: string;
  level_standardized: LevelEnum;
  location: string;
  currency: CurrencyEnum;
  experience_years: number;
  base_salary: number; // in smallest unit (paise for INR, cents for USD)
  bonus: number; // defaults to 0, never null
  stock: number; // defaults to 0, never null
  /**
   * Derived total compensation; must equal base + bonus + stock.
   * Do not trust client-provided values for this field.
   */
  total_compensation: number;
  source: SourceEnum;
  /**
   * Confidence score for inferred or noisy records, range 0.0 to 1.0.
   */
  confidence_score: number;
  submitted_at: string; // ISO timestamp string
  is_verified: boolean;
}

export interface Company {
  id: string;
  name: string; // display name
  slug: string; // URL-safe slug
  normalized_name: string; // lowercase, for lookups
  industry?: string;
  headquarters?: string;
  founded_year?: number;
  headcount_range?: string;
  website?: string;
  rating?: number;
  review_count?: number;
}

export interface SalaryFilters {
  company?: string;
  role?: string;
  level?: LevelEnum[];
  location?: string;
  currency?: CurrencyEnum;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CompanyStats {
  median_total_compensation: number;
  min_tc: number;
  max_tc: number;
  record_count: number;
  level_distribution: Record<LevelEnum, number>;
}
