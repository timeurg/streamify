 
 `NODE_PATH=$(npm root --quiet -g):$(pwd)/../temp npm run start:dev -- -- --verbose ../temp/chord-progressions.csv ../temp/result-csv.json -w from:csv-parse:parse row2obj aggregate from:generate-a-song toJSON`

 ```
npm version patch
npm run build
npm publish
 ```

 --verbose ../data/chord-progressions.csv ../data/my-result.json -w from:csv-parse:parse row2obj aggregate from:generate-a-song toJSON