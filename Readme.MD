# Change log

### v1.3.0
- přidání do konfigu roundToMinutes umožňující zaokrouhlovat čas na daný počet minut. Hodnota musí bezezbytku dělit 60(2,5,10,15,...) pro správnou funkčnost.
- výchozí hodnota apiKeyLocation.key změněna na /api/v9/me

### v1.2.0
- použití autorizace(api key)
- přidání do konfigu možnost nastavení odkud se token bere
```
{
  apiKeyLocation:  {
  storage: "session", // session/local
  key: "klíčVeStrage",
  propertyName: "api_key"
};
}
```
- default je storage:"session", key:"/api/v9/me", propertyName:"api_token"

### v1.1.0
- Možnost tagování záznamů
- Zaokrouhlování časů až po groupování
- Transformace tasků

# Config
```
{
    roundDuration: boolean;
    filter: ConfigFilterItem[];
}
```

### ConfigFilterItem
```
{
    filename: string;
    restAs: string;
    includedProjects: string[];
    transformations: ConfigTransfromationItem[];
}
```

### ConfigTransfromationItem
```
{
    sourceProjectName: string;
    destinationProject: string;
}
```

### Příklad konfigu
```
{
  "roundDuration": true,
  "roundToMinutes": 10,
  "filter": [
    {
      "filename": "elx",
      "restAs": "RestAs-101",
      "includedProjects": [
        "Test"
      ],
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

#

## 1. spuštění

Detail-> Stáhnout Csv -> Stáhnout report // od verze 1.2.0 by nemělo být potřeba

#

## Build

npx tsc

- Smazat Object.defineProperty(exports, "\_\_esModule", { value: true }); jinak se to chromu nebude líbit
- ts errory nevadí
