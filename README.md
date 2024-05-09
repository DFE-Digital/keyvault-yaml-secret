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
        id:  keyvault-yaml-secret
        with:
          keyvault: ${{ env.KEY_VAULT_NAME }}
          secret: ${{ env.KEY_VAULT_INFRA_SECRET_NAME }}
          key: CF_USER, CF_PASSWORD
```

## Contributing

This action has been developed with node `v16`.

``` bash
# Install the dependencies
npm install

# If you see any vulnerabilities run following command
npm audit fix

# Run tslint
npm lint

## Run tests
npm test
```

## Testing
It is possible to test the action prior to publishing it to the marketplace.

- Create a dedicated test branch perhaps by branching off the development branch.
- Comment the `dist` folder out of the `.gitignore` file.
- Run `npm build`.
- Commit the built `dist/index.js` and `.gitignore` file to the test branch.
- Reference the branch in your workflow file using `- uses: DfE-Digital/keyvault-yaml-secret@myTestBranchName`.
- Once the action has been tested and you are happy with it:
  - Delete the test branch;
  - PR the development branch in to main;
  - Follow releasing process below;
  - Update the workflow version reference to the version used when executing the `npm version "v#.#.#"` command below.

## Releasing

To create a [release](https://github.com/DFE-Digital/keyvault-yaml-secret/releases) you can run the following commands ensuring that you are on main:

``` bash
npm version "v1.0.0"
git push --follow-tags
```

To publish the release as the latest version of the  action to the GitHub Marketplace, edit any release details in the releases section of the actions GitHub repo and select 'Publish this Action to the GitHub Marketplace'. Click `Update release` to save the edits and publish.

Further details about publishing actions in the marketplace are [provided by GitHub](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace).

Ensure that the security email has been set correctly and the primary catagory is set to `Continuous integration`.
