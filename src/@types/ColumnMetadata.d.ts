export interface ColumnMetadata {
  name: string;
  type: string;
  isNullable: boolean;
  defaultValue: string | null;
}
