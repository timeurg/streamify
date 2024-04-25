# Обязательная часть:

Реализовать приложение, которое осуществляет передачу больших объемов данных (например, файлов) через систему обмена сообщениями [NATS](https://nats.io).
Приложение должно состоять из 2х сервисов Reader и Writer, которые можно запустить на разных серверах
(для тестирования можно запускать 2 сервиса на одной машине, главное чтобы использовался выбранный транспорт, в данном случае NATS).
Реализация HTTP части в виде REST API - не обязательна.
Сервис Reader должен осуществлять чтение и передачу данных по заранее выбранному транспорту.
Сервис Writer должен принимать данные от сервиса Reader, обрабатывать их и сохранять.
Сами сервисы можно реализовать без использования фреймворков - nest.js или подобного.

Обработать ситуацию, когда сервис Reader отправляет сервису Writer больше данных, чем тот может обработать.
Для примера, перед записью в сервисе Writer обрабатывайте входящие данные с помощью этого метода:
```js
const processData = (data) => {
  return new Promise(resolve => {
    setTimeout(() => {
     resolve(data);
    }, 500);
  });
};
```

# Дополнительно (по возможности):

1. Реализовать поддержку различных видов транспорта (например websockets). Возможно, дополнительно поддержать обработку различных видов данных.
2. Покрыть тестами.

# Реализация:

[Программирование "на листочке"](./docs/DESIGN_PROPOSAL.md)

CLI приложение со следующим синтаксом:

`<run> [[-w worker]] <source> [target]`

- `<run>` команда на запуск приложения, например `node dist/main` или `docker run --rm reader`
- `-w --worker` потоковый обработчик передаваемых данных, можно передать несколько, порядок имеет значение
- аргументы `<source> [target]` - источник и назначение данных. Если указано одно значение оно считаетается источником. Значения имеют вид `ПРОТОКОЛ:НАСТРОЙКИ`, если не указан протокол, но значение не пустое используется протокол `file`, если значение пустое - `std` (stdin для источника, stdout для назначения)

# Scripts

- создать большой файл для теста: `head -c 50M /dev/urandom > temp/sample.txt` или `tr -dc 'a-zA-Z0-9\n' </dev/urandom | head -c 50M > sample.txt` для читабельности
- собрать образы `docker compose -f "docker.compose.yml" up -d --build`
- тестировать разные комбинации передачи:
- - поднять Writer и NATS `docker compose -f "docker.compose.yml" up writer nats`
- - настроить HighWaterMark `docker run --rm -e NATS_OUT_HWM=800 -v ${PWD}/temp:/home/node/temp --net=host reader ../temp/sample.txt nats:4222/file-transfer` (или, например, направить `/dev/urandom` на вход)
- проверить что ничего не потерялось при передаче `md5sum temp/copy-over-nats.txt temp/copy-over-nats.txt`
- разное:
- - аналог cp: `docker run --rm -v ${PWD}:/home/node/temp reader ../temp/sample.txt ../temp/copy2.txt`
- - аналог cat: `docker run --rm -v ${PWD}:/home/node/temp reader ../temp/sample.txt`
- - аналог sed (добавить обработчиков `-w` по вкусу): `tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 10K | docker run -i --rm -v ${PWD}:/home/node/temp reader
 std ../temp/doc2`


## Debug

- local `cd read-work-write && npm run start:dev -- -- [[-w worker]] <source> [target]`
- - `npm run start:dev -- -- ../temp/sample.txt nats:4222/file-transfer` - reader
- docker `docker compose -f "docker.compose.debug.yml" up -d --build`

## ToDo

- error handling
- proper logging
- offset support