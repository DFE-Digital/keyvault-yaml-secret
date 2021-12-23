/* eslint-disable filenames/match-regex */

import * as os from 'os'
import { expect, it } from '@jest/globals'

let originalEnv: NodeJS.ProcessEnv
originalEnv = process.env
process.env = {
    ...originalEnv,
    INPUT_KEYVAULT: "test-vault",
    INPUT_SECRET: "test-secret",
    INPUT_KEY: "test-secret"
}

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

import { run } from '../src/main'

describe('When the action runs', () => {

    beforeAll(() => {
        process.stdout.write = jest.fn()
    })

    afterAll(() => {
        process.env = originalEnv
    })

    it('masks the correct secret value', async () => {
        await run()
        assertInOutput(`::add-mask::numeral${os.EOL}`, 4)
    })

    it('returns the expected set-output function', async () => {
        await run()
        assertInOutput(`::set-output name=test-secret::numeral${os.EOL}`, 6)
    })

})


function assertInOutput(text: string, position: number): void {
    expect(process.stdout.write).toHaveBeenNthCalledWith(position, text)
}
