export interface EnvVariable {
  production: boolean;
  baseURL: string;
  env: EnvVariableName;
}

export type EnvVariableName = 'dev' | 'prod';
