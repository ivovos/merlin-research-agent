/**
 * Brand Registry — canonical mapping between Account.name and Account.id
 *
 * This is the single source of truth for which brand names belong to which
 * account. Used by useProjectStore to filter projects by account.
 */

export const BRAND_TO_ACCOUNT_ID: Record<string, string> = {
  'Vodafone': 'vodafone',
  'Disney+': 'disney',
  'BP': 'bp',
  'MUBI': 'mubi',
}

/** Get the account ID for a given brand name */
export function getAccountIdForBrand(brand: string): string | undefined {
  return BRAND_TO_ACCOUNT_ID[brand]
}

/** Get all brand names that belong to a given account ID */
export function getBrandNamesForAccount(accountId: string): string[] {
  return Object.entries(BRAND_TO_ACCOUNT_ID)
    .filter(([, id]) => id === accountId)
    .map(([brand]) => brand)
}

/** The special "show everything" account ID */
export const ET_TEST_ACCOUNT_ID = 'et-test'
