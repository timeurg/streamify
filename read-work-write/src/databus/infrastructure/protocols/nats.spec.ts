
import { NatsProtocolAdaptor } from "./nats";
import { getNatsPort } from "./nats/docker";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from 'node:os';
import { Empty, JSONCodec, NatsConnection, StringCodec, connect } from "nats";
import { Subject, firstValueFrom, takeUntil, timeout } from "rxjs";
import { Readable } from "node:stream";

let options, config = '', subject = 'test' + new Date().getTime(), 
    testClient: NatsConnection, sc = StringCodec(), jc = JSONCodec(), exit$ = new Subject<void>(); 
describe('NatsProtocolAdaptor', () => {
    beforeAll(async () => {
        const port = await getNatsPort();
        config = path.join(os.tmpdir(),'nats_adapter_config' + new Date().getTime());
        options = {
            port
        }
        await fs.writeFile(config, JSON.stringify({
          connection: options,
          subject,
        }))
    });
    afterAll(async () => {
      exit$.next();
      await Promise.all([
          fs.unlink(config),
          testClient && testClient.close(),
      ]);
    })
    describe('testbed', () => {
      it('should have a NATS server for testing', async () => {
        //!sic can't call connect(options), as connect mutates options
        //resulting in "NatsError: port and servers options are mutually exclusive" on next call
        testClient = await connect({...options}) 
        
        const sub = testClient.subscribe("hello");
        let result;
        (async () => {
          for await (const m of sub) {
            result = m.data;
          }
        })();
        testClient.publish("hello", "world");
        
        await testClient.drain();
        const err = await testClient.closed();
        if (err) {
          console.log(err)
        }
        expect(sc.decode(result)).toEqual("world");
      });
    });
    describe('input mode', () => {
      describe('connect', () => {
        it('should connect to a running NATS server', async () => {
          const protocol = new NatsProtocolAdaptor(config);
          const state$ = firstValueFrom(protocol.state().pipe(takeUntil(exit$), timeout(1000)));
          await protocol.connect('input');
          const state = await state$;
          protocol.disconnect();
          expect(state).toEqual('READY');
        });
      });
      describe('getStream', () => {
        let protocol;
        beforeEach(async () => {
          protocol = new NatsProtocolAdaptor(config);
          await protocol.connect('input');
        })
        afterEach(() => {
          protocol.disconnect();
        })
        it('should return a Readable stream', async () => {
          const stream = protocol.getStream('input');
          expect(stream).toBeInstanceOf(Readable)
        });
        it('should wait for responders until disconnect', async () => {
          const stream = protocol.getStream('input');
          stream.on('data', (data) => console.log(data));
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await protocol.disconnect();
          stream.removeAllListeners();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should read data from NATS subject', async () => {
          const expectation = 'adapter makes requests and expects replies';
          const data = 'Hello world';

          // 
          testClient = await connect({...options});
          const subscription = testClient.subscribe(subject);
          const transactions = {};
          (async (sub) => {
            for await (const m of sub) {
              let transactionId;
              if (m.headers) {
                transactionId = m.headers.get("transactionId");
                transactions[transactionId] = transactions[transactionId] || data.split('');
              }
              if (m.respond(sc.encode(transactionId ? transactions[transactionId].splice(0, 1) : data))) {
                expect(expectation).toBeTruthy();
              } else {
                expect(expectation).toBeFalsy();
              }
            }
          })(subscription);

          const stream = protocol.getStream('input');
          let result = '';
          for await (const chunk of stream) {
            result += chunk
          }
          await testClient.drain();
          await testClient.close();
          expect(result).toEqual(data)
        }, 10000);
      });
    })
  });