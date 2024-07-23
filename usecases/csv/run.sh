#!/usr/bin/env bash

NODE_PATH=$(npm root --quiet -g):$(pwd) streamify ./data/chord-progressions.csv ./data/my-result.json -w from:csv-parse:parse row2obj aggregate from:generate-a-song toJSON