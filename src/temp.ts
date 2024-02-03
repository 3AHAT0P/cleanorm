import { TableMeta } from './@types';

const tableName = '_cleanorm_internal';
const _cleanormInternalTableMatadata: TableMeta = {
  name: tableName,
  columns: {
    id: {
      name: 'id',
      type: 'uuid',
      isNullable: false,
      defaultValue: 'gen_random_uuid()',
    },
    slug: {
      name:'slug',
      type: 'varchar(50)',
      isNullable: false,
      defaultValue: null,
    },
    data: {
      name: 'data',
      type: 'jsonb',
      isNullable: false,
      defaultValue: null,
    },
    createdAt: {
      name: 'createdAt',
      type: 'timestamptz',
      isNullable: false,
      defaultValue: 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updatedAt',
      type: 'timestamptz',
      isNullable: false,
      defaultValue: 'CURRENT_TIMESTAMP',
    },
  },
  constraints: {
    [`${tableName}_primary_key`]: {
      type: 'PRIMARY KEY',
      name: `${tableName}_primary_key`,
      columnName: 'id',
    }
  },
};
