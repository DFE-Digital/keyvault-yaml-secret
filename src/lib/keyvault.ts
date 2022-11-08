import { AzureCliCredential } from '@azure/identity'
import { SecretClient } from '@azure/keyvault-secrets'
import { RestError } from '@azure/core-http'


export class EmptySecretError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}


export class SecretNotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}


export class KeyVaultClient {

    private client: SecretClient

    constructor(keyVaultName: string) {
        const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`
        const credential = new AzureCliCredential()
        this.client = new SecretClient(keyVaultUrl, credential)
    }

    async getSecretValue(secretName: string): Promise<string> {
        try {
            const keyVaultSecret = await this.client.getSecret(secretName)

            if (keyVaultSecret.value === undefined) {
                throw new EmptySecretError(`The value for ${secretName} is undefined.`)
            }

            return keyVaultSecret.value
        } catch (error) {
            // Handle SecretNotFound gracefully by returning undefined
            if (error instanceof RestError && error.code === 'SecretNotFound') {
                throw new SecretNotFoundError(
                    `A secret with the name ${secretName} does not exist in the Key Vault specified. Please check the name and try again.`
                )
            }

            throw error
        }
    }
}
