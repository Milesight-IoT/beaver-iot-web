import { client, attachAPI, API_PREFIX } from './client';

/** Credential Encryption Type */
export type CredentialEncryption = 'TLS' | 'STARTTLS' | 'NONE';

/** Credential additionalData Type */
export type CredentialsAdditionalData = {
    host: string;
    port: string;
    username: string;
    password: string;
    encryption: CredentialEncryption;
};

/** Credential Type */
export type CredentialType = {
    id: string;
    tenantId: string;
    credentialsType: string;
    description: string;
    accessKey: string;
    accessSecret: string;
    additionalData?: CredentialsAdditionalData;
    editable: boolean;
    createdAt: number;
    updatedAt: number;
};

export interface CredentialAPISchema extends APISchema {
    /** Get default credential */
    getDefaultCredential: {
        request: {
            credentialsType: 'SMTP' | 'MQTT' | 'HTTP';
        };
        response: CredentialType;
    };

    /** update smtp credential */
    editCredential: {
        request: {
            id: string;
            description: string;
            access_key: string;
            access_secret: string;
            additional_data?: Record<string, any>;
        };
        response: unknown;
    };
}

/**
 * credentials related API services
 */
export default attachAPI<CredentialAPISchema>(client, {
    apis: {
        getDefaultCredential: `GET ${API_PREFIX}/credentials/default/:credentialsType`,
        editCredential: `PUT ${API_PREFIX}/credentials/:id`,
    },
});
