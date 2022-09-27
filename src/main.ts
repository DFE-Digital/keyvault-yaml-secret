import * as core from '@actions/core'
import { KeyVaultClient, YamlHelper } from './lib'

export async function run(): Promise<void> {
  try {
    const keyvault: string = core.getInput('keyvault', { required: true })
    const secret: string = core.getInput('secret', { required: true })
    const key: string = core.getInput('key', { required: true })

    if (process.env.DEBUG_BUILD == 'true') {
      core.info(`The action was successfully called with inputs keyvault=${keyvault}, secret=${secret}, key=${key}`);
      process.exit(0);
    }

    core.info(`Fetching secret ${secret} from keyvault ${keyvault}.`)
    const client = new KeyVaultClient(keyvault)
    const secretValue: string = await client.getSecretValue(secret)

    core.info(`Resolving value for key ${key}.`)
    const yaml = new YamlHelper(secretValue)
    const results = yaml.reduce(key.split(','))

    for (const result of results) {
      setSafeOutput(result.key, result.value)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

function setSafeOutput(key: string, value: string): void {
  core.debug(`Setting masked output for key ${key}.`)
  core.setSecret(value)
  core.setOutput(key, value)
}

run()
