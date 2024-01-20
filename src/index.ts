import pg from 'pg';
import 'reflect-metadata/lite';

import { ConstraintInfo } from './@types';
import { getConstraintsForTable } from './lib/queries/getConstraintsForTable';
import { getTableList } from './lib/queries/getTableList';
import { isNullOrUndefined } from './utils';

const { Pool } = pg;

type AbstractConstructor = abstract new (...args: unknown[]) => unknown;
type Constructor = new (...args: unknown[]) => unknown;

interface PostgreClientConfig {
  host: string;
  port?: number;
  user: string;
  database: string;
  password: string;
}

class PostgreClient {
  private readonly _config: PostgreClientConfig;
  private readonly _connection: pg.Pool;

  private readonly _modelMap: Map<string, Constructor> = new Map();

  private _isReady: boolean = false;

  public get isReady() { return this._isReady; }

  constructor(config: PostgreClientConfig) {
    this._config = config;
    this._connection = new Pool(this._config);
  }

  public async init() {
    try {
      const data = await this._connection.query('SELECT NOW()');
      if (data.rowCount !== 1) throw new Error('Something went wrong!');
      this._isReady = true;
    } catch (e) {
      console.error(e);
    }
  }

  public async destroy() {
    this._isReady = false;
    this._connection.end();
  }

  public async registerModel(model: Constructor) {
    const options = Reflect.getMetadata('cleanorm:model', model);
    this._modelMap.set(options.tableName, model);
  }

  public async syncSchema() {
    const tables = await getTableList(this._connection);
    const promises = [];

    for (const [tableName, model] of this._modelMap) {
      let needCreateTable = false;
      const table = tables.find((table) => table.tableName === tableName);
      const fields = Reflect.getMetadata('cleanorm:model:fields', model);
      if (isNullOrUndefined(table)) {
        // create table
      } else {
        const tableConstraints = getConstraintsForTable(this._connection, tableName);
        // get diff and update table
      }
    }

    for (const { tableName } of tables) {
      const model = this._modelMap.get(tableName);
      if (!isNullOrUndefined(model)) continue;
      // Drop tables;
    }
  }
}

interface ModelDecoratorOptions {
  tableName: string;
}

const Model = (options: ModelDecoratorOptions) => {
  return (target: AbstractConstructor) => {
    console.log('111', target.name);
    Reflect.defineMetadata('cleanorm:model', options, target);
  };
};

interface ColumnDecoratorOptions {
  columnName: string;
  columnType: string;
  isPrimary?: boolean;    // false by default
  isNullable?: boolean;   // true by default
  isUnique?: boolean;     // false by default
  defaultValue?: string;  // undefined by default
}

const Column = (options: ColumnDecoratorOptions) => {
  return (target: object, key: string) => {
    const fields = Reflect.getMetadata('cleanorm:model:fields', target) ?? {};
    fields[key] = options;
    console.log('111', fields);
    Reflect.defineMetadata('cleanorm:model:fields', fields, target);
  };
};

@Model({
  tableName: 'user',
})
class User {
  @Column({
    columnName: 'id',
    columnType: 'uuid',
    isPrimary: true,
    isNullable: false,
    defaultValue: 'gen_random_uuid()',
  })
  public id!: string;

  @Column({
    columnName: 'first_name',
    columnType: 'varchar(50)',
    isNullable: false,
  })
  public firstName!: string;
}

const main = async () => {
  const throwError = (message: string): never => { throw new Error(message); };
  const stringToNumber = (value?: string): number | null => {
    const result = Number(value);
    if (Number.isNaN(result)) return null;
    return result;
  };

  // const client = new PostgreClient({
  //   host: process.env['POSTGRES_HOST'] ?? throwError('Environment variable POSTGRES_HOST is required!'),
  //   port: stringToNumber(process.env['POSTGRES_PORT']) ?? 5432,
  //   database: process.env['POSTGRES_DB'] ?? throwError('Environment variable POSTGRES_DB is required!'),
  //   user: process.env['POSTGRES_USER'] ?? throwError('Environment variable POSTGRES_USER is required!'),
  //   password: process.env['POSTGRES_PASSWORD'] ?? throwError('Environment variable POSTGRES_PASSWORD is required!'),
  // });

  // await client.init();


  // await client.destroy();
};

main();
