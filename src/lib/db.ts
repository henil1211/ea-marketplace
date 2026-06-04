import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Supported collections list
const COLLECTIONS = [
  'eas',
  'orders',
  'users',
  'customRequests',
  'settings',
  'reviews',
  'wishlists',
  'notifications',
  'subscribers',
  'downloadLogs',
  'activityLogs',
  'leads',
  'visitorAnalytics',
  'whatsappClicks'
];

// SQL table definitions mapped to actual columns and types
const TABLE_SCHEMAS: { [key: string]: { [key: string]: string } } = {
  eas: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    name: 'VARCHAR(255)',
    slug: 'VARCHAR(255)',
    platform: 'VARCHAR(50)',
    category: 'VARCHAR(100)',
    shortDesc: 'TEXT',
    fullDesc: 'LONGTEXT',
    mql5Price: 'DOUBLE',
    ourPrice: 'DOUBLE',
    winRate: 'DOUBLE',
    maxDrawdown: 'DOUBLE',
    profitFactor: 'DOUBLE',
    minDeposit: 'VARCHAR(100)',
    rating: 'DOUBLE',
    reviewsCount: 'INT',
    viewsCount: 'INT',
    downloadsCount: 'INT',
    wishlistCount: 'INT',
    recentlyUpdated: 'TINYINT(1) DEFAULT 0',
    recentlyAdded: 'TINYINT(1) DEFAULT 0',
    propFirmCompatible: 'TINYINT(1) DEFAULT 0',
    isFeatured: 'TINYINT(1) DEFAULT 0',
    thumbnail: 'VARCHAR(255)',
    tags: 'TEXT',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  orders: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    orderId: 'VARCHAR(100)',
    userId: 'VARCHAR(100)',
    eaId: 'VARCHAR(100)',
    amount: 'DOUBLE',
    status: 'VARCHAR(50)',
    paymentMethod: 'VARCHAR(100)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  users: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    email: 'VARCHAR(255)',
    passwordHash: 'VARCHAR(255)',
    name: 'VARCHAR(255)',
    role: 'VARCHAR(50)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  customRequests: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    userId: 'VARCHAR(100)',
    title: 'VARCHAR(255)',
    description: 'TEXT',
    budget: 'DOUBLE',
    status: 'VARCHAR(50)',
    attachmentUrl: 'VARCHAR(255)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  settings: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    phone: 'VARCHAR(50)',
    activeWhatsapp: 'VARCHAR(50)',
    hidePublicPrices: 'TINYINT(1) DEFAULT 0',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  reviews: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    eaId: 'VARCHAR(100)',
    userId: 'VARCHAR(100)',
    userName: 'VARCHAR(255)',
    userCountry: 'VARCHAR(10)',
    rating: 'INT',
    comment: 'TEXT',
    approved: 'TINYINT(1) DEFAULT 0',
    verifiedPurchase: 'TINYINT(1) DEFAULT 0',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  wishlists: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    userId: 'VARCHAR(100)',
    eaId: 'VARCHAR(100)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  notifications: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    userId: 'VARCHAR(100)',
    title: 'VARCHAR(255)',
    message: 'TEXT',
    type: 'VARCHAR(100)',
    read: 'TINYINT(1) DEFAULT 0',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  subscribers: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    email: 'VARCHAR(255)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  downloadLogs: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    userId: 'VARCHAR(100)',
    eaId: 'VARCHAR(100)',
    ip: 'VARCHAR(100)',
    status: 'VARCHAR(50)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  activityLogs: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    type: 'VARCHAR(50)',
    userId: 'VARCHAR(100)',
    action: 'VARCHAR(255)',
    metadata: 'TEXT',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  leads: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    eaId: 'VARCHAR(100)',
    email: 'VARCHAR(255)',
    name: 'VARCHAR(255)',
    message: 'TEXT',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  visitorAnalytics: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    visitorId: 'VARCHAR(100)',
    deviceType: 'VARCHAR(50)',
    location: 'VARCHAR(100)',
    trafficSource: 'VARCHAR(255)',
    pageViews: 'TEXT',
    heartbeatDuration: 'INT',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  },
  whatsappClicks: {
    id: 'VARCHAR(100) NOT NULL PRIMARY KEY',
    eaId: 'VARCHAR(100)',
    visitorId: 'VARCHAR(100)',
    phone: 'VARCHAR(50)',
    createdAt: 'VARCHAR(100)',
    updatedAt: 'VARCHAR(100)'
  }
};

let pool: mysql.Pool | null = null;

export function getMySQLConfig() {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST;
  const user = process.env.MYSQL_USER || process.env.DB_USER;
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME;
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);

  if (host && user && database) {
    return { host, user, password, database, port };
  }
  return null;
}

export async function getPool(): Promise<mysql.Pool | null> {
  if (pool) return pool;
  const config = getMySQLConfig();
  if (!config) return null;

  try {
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    // Verify connection
    await pool.query('SELECT 1');
    // Ensure all tables exist
    await ensureTablesExist(pool);
    return pool;
  } catch (err) {
    console.error('MySQL connection failed, falling back to local file:', err);
    pool = null;
    return null;
  }
}

