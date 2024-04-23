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

# Scripts

- `docker compose -f "docker.compose.yml" up -d --build`
- `docker run --rm reader `
- аналог cp: `docker run --rm -v ${PWD}:/home/node/temp reader ../temp/sample.txt ../temp/copy2.txt`
- аналог cat: `docker run --rm -v ${PWD}:/home/node/temp reader ../temp/sample.txt`
- аналог sed (добавить обработчиков `-w` по вкусу): `tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 10K | docker run -i --rm -v ${PWD}:/home/node/temp reader
 std ../temp/doc2`
- создать большой файл для теста: `head -c 50M /dev/urandom > temp/sample.txt` или `tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 50M > sample.txt` для читабельности

## Debug

- local `cd read-work-write && npm run start:dev -- -- [-p param] [source] <target>`
- docker `docker compose -f "docker.compose.debug.yml" up -d --build`

## ToDo

- error handling
- proper logging
- offset support