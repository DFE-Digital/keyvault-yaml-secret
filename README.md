# keyvault-yaml-secret

At the DfE we store our [secrets in Azure Key Vault]( https://technical-guidance.education.gov.uk/infrastructure/security/managing-secrets/). To make consumption easier, common application secrets are stored as YAML strings within a Key Vault secret object.

This action provides an interface that allows us to target a specific Key Vault secret and extract individual entries from the YAML string. The extracted entries are then set as outputs that can be consumed in other steps.

## Inputs

| name | required | description | example |
|------|----------|-------------|---------|
| keyvault | true | The name of the Key Vault | `keyvault1` |
| secret | true | The name of the Key Vault Secret | `secret_name` |
| key | true | A comma separated list of keys to extract from the YAML file | `secret1, secret2, secret3` OR `secret1`|

## Outputs

The number of outputs correlate with the number of keys passed in the inputs. However the format of each output will always follow the same pattern.

``` yaml
${{ steps.<step id>.outputs.<key> }}
```

So assuming that the step id is `keyvault-yaml-secret` and a key called `secret1` has been passed as an input, the step output would look like this:

``` yaml
${{ steps.keyvault-yaml-secret.outputs.secret1 }}
```

## Usage

``` yaml
name: build

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:

      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}    

      - uses: DfE-Digital/keyvault-yaml-secret@v1
        with:
          keyvault: ${{ env.KEY_VAULT_NAME }}
          secret: ${{ env.KEY_VAULT_INFRA_SECRET_NAME }}
          key: CF_USER
        env:
          GITHUB_TOKEN: ${{ github.token }}
```

## Contributing

This action has been developed with node `v16`.

``` bash
# Install the dependencies
npm install

# Run tslint
npm lint

## Run tests
npm test
```

## Releasing

To create a realease you can run the following commands ensuring that you are on main:

``` bash
npm version "v1.0.0"
git push --follow-tags
```

Once the release has been created you will need to publish it by following the instructions [provided by GitHub](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace).

Ensure that the security email has been set correctly and the primary catagory is set to `Continuous integration`.
