import { RawField } from '@/types';
import encHex from 'crypto-js/enc-hex';
import SHA256 from 'crypto-js/sha256';

const LAYOUT_FIELD_TYPES = new Set([
  'Section Break',
  'Column Break',
  'HTML',
]);

function normalizeFieldname(
  name: string,
  allNames: string[]
): string {
  const base = name.replace(/\d+$/, '');
  if (base !== name && allNames.filter(n => n === base).length === 1) {
    return base;
  }
  return name;
}

function normalizeOptions(
  fieldtype: string,
  options: unknown
): string {
  if (!options) return '';

  const str = String(options).trim();

  if (fieldtype === 'Select') {
    return str
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .join('\n');
  }

  return str;
}

function generateSchemaHash(
  fields: RawField[]
):string {

  const allNames = fields.map(f => f.fieldname || '');

  const simplified = fields
    .filter(f => !LAYOUT_FIELD_TYPES.has(f.fieldtype))
    .map(f => ({
      fieldname: normalizeFieldname(f.fieldname, allNames),
      fieldtype: f.fieldtype,
      options: normalizeOptions(f.fieldtype, f.options),
    }));

  simplified.sort((a, b) =>
    a.fieldname.localeCompare(b.fieldname) ||
    a.fieldtype.localeCompare(b.fieldtype) ||
    a.options.localeCompare(b.options)
  );

  const concatStr = simplified
    .map(f => `${f.fieldname}:${f.fieldtype}:${f.options}`)
    .join('|');

  const hash = SHA256(concatStr).toString(encHex);

  return hash;
}

export default generateSchemaHash;