async function ensureTablesExist(p: mysql.Pool) {
  for (const col of COLLECTIONS) {
    const tableName = col.replace(/[^a-zA-Z0-9_]/g, '');
    const schema = TABLE_SCHEMAS[col];
    if (!schema) continue;

    // Check if table exists and has old 'data' column format
    try {
      const [columns]: any = await p.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE 'data'`);
      if (columns && columns.length > 0) {
        console.log(`Table ${tableName} has old JSON format. Recreating...`);
        await p.query(`DROP TABLE \`${tableName}\``);
      }
    } catch {
      // Table does not exist, ignore
    }

    const columnDefs = Object.entries(schema)
      .map(([colName, definition]) => `\`${colName}\` ${definition}`)
      .join(',\n');

    await p.query(`
      CREATE TABLE IF NOT EXISTS \`${tableName}\` (
        ${columnDefs}
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  }
}

export async function readDB(): Promise<any> {
  const p = await getPool();
  if (p) {
    try {
      const db: any = {};
      let totalRowsCount = 0;
      for (const col of COLLECTIONS) {
        const tableName = col.replace(/[^a-zA-Z0-9_]/g, '');
        const schema = TABLE_SCHEMAS[col];
        if (!schema) continue;

        const [rows]: any = await p.query(`SELECT * FROM \`${tableName}\``);
        totalRowsCount += rows.length;

        db[col] = rows.map((row: any) => {
          const item: any = {};
          for (const colName of Object.keys(schema)) {
            const rawVal = row[colName];
            if (rawVal === null || rawVal === undefined) {
              item[colName] = null;
              continue;
            }

            const type = schema[colName].toLowerCase();
            if (type.includes('tinyint(1)')) {
              item[colName] = rawVal === 1 || rawVal === '1' || rawVal === true;
            } else if (type.includes('double') || type.includes('decimal')) {
              item[colName] = parseFloat(rawVal);
            } else if (type.includes('int')) {
              item[colName] = parseInt(rawVal, 10);
            } else if (type.includes('text') || type.includes('longtext')) {
              if (typeof rawVal === 'string' && (rawVal.startsWith('[') || rawVal.startsWith('{'))) {
                try {
                  item[colName] = JSON.parse(rawVal);
                } catch {
                  item[colName] = rawVal;
                }
              } else {
                item[colName] = rawVal;
              }
            } else {
              item[colName] = rawVal;
            }
          }
          return item;
        });
      }

      // Seed MySQL from local file if MySQL is completely empty
      if (totalRowsCount === 0) {
        console.log('MySQL is empty. Seeding database from local cache...');
        const localContent = await fs.readFile(DB_PATH, 'utf-8').catch(() => '{}');
        const localDB = JSON.parse(localContent);
        if (localDB && Object.keys(localDB).length > 0) {
          await writeDB(localDB);
          return localDB;
        }
      }

      // Ensure there is at least one admin user in the system
      if (!db.users || db.users.length === 0) {
        const defaultAdmin = {
          id: 'usr-admin',
          email: 'admin@eavault.com',
          passwordHash: '$2b$10$MiQNGFN5C54ReS63di1y4OWLsDJkQkLkn9gu7M2NZRHNp2LbmfoFW',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        db.users = [defaultAdmin];
        await writeDB(db);
      }

      return db;
    } catch (err) {
      console.error('Error reading from MySQL, trying local fallback:', err);
    }
  }

  // Fallback to local db.json
  try {
    const content = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading local DB:', error);
    return {};
  }
}

export function readDBSync(): any {
  // Synchronous fallback (reads local cache)
  try {
    if (fsSync.existsSync(DB_PATH)) {
      const content = fsSync.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading DB sync:', error);
  }
  return {};
}

export async function writeDB(data: any): Promise<void> {
  // Always update local cache file so sync functions read it instantly
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local cache DB:', err);
  }

  const p = await getPool();
  if (p) {
    try {
      for (const col of COLLECTIONS) {
        const tableName = col.replace(/[^a-zA-Z0-9_]/g, '');
        const schema = TABLE_SCHEMAS[col];
        if (!schema) continue;

        const items = data[col] || [];

        // Fetch existing IDs in database to find what to delete
        const [existingRows]: any = await p.query(`SELECT id FROM \`${tableName}\``);
        const existingIds = new Set(existingRows.map((r: any) => r.id));
        const newIds = new Set(items.map((i: any) => i.id));

        // Delete removed items
        for (const id of existingIds) {
          if (!newIds.has(id)) {
            await p.query(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
          }
        }

        // Upsert items into individual columns
        const cols = Object.keys(schema);
        const placeholders = cols.map(() => '?').join(', ');
        const updateClause = cols.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');

        const sql = `
          INSERT INTO \`${tableName}\` (${cols.map(c => `\`${c}\``).join(', ')})
          VALUES (${placeholders})
          ON DUPLICATE KEY UPDATE ${updateClause}
        `;

        for (const item of items) {
          if (!item.id) continue;

          const values = cols.map((colName) => {
            let val = item[colName];
            if (val === undefined || val === null) {
              return null;
            }

            const type = schema[colName].toLowerCase();
            if (type.includes('tinyint(1)')) {
              return val ? 1 : 0;
            }
            if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
              return JSON.stringify(val);
            }
            return val;
          });

          await p.query(sql, values);
        }
      }
    } catch (err) {
      console.error('Error writing to MySQL:', err);
    }
  }
}
