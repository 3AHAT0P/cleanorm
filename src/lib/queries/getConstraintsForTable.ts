import type pg from 'pg';

import { ConstraintMetadata } from '../../@types';

export interface ConstraintQueryResult {
  constraintType: string;
  constraintName: string;
  columnName: string;
  referenceToTableName: string | null;
  referenceToColumnName: string | null;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT' | null;
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT' | null;
}

export const getConstraintsForTable = async (connection: pg.Pool, tableName: string): Promise<ConstraintMetadata[]> => {
  const queryStatements = [
    `select
      kcu.constraint_name as "constraintName",
      kcu.column_name as "columnName",
      tc.constraint_type as "constraintType",
      rc.update_rule as "onUpdate",
      rc.delete_rule as "onDelete",
      kcu2.table_name as "referenceToTableName",
      kcu2.column_name as "referenceToColumnName"`,
    'from information_schema.key_column_usage kcu',
    'left join information_schema.table_constraints tc on tc.constraint_name = kcu.constraint_name',
    'left join information_schema.referential_constraints rc on rc.constraint_name = kcu.constraint_name ',
    'left join information_schema.key_column_usage kcu2 on kcu2.constraint_name = rc.unique_constraint_name ',
    'WHERE kcu.table_schema = $1 and kcu.table_name = $2',
  ];

  const values = ['public', tableName];

  const queryResult: pg.QueryResult<ConstraintQueryResult> = await connection.query({
    text: queryStatements.join('\n'),
    values,
  });

  const result: ConstraintMetadata[] = [];

  for (const row of queryResult.rows) {
    switch (row.constraintType) {
      case 'FOREIGN KEY':
        result.push({
          type: 'FOREIGN KEY',
          name: row.constraintName,
          columnName: row.columnName,
          referenceToTableName: row.referenceToTableName!,
          referenceToColumnName: row.referenceToColumnName!,
          onDelete: row.onDelete!,
          onUpdate: row.onUpdate!,
        });
        break;
      case 'PRIMARY KEY':
        result.push({
          type: 'PRIMARY KEY',
          name: row.constraintName,
          columnName: row.columnName,
        });
        break;
      case 'UNIQUE':
        result.push({
          type: 'UNIQUE',
          name: row.constraintName,
          columnName: row.columnName,
        });
        break;
      default:
        break;
      }
    }

  return result;
};
