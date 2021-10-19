export interface SqsConfig{
    region?: string,
    queueUrl?: string,
    queueName?: string
}

export interface DevSqsConfig{
    development: SqsConfig
    test: SqsConfig
    production: SqsConfig
}