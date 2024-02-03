import { ColumnMetadata } from './ColumnMetadata';
import { ConstraintMetadata } from './ConstraintMetadata';

export interface TableMeta {
  name: string;
  columns: {
    [name: string]: ColumnMetadata;
  };
  constraints: {
    [name: string]: ConstraintMetadata;
  };
}
