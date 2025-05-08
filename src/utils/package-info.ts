import * as fs from 'fs';
import * as path from 'path';

/**
 * Информация о пакете
 */
export interface PackageInfo {
  name: string;
  version: string;
  directory: string;
  environment: string;
}

/**
 * Получает информацию о пакете из ближайшего package.json
 */
export function getPackageInfo(filePath: string): PackageInfo {
  let currentDir = path.dirname(filePath);
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return {
          name: packageJson.name || 'unknown',
          version: packageJson.version || '0.0.0',
          directory: currentDir,
          environment: process.env.NODE_ENV || 'development'
        };
      } catch (error) {
        break;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  // Возвращаем значения по умолчанию, если package.json не найден
  return {
    name: 'unknown',
    version: '0.0.0',
    directory: filePath,
    environment: process.env.NODE_ENV || 'development'
  };
}