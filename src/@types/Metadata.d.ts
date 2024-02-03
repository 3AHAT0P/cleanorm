import { TableMeta } from './TableMeta';

export interface Metadata {
  databaseName: string;
  schemaName: string;
  tables: {
    [name: string]: TableMeta;
  }
}
