import type pg from 'pg';

import type { ConstraintInfo } from '../../@types';

export const getConstraintsForTable = async (connection: pg.Pool, tableName: string): Promise<ConstraintInfo[]> => {
  const queryStatements = [
    'SELECT tc.constraint_name as "constraintName", tc.constraint_type as "constraintType", ccu.column_name as "columnName"',
    'FROM information_schema.table_constraints tc',
    'join constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name and ccu.table_name = tc.table_name',
    'WHERE tc.table_schema = $1 and tc.table_name = $2',
    'ORDER BY ccu.column_name',
  ];

  const values = ['public', tableName];

  const queryResult: pg.QueryResult<ConstraintInfo> = await connection.query({
    text: queryStatements.join('\n'),
    values,
  });

  return queryResult.rows;
};
