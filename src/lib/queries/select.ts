import type pg from 'pg';

import type { TableMeta } from '../../@types';
import { isNullOrUndefined } from '../../utils';

interface ModelMeta<TModelConstructor extends new () => any> {
  fieldsToColumnsMap: Record<string, string>;
  class: TModelConstructor,
}

interface WhereExpression {
  name: string;
  op: string;
  value: unknown;
}

const Op = <const>{
  or: 'OR',
  and: 'AND',
  in: 'IN',
  lt: '<',
  gt: '>',
  lte: '<=',
  gte: '>=',
  ne: '!=',
  eq: '=',
};

interface WhereRecord {
  [name: string]: {
    [Op.in]?: unknown[];
    [Op.eq]?: unknown[];
  } | unknown;
  [Op.or]?:
}

export const select = async <TData extends object>(
  connection: pg.Pool,
  tableMeta: TableMeta,
  modelMeta: ModelMeta<new () => TData>,
  fieldList: '*' | string[],
  whereClause: WhereExpression[],
): Promise<TData[]> => {

  const columns = [];

  if (fieldList === '*') {
    for (const [columnName] of Object.values(modelMeta.fieldsToColumnsMap)) {
      columns.push(columnName);
    }
  } else {
    for (const fieldName of fieldList) {
      const columnName = modelMeta.fieldsToColumnsMap[fieldName];
      if (!isNullOrUndefined(columnName)) columns.push(columnName);
    }
  }

  const values: unknown[] = [];
  let whereString = '';

  for (const { name, op, value } of whereClause) {

  }

  const queryStatements = [
    `SELECT ${columns.join(', ')}`,
    `FROM ${tableMeta.name}`,
  ];

  const queryResult: pg.QueryResult<Record<string, any>> = await connection.query({
    text: queryStatements.join('\n'),
    values,
  });

  const result: TData[] = [];

  for (const row of queryResult.rows) {
    const data = new modelMeta.class();

    result.push(data);
  }

  return queryResult.rows;
};
