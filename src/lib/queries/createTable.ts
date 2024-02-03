import type pg from 'pg';

import type { TableMeta } from '../../@types';

export const createTable = async (connection: pg.Pool, tableMeta: TableMeta): Promise<void> => {
  const queryStatements = [
    `CREATE TABLE public."${tableMeta.name}" (`,
  ];

  for (const [columnName, columnMeta] of Object.entries(tableMeta.columns)) {
    let line = `  "${columnName}" ${columnMeta.type}`;
    if (!columnMeta.isNullable) line += ' NOT NULL';
    if (columnMeta.defaultValue !== null) line += ` DEFAULT ${columnMeta.defaultValue}`;
    line += ',';
    queryStatements.push(line);
  }

  for (const [constraintName, constraintMeta] of Object.entries(tableMeta.constraints)) {
    let line = `  CONSTRAINT "${constraintName}" ${constraintMeta.type} (${constraintMeta.columnName})`;
    if (constraintMeta.type === 'FOREIGN KEY') {
      line += ` REFERENCES "${constraintMeta.referenceToTableName}" (${constraintMeta.referenceToColumnName})`;
      if (constraintMeta.onDelete !== null) line += ` ON DELETE ${constraintMeta.onDelete}`;
      if (constraintMeta.onUpdate !== null) line += ` ON UPDATE ${constraintMeta.onUpdate}`;
    }
    line += ',';
    queryStatements.push(line);
  }

  const lastLine = queryStatements.pop()!;
  queryStatements.push(lastLine.slice(0, -1));
  queryStatements.push(');');

  await connection.query({
    text: queryStatements.join('\n'),
  });
};
