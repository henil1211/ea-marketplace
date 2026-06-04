import { NextRequest, NextResponse } from 'next/server';
import { getMySQLConfig, getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const envKeys = Object.keys(process.env);
  const mysqlConfig = getMySQLConfig();

  const diagnosticInfo: any = {
    timestamp: new Date().toISOString(),
    envKeysPresent: {
      MYSQL_HOST: !!process.env.MYSQL_HOST,
      DB_HOST: !!process.env.DB_HOST,
      MYSQL_USER: !!process.env.MYSQL_USER,
      DB_USER: !!process.env.DB_USER,
      MYSQL_PASSWORD: !!process.env.MYSQL_PASSWORD,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      MYSQL_DATABASE: !!process.env.MYSQL_DATABASE,
      DB_NAME: !!process.env.DB_NAME,
      MYSQL_PORT: !!process.env.MYSQL_PORT,
      DB_PORT: !!process.env.DB_PORT,
      MYSQL_SSL: !!process.env.MYSQL_SSL,
      NODE_ENV: process.env.NODE_ENV
    },
    mysqlConfig: mysqlConfig ? {
      host: mysqlConfig.host,
      user: mysqlConfig.user,
      database: mysqlConfig.database,
      port: mysqlConfig.port,
      hasPassword: !!mysqlConfig.password
    } : null,
    dbConnectionStatus: 'unknown',
    connectionError: null
  };

  try {
    const pool = await getPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT 1 as test');
      diagnosticInfo.dbConnectionStatus = 'success';
      diagnosticInfo.testQueryResult = rows;
    } else {
      diagnosticInfo.dbConnectionStatus = 'failed (getPool returned null)';
    }
  } catch (err: any) {
    diagnosticInfo.dbConnectionStatus = 'failed';
    diagnosticInfo.connectionError = {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState
    };
  }

  return NextResponse.json(diagnosticInfo);
}
