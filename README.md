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
- `<source> [target]` - If only one option is given it is considered to be the source. The syntax is `PROTOCOL:OPTIONS`, if the protocol is empty while the value itself is not protocol defaults to `file`, empty value defaults to `std` (stdin for source, stdout for target)
  Built-in protocols are:
  - `std` and `file`
  - `nats`: [open source data layer](https://docs.nats.io/) for microservices architectures
    - `docker compose -f "./usecases/nats/docker.compose.yml" up -d --build` to see example

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
- local `cd read-work-write && npm run start:dev -- -- [[-w worker]] <source> [target]`
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

# Developer Notes

## ToDo

1. Избавиться от @nest/cqrs, лишнее усложнение без видимых преимуществ

2. Избавиться от InjectionToken.ProtocolAdaptor_FACTORY в пользу стандартной регистрации ProtocolAdaptor'ов в DI-контейнере.

3. Перенести runtime-аргументы из конструкторов в метод connect для Worker, DataBus, использовать для инстанциирования DI-контейнер

4. (v) Перенести существующие настройки из переменных окружения в параметры вызова соответствующих сущностей:
для протоколов:
nats:demo.nats.io:4442,demo.nats.io:4222/file-transfer(mode=object,hwm=32)
или лучше
nats(mode=object,hwm=32):demo.nats.io:4442,demo.nats.io:4222/file-transfer
для обработчиков:
 -w slow:500-5000

5. connectionString передается слишком глубоко по цепочке вызовов, по уму уже в контроллере юзеринпут должен преобразовываться в структуры данных, используемые в программе. Адаптеры должны четко отображать свои опции, явно указывая парсинг connectionString -> ConnectionOptions:
```typescript
export interface ProtocolAdaptor<ConnectionOptions> {
  parseOptions(connectionString: string): Promise<ConnectionOptions>;
  connect(mode: DataBusType, options: ConnectionOptions): Promise<void>;
...
}
```

7. Модуль reader лишний

8. После тестов контейнер с NATS не гасится. Плюс может быть проблемой, что в CI среде нет докера (или доступа к нему).

9. Все тесты позитивные, негативных сценариев не описано

- error handling
- proper logging
- offset support

 Реализованы тесты для самой "узкой" части текущей реализации - адаптера NATS

 - [nats.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats.spec.ts) (20.217 s)
 - [nats/input.stream.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats/input.stream.spec.ts) (13.753 s)
 - [nats/output.stream.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats/output.stream.spec.ts) (21.91 s)

 ## NATS

- создать файл `tr -dc 'a-zA-Z0-9\n' </dev/urandom | head -c 50M > temp/sample.txt`
- запустить `docker compose -f "docker.compose.yml" up --build`
- проверить что ничего не потерялось при передаче `md5sum temp/sample.txt temp/copy-over-nats.txt`

Объем отправляемых в конкретном запросе данных регулируется параметром инициализации [highWaterMark](https://nodejs.org/api/stream.html#new-streamwritableoptions) у выходного потока. Для подбора оптимального значения для конкретной передачи реализовано чтение этого параметра из переменной окружения `NATS_OUT_HWM`. При тестировании скорость передачи быстро упирается в конфигурацию max payload у NATS. 

В базовом `docker.compose.yml` применено стандартное замедление, чтоб поиграть:

- `docker compose -f "docker.compose.yml" up nats reader -d`
- Запуск с 0-5 секундным slow `docker run --rm -e SLOW=5000 -v ${PWD}/temp:/home/node/temp --net=host nats-writer nats:4222/file-transfer ../temp/slow-copy.txt -w slow:5000 --verbose`

 ![tests](./docs/assets/tests.jpg)

[Программирование "на листочке"](./docs/DESIGN_PROPOSAL.md)

