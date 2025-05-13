import * as fs from 'fs';
import * as path from 'path';

/**
* Package information
 */
export interface PackageInfo {
  name: string;
  version: string;
  directory: string;
  environment: string;
}

/**
* Gets package information from the closest package.json
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

// Return default values ​​if package.json is not found
  return {
    name: 'unknown',
    version: '0.0.0',
    directory: filePath,
    environment: process.env.NODE_ENV || 'development'
  };
}