export interface EnvVariable {
  production: boolean;
  baseURL: string;
  env: EnvVariableName;
  logState: boolean;
}

export type EnvVariableName = 'dev' | 'prod';
