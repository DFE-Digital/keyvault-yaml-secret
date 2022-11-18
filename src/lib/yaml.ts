import YAML from 'yaml'

export class KeyNotFoundError extends Error {
    constructor(message: string) {
        super(message)
        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

type KeyValuePair = {
    key: string,
    value: string
}

export class YamlHelper {

    private yaml: string

    constructor(yaml: string) {
        this.yaml = yaml
    }

    private getValue(yaml: any, key: string): string {
        const result: string = yaml[key]
        if (result === undefined) {
            throw new KeyNotFoundError(`Please check if key ${key} exists in the yaml file.`)
        }

        return result
    }

    reduce(keys: string[]): KeyValuePair[] {
        const yaml = YAML.parse(this.yaml)
        const results: KeyValuePair[] = keys.map<KeyValuePair>((key: string): KeyValuePair => {
            key = key.trim()
            return { key, value: this.getValue(yaml, key) }
        })
        return results
    }
}
