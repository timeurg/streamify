# Streamify

`streamify` utilises Node Streams and Transformers to build versatile Node.js-based application infrastructures designed for efficient data transfer and processing utilising microservice pipe-n-filters approach. Initially demonstrated with NATS for inter-service communication, the project's architecture allows for scalability and integration with various transport systems like PostgreSQL, Kafka, and gRPC. 
The project emphasizes efficient handling of large data volumes and includes Docker support for easy deployment.

# What's next

Next milestone is integrating [csv capabilities](https://github.com/adaltas/node-csv/blob/master/packages/stream-transform/README.md) and pg [queries](https://www.npmjs.com/package/pg-query-stream) and [writes](https://github.com/brianc/node-pg-copy-streams). 

# Usage

CLI приложение со следующим синтаксом:

`<run> [[-w worker]] <source> [target]`

- `<run>` команда на запуск приложения, например `node dist/main` или `docker run --rm reader`
- `-w --worker` потоковый обработчик передаваемых данных, можно передать несколько, порядок имеет значение
  - на  данный момент доступен только `-w gzip`, вызывающий `require('node:zlib').createGzip()`
- аргументы `<source> [target]` - источник и назначение данных. Если указано одно значение оно считаетается источником. Значения имеют вид `ПРОТОКОЛ:НАСТРОЙКИ`, если не указан протокол, но значение не пустое используется протокол `file`, если значение пустое - `std` (stdin для источника, stdout для назначения)

## Scripts
- аналог cp: `docker run --rm -v ${PWD}/temp:/home/node/temp reader ../temp/sample.txt ../temp/copy2.txt`
- аналог cat: `docker run --rm -v ${PWD}/temp:/home/node/temp reader ../temp/sample.txt`
- аналог sed (добавить обработчиков `-w` по вкусу): `tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 10K | docker run -i --rm -v ${PWD}/temp:/home/node/temp reader std ../temp/doc2`
- создать большой файл для теста: `head -c 50M /dev/urandom > temp/sample.txt` или `tr -dc 'a-zA-Z0-9\n' </dev/urandom | head -c 50M > temp/sample.txt` для читабельности
- собрать образы `docker compose -f "docker.compose.yml" up -d --build`
- тестировать разные комбинации передачи:
  - поднять Writer и NATS `docker compose -f "docker.compose.yml" up writer nats`
  - настроить HighWaterMark `docker run --rm -e NATS_OUT_HWM=800 -v ${PWD}/temp:/home/node/temp --net=host reader ../temp/sample.txt nats:4222/file-transfer` (или, например, направить `/dev/urandom` на вход)
- проверить что ничего не потерялось при передаче `md5sum temp/sample.txt temp/copy-over-nats.txt`

## NATS

- создать файл `tr -dc 'a-zA-Z0-9\n' </dev/urandom | head -c 50M > temp/sample.txt`
- запустить `docker compose -f "docker.compose.yml" up --build`
- проверить что ничего не потерялось при передаче `md5sum temp/sample.txt temp/copy-over-nats.txt`

Объем отправляемых в конкретном запросе данных регулируется параметром инициализации [highWaterMark](https://nodejs.org/api/stream.html#new-streamwritableoptions) у выходного потока. Для подбора оптимального значения для конкретной передачи реализовано чтение этого параметра из переменной окружения `NATS_OUT_HWM`. При тестировании скорость передачи быстро упирается в конфигурацию max payload у NATS. 

В базовом `docker.compose.yml` применено стандартное замедление, чтоб поиграть:

- `docker compose -f "docker.compose.yml" up nats reader -d`
- Запуск с 5 секундным slow `docker run --rm -e SLOW=5000 -v ${PWD}/temp:/home/node/temp --net=host writer nats:4222/file-transfer ../temp/slow-copy.txt -w slow --verbose`

## Debug

- local `cd read-work-write && npm run start:dev -- -- [[-w worker]] <source> [target]`
  - `npm run start:dev -- -- ../temp/sample.txt nats:4222/file-transfer` - reader
- docker `docker compose -f "docker.compose.debug.yml" up -d --build`

## ToDo

1. Избавиться от @nest/cqrs, лишнее усложнение без видимых преимуществ

2. Избавиться от InjectionToken.ProtocolAdaptor_FACTORY в пользу стандартной регистрации ProtocolAdaptor'ов в DI-контейнере.

3. Перенести runtime-аргументы из конструкторов в метод connect для Worker, DataBus, использовать для инстанциирования DI-контейнер

4. Перенести существующие настройки из переменных окружения в параметры вызова соответствующих сущностей:
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

# Developer Notes

 Реализованы тесты для самой "узкой" части текущей реализации - адаптера NATS

 - [nats.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats.spec.ts) (20.217 s)
 - [nats/input.stream.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats/input.stream.spec.ts) (13.753 s)
 - [nats/output.stream.spec.ts](./read-work-write/src/databus/infrastructure/protocols/nats/output.stream.spec.ts) (21.91 s)

 ![tests](./docs/assets/tests.jpg)

[Программирование "на листочке"](./docs/DESIGN_PROPOSAL.md)

