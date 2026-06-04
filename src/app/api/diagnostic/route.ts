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
    if (mysqlConfig) {
      const mysql = require('mysql2/promise');
      const connection = await mysql.createConnection({
        host: mysqlConfig.host,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database,
        port: mysqlConfig.port,
        ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 5000 // 5 seconds timeout
      });
      const [rows]: any = await connection.query('SELECT 1 as test');
      diagnosticInfo.dbConnectionStatus = 'success';
      diagnosticInfo.testQueryResult = rows;
      await connection.end();
    } else {
      diagnosticInfo.dbConnectionStatus = 'failed (no mysqlConfig)';
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

  let telegraTestResult: any = null;
  try {
    const testBlob = new Blob(['diagnostic-test-file-content'], { type: 'image/png' });
    const testFormData = new FormData();
    testFormData.append('file', testBlob, 'test.png');

    const telegraRes = await fetch('https://telegra.ph/upload', {
      method: 'POST',
      body: testFormData
    });

    if (telegraRes.ok) {
      const json = await telegraRes.json();
      telegraTestResult = {
        status: 'success',
        response: json,
        url: Array.isArray(json) && json[0]?.src ? `https://telegra.ph${json[0].src}` : null
      };
    } else {
      telegraTestResult = {
        status: 'failed',
        statusCode: telegraRes.status,
        text: await telegraRes.text()
      };
    }
  } catch (err: any) {
    telegraTestResult = {
      status: 'error',
      message: err.message
    };
  }

  return NextResponse.json({
    ...diagnosticInfo,
    telegraTestResult
  });
}
