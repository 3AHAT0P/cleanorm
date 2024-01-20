import type pg from 'pg';

import type { TableInfo } from '../../@types';

export const getTableList = async (connection: pg.Pool): Promise<TableInfo[]> => {
  const queryStatements = [
    'SELECT t.table_name as "tableName"',
    'FROM information_schema.tables t',
    'WHERE tc.table_schema = $1',
    'ORDER BY t.table_name',
  ];

  const values = ['public'];

  const queryResult: pg.QueryResult<TableInfo> = await connection.query({
    text: queryStatements.join('\n'),
    values,
  });

  return queryResult.rows;
};
