import { z } from 'zod';
import { CRMRecord, SkippedRecord } from '../types';

export const crmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
]).or(z.literal(''));

export const dataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
]).or(z.literal(''));

export const crmRecordSchema = z.object({
  created_at: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  country_code: z.string().optional(),
  mobile_without_country_code: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  lead_owner: z.string().optional(),
  crm_status: crmStatusEnum.optional(),
  crm_note: z.string().optional(),
  data_source: dataSourceEnum.optional(),
  possession_time: z.string().optional(),
  description: z.string().optional(),
});

function normalizeDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  return dateStr; // fallback if unparseable
}

function cleanPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  return phone.replace(/[^\d+]/g, '');
}

export function normalizeRecord(record: any): { data?: CRMRecord, reason?: string } {
  // Check completely empty row first
  if (!record || Object.keys(record).length === 0 || Object.values(record).every(v => !v || v.toString().trim() === '')) {
    return { reason: 'Completely empty row' };
  }

  // Pre-process date and phone
  if (record.created_at) {
    record.created_at = normalizeDate(record.created_at);
  }
  if (record.mobile_without_country_code) {
    record.mobile_without_country_code = cleanPhone(record.mobile_without_country_code);
  }

  const parsed = crmRecordSchema.safeParse(record);
  if (!parsed.success) {
    return { reason: 'Failed schema validation: ' + parsed.error.issues.map(i => i.message).join(', ') };
  }

  const data = parsed.data as CRMRecord;

  // Rule: If no email and no phone, skip record
  const hasEmail = data.email && data.email.trim() !== '';
  const hasPhone = data.mobile_without_country_code && data.mobile_without_country_code.trim() !== '';

  if (!hasEmail && !hasPhone) {
    return { reason: 'No email and no phone number provided' };
  }

  return { data };
}

export function deduplicateRecords(records: CRMRecord[]): CRMRecord[] {
  const emailMap = new Map<string, CRMRecord>();
  const phoneMap = new Map<string, CRMRecord>();
  const finalRecords: CRMRecord[] = [];

  for (const record of records) {
    let duplicateOf: CRMRecord | undefined = undefined;

    if (record.email && emailMap.has(record.email)) {
      duplicateOf = emailMap.get(record.email);
    } else if (record.mobile_without_country_code && phoneMap.has(record.mobile_without_country_code)) {
      duplicateOf = phoneMap.get(record.mobile_without_country_code);
    }

    if (duplicateOf) {
      // Merge notes
      const extraNotes = [];
      if (record.crm_note) extraNotes.push(record.crm_note);
      if (record.email && record.email !== duplicateOf.email) extraNotes.push(`Additional email: ${record.email}`);
      if (record.mobile_without_country_code && record.mobile_without_country_code !== duplicateOf.mobile_without_country_code) {
        extraNotes.push(`Additional phone: ${record.mobile_without_country_code}`);
      }
      
      if (extraNotes.length > 0) {
        duplicateOf.crm_note = duplicateOf.crm_note 
          ? `${duplicateOf.crm_note} | ${extraNotes.join(' | ')}` 
          : extraNotes.join(' | ');
      }
    } else {
      finalRecords.push(record);
      if (record.email) emailMap.set(record.email, record);
      if (record.mobile_without_country_code) phoneMap.set(record.mobile_without_country_code, record);
    }
  }

  return finalRecords;
}
