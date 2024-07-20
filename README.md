# Streamify

`streamify` utilises Node Streams and Transformers to build versatile microservice application infrastructures designed for efficient data transfer and processing utilising pipe-n-filters approach. 
Initially demonstrated with NATS for inter-service communication, the project's architecture allows for scalability and integration with various transport systems like PostgreSQL, Kafka, and gRPC. 
The project emphasizes efficient handling of large data volumes and includes Docker support for easy deployment.

# What's next

Next milestone is integrating [csv capabilities](https://github.com/adaltas/node-csv/blob/master/packages/stream-transform/README.md) and pg [queries](https://www.npmjs.com/package/pg-query-stream) and [writes](https://github.com/brianc/node-pg-copy-streams). 

# Usage

`<run> [[-w worker]] <source> [target]`

- `<run>` is your command of choise:
  - `streamify` if you're using a global `npm i -g streamify`
  - `node dist/main` is you're building from source
  - `docker run --rm nats-reader` if you have a docker image configured
- `-w --worker` a (chain of) workload(s) implementing `{ Transform } from 'stream'` interface. Optional, multiple choice, order matters.
  Built-in workers include:
  - `-w gzip` maps to `require('node:zlib').createGzip()`
  - `-w slow [(N,n-N)]` slows down throughput by specified ms using `setTimeout`
- `<source> [target]` - If only one option is given it is considered to be the source.
  The syntax is `PROTOCOL:OPTIONS`. If the protocol is empty, while the value itself is not, protocol defaults to `file`, empty value defaults to `std` (stdin for source, stdout for target).
  Built-in protocols are:
  - `std` and `file`
  - `nats`: [open source data layer](https://docs.nats.io/) for microservices architectures
    - `docker compose -f "./usecases/nats/docker.compose.yml" up -d --build` to see [example](./usecases/nats/docker.compose.yml)

## Examples
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
- `docker compose -f "docker.compose.yml" up -d --build`
- NATS testing:
  - up Writer & NATS `docker compose -f "docker.compose.yml" up writer nats`
  - finetune HighWaterMark 
    -`docker run --rm -e NATS_OUT_HWM=800 -v ${PWD}/temp:/home/node/temp --net=host nats-reader ../temp/sample.txt nats:4222/file-transfer`
- `md5sum temp/sample.txt temp/copy-over-nats.txt`
