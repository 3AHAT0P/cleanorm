export interface UniqueConstraintMetadata {
  type: 'UNIQUE';
  name: string;
  columnName: string;
}

export interface PrimaryKeyConstraintMetadata {
  type: 'PRIMARY KEY';
  name: string;
  columnName: string;
}

export interface ForeignKeyConstraintMetadata {
  type: 'FOREIGN KEY';
  name: string;
  columnName: string;
  referenceToTableName: string;
  referenceToColumnName: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
}

export type ConstraintMetadata = UniqueConstraintMetadata | PrimaryKeyConstraintMetadata | ForeignKeyConstraintMetadata;
