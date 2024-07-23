# Streamify

`streamify` utilises Node Streams and Transformers to build versatile microservice application infrastructures designed for efficient data transfer and processing utilising pipe-n-filters approach. 

# Installation

`npm i -g node-streamify`, then call `streamify` from command line

If you have NATS up and running try `streamify FILENAME nats:4222/file-transfer` to make a file available for download.

You can then download it (on another machine or tty) using `streamify nats:4222/file-transfer copy.txt`.

# Usage

`streamify [[-w worker]] <source> [target]`

- `-w --worker` a (chain of) workload(s) implementing `{ Transform } from 'stream'` interface. Optional, multiple choice, order matters.
  Built-in workers include:
  - `-w from:PACKAGE:EXPORTED` or `-w from:FILENAME`: custom workers syntax, see [command](./usecases/csv/run.sh) and [docker](./usecases/csv/docker.compose.yml) usage examples
  - `-w row2obj`: (object mode) converts incoming arrays to objects with properties described in first entry (header)
  - `-w aggregate`: aggregates input up until an (optional) threshhold. A call without parameters will aggregate input until source runs out then pass it to next worker. Invoking `-w aggregate:4` will split input into a stream of arrays of length 4.
  - `-w extract:PROPERTY`: (object mode) passes specified property to next worker
  - `-w toJSON`: useful for switching from object mode
  - `-w gzip`: maps to `require('node:zlib').createGzip()`
  - `-w slow [(N,n-N)]`: slows down execution by specified N of ms using `setTimeout`
- `<source> [target]` - If only one option is given it is considered to be the source.
  The syntax is `PROTOCOL:OPTIONS`. If the protocol is empty, while the value itself is not, protocol defaults to `file`, empty value defaults to `std` (stdin for source, stdout for target).
  Built-in protocols are:
  - `std` and `file`
  - `nats`: [open source data layer](https://docs.nats.io/) for microservices architectures
    - `streamify FILENAME nats:4222/file-transfer` et vice versa

## Examples
- a [song-generation](./usecases//csv/README.md) prompt microservice
- homemade `cp`: 
  - `streamify SOURCEFILE COPY`
- homemade `cat`: 
  - `streamify FILE`
- `sed` with A LOT of extra hoops (add `-w`'s as you please): 
  - `FILE | streamify std RESULTFILE`
