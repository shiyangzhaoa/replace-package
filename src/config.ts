import fs from 'fs';
import findUp from 'find-up';

import { readJson } from './utils/file';

export const defaultConfig: Config = {
  'replace-package': {
    name: '',
    source: '',
    importDefault: false,
    legacyName: '',
    legacySource: '',
    legacyImportDefault: false,
  }
};

let config: Config | null = null;

export const getConfig = (key: keyof Config) => {
  if (config) return config[key];

  const configFile = findUp.sync('codemod.json');

  if (configFile) {
    try {
      fs.accessSync(configFile);
      config = readJson(configFile);
    } catch {
      //
    }
  }

  return (config as Config)[key];
};

export interface Config {
  'replace-package': {
    legacyName: string;
    legacySource: string;
    legacyImportDefault?: boolean;
    name: string;
    source: string;
    importDefault?: boolean;
  }
}
