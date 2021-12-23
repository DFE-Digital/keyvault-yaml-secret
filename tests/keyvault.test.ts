/* eslint-disable filenames/match-regex */
import {
  EmptySecretError,
  KeyVaultClient,
  SecretNotFoundError
} from '../src/lib/keyvault'
import {expect, it} from '@jest/globals'
import {RestError} from '@azure/core-http'

const mockedClient = {
  getSecret: jest.fn()
}

const keyVaultName = 'test-keyvault'
const secretName = 'test-secret'

let client: KeyVaultClient

jest.mock('@azure/keyvault-secrets', () => {
  const mockedSecretClient = jest.fn(() => mockedClient)
  return {SecretClient: mockedSecretClient}
})

describe('When getSecret is called', () => {
  beforeAll(() => {
    client = new KeyVaultClient(keyVaultName)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  it('throws SecretNotFoundError when the secret is not found', async () => {
    mockedClient.getSecret.mockRejectedValue(
      new RestError('mockGetSecretNotFound', 'SecretNotFound')
    )
    await expect(client.getSecretValue(secretName)).rejects.toThrow(
      SecretNotFoundError
    )
    expect(mockedClient.getSecret).toHaveBeenCalledTimes(1)
  })

  it('throws EmptySecretError when secret.value is undefined', async () => {
    mockedClient.getSecret.mockResolvedValue({
      value: undefined,
      name: 'test-secret',
      properties: {
        vaultUrl: 'https://test-keyvault.vault.azure.net',
        name: 'test-keyvault'
      }
    })

    await expect(client.getSecretValue(secretName)).rejects.toThrow(
      EmptySecretError
    )
    expect(mockedClient.getSecret).toHaveBeenCalledTimes(1)
  })

  it('returns the expected response when the secret value exists', async () => {
    mockedClient.getSecret.mockResolvedValue({
      value: 'numeral',
      name: secretName,
      properties: {
        vaultUrl: 'https://test-keyvault.vault.azure.net',
        name: 'test-keyvault'
      }
    })

    await expect(client.getSecretValue(secretName)).resolves.toBe('numeral')
    expect(mockedClient.getSecret).toHaveBeenCalledTimes(1)
  })
})
