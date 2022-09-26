/* eslint-disable filenames/match-regex */
import {KeyNotFoundError, YamlHelper} from '../src/lib/yaml'
import {expect, it} from '@jest/globals'
import {readFileSync} from 'fs'
import {YAMLParseError} from 'yaml'

const input = 'random-key'

describe('When reduce is called with a single key and a valid yaml file', () => {
  let yaml: YamlHelper

  beforeAll(() => {
    const string = readFileSync('./tests/data/working_yaml.yml', 'utf8')
    yaml = new YamlHelper(string)
  })

  it('throws KeyNotFoundError when the yaml is valid and the key does not exist', () => {
    expect(() => {
      yaml.reduce([input])
    }).toThrow(KeyNotFoundError)
  })

  it('returns the expected result when the yaml is valid and the key exists', () => {
    const result = yaml.reduce(['test-secret'])
    expect(result[0]).toMatchObject({key: 'test-secret', value: 'numeral'})
    expect(result).toHaveLength(1)
  })
})

describe('When reduce is called with a single key and an invalid yaml file', () => {
  let yaml: YamlHelper

  beforeAll(() => {
    const string = readFileSync('./tests/data/broken_yaml.yml', 'utf8')
    yaml = new YamlHelper(string)
  })

  it('throws when the yaml cannot be parsed', () => {
    try {
      yaml.reduce([input])
    } catch (e) {
      if (e instanceof YAMLParseError) {
        expect(e.message).toContain('Implicit keys need to be on a single line')
      }
      expect(e).toBeInstanceOf(YAMLParseError)
    }
  })
})

describe('When reduce is called with multiple keys and a valid yaml file', () => {
  let yaml: YamlHelper

  beforeAll(() => {
    const string = readFileSync('./tests/data/working_yaml.yml', 'utf8')
    yaml = new YamlHelper(string)
  })

  it('returns the expected results when the yaml is valid and multiple keys are passed', () => {
    const result: Record<string, string>[] = yaml.reduce([
      'test-secret',
      'test-secret2'
    ])

    expect(result[0]).toMatchObject({key: 'test-secret', value: 'numeral'})
    expect(result[1]).toMatchObject({key: 'test-secret2', value: 'numeral2'})
    expect(result).toHaveLength(2)
  })

  it('throws KeyNotFoundError when the yaml is valid and the key does not exist', () => {
    expect(() => {
      yaml.reduce(['test-secret', 'invalid-key'])
    }).toThrow(KeyNotFoundError)
  })
})
