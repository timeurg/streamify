# Протокол NATS

Используем [библиотеку от производителя](https://github.com/nats-io/nats.js)

Синтаксис: `nats:ПУТЬ_К_ КОНФИГУРАЦИОННОМУ_ФАЙЛУ`.

Конфигурационный файл это JSON со следующими полями:

- `connection` - валидный инпут для `{ connect } from "nats"` https://github.com/nats-io/nats.js
- `subject` - Топик для подписки или пуша данных. Если протокол nats используется в параметре `source` происходит подписка (`subscribe`), если в `target` - пуш (`publish`). Для простоты реализации первого драфта запрещаем `*` и `>`.

# Реализация throttling'а

Расширяем `ProtocolAdaptor` методом `state(): Subject<'BUSY'|'READY'>`.

`DataBus(mode=output)` подписывается на состояние своего адаптера и вызывает события `DataBusBusyEvent` и `DataBusIdleEvent`.

`Worker` реагирует на события вызывая `pause()` и `unpause()` на входящем потоке.

## `NatsProtocolAdaptor.connect(mode=output)`:

- использует [replyto](https://docs.nats.io/using-nats/developer/sending/replyto) для получения уведомления об обработке переданного массива данных, посылает `this.state$.next('READY')` при получении сообщения на инбокс, `this.state$.next('BUSY')` при отсылке
- при получении `ErrorCode.NoResponders, ErrorCode.Timeout` и других ошибок вызывает `this.writable.cork()` для буфферизации данных, пробует переподключиться и передать

## `NatsProtocolAdaptor.connect(mode=input)`:

Стандартная реализация с ответом на replyto. Для имитации "медленного" сервиса будем использовать рандомную задержку, прокидываемую из переменной окружения `RWW_INPUT_DELAY`