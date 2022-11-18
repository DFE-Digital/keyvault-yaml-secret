/* eslint-disable filenames/match-regex */
import * as os from 'os'
import * as fs from 'fs'
import { expect, it } from '@jest/globals'

import { readFileSync } from 'fs'
const content = readFileSync('./tests/data/working_yaml.yml', 'utf8')
const mockGetSecret = jest.fn().mockResolvedValue({ value: content })
jest.mock('@azure/keyvault-secrets', () => {
    return {
        SecretClient: jest.fn(() => {
            return {
                getSecret: mockGetSecret,
            }
        })
    }
})

// We expect to see `::error::Input required and not supplied: keyvault` in the test output as
// the run function is executed on import but we have not defined the INPUT_ values it expects
import { run } from '../src/main'

const filePath = "tests/data/GITHUB_OUTPUT"

const originalEnv = process.env;

beforeAll(() => {
    process.env = {
        INPUT_KEYVAULT: "test-vault",
        INPUT_SECRET: "test-secret",
        INPUT_KEY: "test-secret",
        GITHUB_OUTPUT: filePath
    }

    fs.writeFile(filePath, '', (err) => {
        if (err) throw err;
    });

    process.stdout.write = jest.fn()
})

afterAll(() => {
    process.env = originalEnv
    fs.rm(filePath, {}, (err) => {
        if (err) throw err;
    })
})

describe('When the action runs', () => {
    it('masks the correct secret value', async () => {
        await run()
        assertInOutput(`::add-mask::numeral${os.EOL}`, 4)
    })

    it('returns the expected content to the GITHUB_OUTPUT file', async () => {
        let fileContent = await run().then(() => {
            return fs.readFileSync(filePath, 'utf8')
        })

        assertInFileOutput(fileContent)
    })

})

function assertInOutput(text: string, position: number): void {
    expect(process.stdout.write).toHaveBeenNthCalledWith(position, text)
}

function assertInFileOutput(text: string,): void {
    expect(text).toEqual(expect.stringContaining(`test-secret<<ghadelimiter`))
    expect(text).toEqual(expect.stringContaining(`numeral`))
}
