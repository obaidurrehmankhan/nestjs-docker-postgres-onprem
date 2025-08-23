declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string;
        NODE_ENV?: 'development' | 'test' | 'production';
        DATABASE_SSL?: 'true' | 'false' | '1' | '0';
    }
}