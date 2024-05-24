# Config

### Example

```json
{
  "roundDuration": true,
  "roundToMinutes": 10,
  "filter": [
    {
      "filename": "report1",
      "restAs": "RestAs-101",
      "includedProjects": ["Test"],
      "transformations": [
        {
          "sourceProjectName": "ToBeTransformed",
          "destinationProject": "Transformed-101"
        }
      ]
    }
  ],
  "apiKeyLocation": {
    "storage": "session",
    "key": "/api/v9/me",
    "propertyName": "api_token"
  }
}
```

##

### Config

| Name           | Type                 | Default | Description                                                                                                     |
| -------------- | -------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| roundDuration  | boolean              | -       | If `true` duration will be rounded                                                                              |
| roundToMinutes | number               | 5       | If roundDuration is `true` round duration to the given minute                                                   |
| includeSeconds | boolean              | -       | Include seconds in report                                                                                       |
| filter         | ConfigFilterItem[]   | -       | Filtering projects to files                                                                                     |
| apiKeyLocation | ConfigApiKeyLocation | -       | When empty api key is not included in headers, if default values of `ConfigApiKeyLocation` is required use `{}` |

### ConfigFilterItem

| Name             | Type                       | Default | Description                                                                 |
| ---------------- | -------------------------- | ------- | --------------------------------------------------------------------------- |
| filename         | string                     | -       | Report file name                                                            |
| includedProjects | string[]                   | -       | Project included in report                                                  |
| restAs           | string                     | -       | Project not included in `includedProjects` will be reported as this project |
| transformations  | ConfigTransfromationItem[] | -       | Transformation project config                                               |

### ConfigTransfromationItem

| Name               | Type   | Default | Description                     |
| ------------------ | ------ | ------- | ------------------------------- |
| sourceProjectName  | string | -       | Name of project to transform    |
| destinationProject | string | -       | Name of project to transform to |

### ConfigApiKeyLocation

| Name         | Type            | Default    | Description                                                         |
| ------------ | --------------- | ---------- | ------------------------------------------------------------------- |
| storage      | local / session | session    | Whether token is in local or session storage                        |
| key          | string          | /api/v9/me | Name of the key in the storage where object with api key is located |
| propertyName | string          | api_token  | Property name in the object where api key is located                |
