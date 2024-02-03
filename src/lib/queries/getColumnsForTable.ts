import type pg from 'pg';

import type { ColumnMetadata } from '../../@types';

interface ColumnQueryResult {
  name: string;
  defaultValue: string | null;
  isNullable: 'NO' | 'YES';
  type: string;
  typeLength: number | null;
}

export const getColumnsForTable = async (connection: pg.Pool, tableName: string): Promise<ColumnMetadata[]> => {
  const queryStatements = [
    'SELECT column_name as name, column_default as "defaultValue", is_nullable as "isNullable", udt_name as type, character_maximum_length as "typeLength"',
    'FROM information_schema."columns"',
    'WHERE table_schema = $1 and table_name = $2',
    'ORDER BY column_name',
  ];

  const values = ['public', tableName];

  const queryResult: pg.QueryResult<ColumnQueryResult> = await connection.query({
    text: queryStatements.join('\n'),
    values,
  });

  return queryResult.rows.map((row) => ({
    name: row.name,
    type: row.typeLength !== null ? `${row.type}(${row.typeLength})` : row.type,
    isNullable: row.isNullable === 'YES' ? true : false,
    defaultValue: row.defaultValue,
  }));
};
