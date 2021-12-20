# Change log

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

### Příklad

```
{
    roundDuration: false,
    filter: [
    {
      filename: "elx",
      restAs: "RestAs-101",
      includedProjects: ["Test"],
      transformations: [
        {
          sourceProjectName: "ToBeTransformed",
          destinationProject: "Transformed-101",
        }
      ],
    }
  ],
}
```

#

## 1. spuštění

Detail-> Stáhnout Csv -> Stáhnout report

#

## Build

npx tsc

- Smazat Object.defineProperty(exports, "\_\_esModule", { value: true }); jinak se to chromu nebude líbit
