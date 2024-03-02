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
  [Op.or]?: unknown;
}

const buildSelectLine = (tableAlias: string, columns: string[]) => {
  let selectLine = `SELECT ${tableAlias}."${columns[0]}"`;
  for (let index = 1; index < columns.length; index++) {
    selectLine += `, ${tableAlias}."${columns[index]}"`;
  }

  return selectLine;
};

export const select = async <TData extends object, const TKey extends keyof TData = keyof TData>(
  connection: pg.Pool,
  tableMeta: TableMeta,
  fieldList: null | Array<TKey>,
  fieldsToColumnsMap: Map<TKey, string>,
  whereClause: WhereExpression[],
): Promise<Array<Pick<TData, TKey>>> => {
  const schemaName = 'public';
  const tableAlias = 'x';

  const columns: string[] = [];

  const usedColumnsToFieldsMap: Map<string, TKey> = new Map();

  if (fieldList === null) {
    for (const [fieldName, columnName] of fieldsToColumnsMap.entries()) {
      columns.push(columnName);
      usedColumnsToFieldsMap.set(columnName, fieldName);
    }
  } else {
    for (const fieldName of fieldList) {
      const columnName = fieldsToColumnsMap.get(fieldName);
      if (!isNullOrUndefined(columnName)) {
        columns.push(columnName);
        usedColumnsToFieldsMap.set(columnName, fieldName);
      }
    }
  }

  const values: unknown[] = [];
  // let whereString = '';

  // for (const { name, op, value } of whereClause) {

  // }

  const queryStatements = [
    buildSelectLine(tableAlias, columns),
    `FROM ${schemaName}."${tableMeta.name}" as ${tableAlias}`,
  ];

  const queryOptions = {
    text: queryStatements.join('\n') + ';',
    values,
  };

  console.log(queryOptions.text,  queryOptions.values);

  const queryResult: pg.QueryResult<Record<string, any>> = await connection.query(queryOptions);

  const result: Array<Pick<TData, TKey>> = [];

  for (const row of queryResult.rows) {
    const data: Partial<Pick<TData, TKey>> = {};
    for (const [columnName, fieldName] of usedColumnsToFieldsMap.entries()) {
      data[fieldName] = row[columnName];
    }
    result.push(<Pick<TData, TKey>>data);
  }

  return result;
};
