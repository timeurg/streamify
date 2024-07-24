# Streamify

`streamify` is a microframework for designing microservices in an input->transform->output fashion. It can be used as a global application or a Docker image and the neat thing is that entire pipelines and any of their parts can be easily reused, modified and shared.

`streamify` harnesses the power of native Node Streams and Transformers to build services with well-defined and configurable throughput. Read about [highwatermark](https://nodejs.org/api/stream.html#streamgetdefaulthighwatermarkobjectmode) and [backpressure](https://nodejs.org/en/learn/modules/backpressuring-in-streams) concepts to get maximum value from this rendition of Pipes&Filters design pattern.

Initially demonstrated with NATS for inter-service communication, the project's architecture allows for scalability and integration with various transport systems like PostgreSQL, Kafka, and gRPC.

See example of configuring a [microservice that generates a song from csv file](./usecases/csv/README.md).

# Installation

`npm i -g node-streamify` then call `streamify` from command line.

Check `streamify FILENAME COPY`, which should work just like `cp` or `copy` to see if it works.

If you have NATS up and running (listening on, say, port 4222) try `streamify FILENAME nats:4222/unique_topic` to make a file available for download.

You can then download it using `streamify nats:4222/unique_topic copy.txt`, on another machine or terminal window, wherever NATS instance is available, using a configuration file with authorization credentials if you so please.

# Usage

`<run> [[-w worker]] <source> [target]`

- `<run>` is your command of choise:
  - `streamify` if you're using a global `npm i -g node-streamify` install
  - `node dist/main` is you're building from source
  - `docker run --rm IMAGE` if you have a docker image configured
- `-w --worker` a (chain of) workload(s) implementing `{ Transform } from 'node:stream'` interface. Optional, multiple choice, order matters.
  Built-in workers include:
  - `-w from:PACKAGE:EXPORTED` or `-w from:FILENAME`: custom workers syntax, see [command](./usecases/csv/run.sh) and [docker](./usecases/csv/docker.compose.yml) usage examples
  - `-w row2obj`: (object mode) converts incoming arrays to objects with properties described in first entry (header)
  - `-w aggregate`: aggregates input up until an (optional) threshhold. A call without parameters will aggregate input until source runs out then pass it to next worker. Invoking `-w aggregate:4` will split input into a stream of arrays of length 4.
  - `-w extract:PROPERTY`: (object mode) passes specified property to next worker
  - `-w toJSON`: useful for switching from object mode
  - `-w gzip`: maps to `require('node:zlib').createGzip()`
  - `-w slow [(N,n-N)]`: slows down execution by specified N of ms using `setTimeout`
- `<source> [target]` - If only one option is given it is considered to be the source.
  The syntax is `PROTOCOL:OPTIONS`. If the no colon is present protocol defaults to `file`, empty value defaults to `std` (stdin for source, stdout for target).
  Built-in protocols are:
  - `std` and `file`: duh
  - `nats`: An [open source data layer](https://docs.nats.io/) for microservices architectures
    - `docker compose -f "./usecases/nats/docker.compose.yml" up -d --build` to see [example](./usecases/nats/docker.compose.yml)

## Examples
- a [song-generation](./usecases//csv/README.md) prompt microservice one liner: `streamify --verbose ./temp/chord-progressions.csv -w from:csv-parse:parse row2obj aggregate generate-a-song extract:prompt ../temp/last-prompt.txt`.
- [file tranfer and transform via NATS](./usecases/nats/docker.compose.yml)
  - `docker compose -f "./usecases/nats/docker.compose.yml" up -d --build`
  - playground:
    - up Writer & NATS `docker compose -f "docker.compose.yml" up writer nats`
    - finetune HighWaterMark until you hit max payload configured in NATS
      -`docker run --rm -e NATS_OUT_HWM=800 -v ${PWD}/temp:/home/node/temp --net=host nats-reader ../temp/sample.txt nats:4222/file-transfer`
      - or `NATS_OUT_HWM=800 streamify temp/sample.txt nats:4222/file-transfer -w slow:100-5000 --verbose` if you have streamify globally installed
    - check file integrity when transfer is complete: `md5sum temp/sample.txt temp/copy-over-nats.txt`
    - add `-w gzip` and check if resulting file is a valid zip
- homemade `cp`: 
  - `streamify FILE COPY`
  - `docker run --rm -v ${PWD}/temp:/home/node/temp reader ../temp/sample.txt ../temp/copy2.txt`
- homemade `cat`: 
  - `streamify FILE`
  - `docker run --rm -v ${PWD}/temp:/home/node/temp reader ../temp/sample.txt`
- `sed` with A LOT of extra hoops (add `-w`'s as you please): 
  - `FILE | streamify std RESULTFILE`
  - `tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 10K | docker run -i --rm -v ${PWD}/temp:/home/node/temp reader std ../temp/doc2`
## Debug
- local `cd streamify && npm run start:dev -- -- [[-w worker]] <source> [target]`
  - `npm run start:dev -- -- ../temp/sample.txt nats:4222/file-transfer` - reader
- docker `docker compose -f "docker.compose.debug.yml" up -d --build`
## Misc
- create a big file: 
  - `head -c 50M /dev/urandom > temp/sample.txt` 
  - `tr -dc 'a-zA-Z0-9\n' </dev/urandom | head -c 50M > temp/sample.txt`

# What's next

Next milestone is integrating [csv capabilities](https://github.com/adaltas/node-csv/blob/master/packages/stream-transform/README.md) and pg [queries](https://www.npmjs.com/package/pg-query-stream) and [writes](https://github.com/brianc/node-pg-copy-streams). 
