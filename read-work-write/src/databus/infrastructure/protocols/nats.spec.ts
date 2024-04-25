
import { NatsProtocolAdaptor } from "./nats";
import { getNatsPort } from "./nats/docker";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from 'node:os';
import { Empty, JSONCodec, NatsConnection, StringCodec, connect, headers } from "nats";
import { Subject, firstValueFrom, takeUntil, timeout } from "rxjs";
import { Readable, Writable } from "node:stream";
import * as crypto from 'node:crypto';
import { getConfig, natsHelloWorld, natsTestRequest, natsTestSubscribe } from "./nats/test-helpers";

let options, config = '', subject = 'test' + new Date().getTime(), 
    testClient: NatsConnection, sc = StringCodec(), jc = JSONCodec(), exit$ = new Subject<void>(); 
describe('NatsProtocolAdaptor', () => {
    beforeAll(async () => {
        const port = await getNatsPort();
        options = {
            port
        }
        config = await getConfig(options, subject)
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
        const result = await natsHelloWorld(options)
        expect(result).toEqual("world");
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

          const { testClient } = await natsTestSubscribe(options, subject, data);

          const stream = protocol.getStream('input');
          let result = '';
          for await (const chunk of stream) {
            result += chunk
          }
          await testClient.drain();
          await testClient.close();
          expect(result).toEqual(data)
        });
      });
    });
    describe('output mode', () => {
      describe('connect', () => {
        it('should connect to a running NATS server', async () => {
          const protocol = new NatsProtocolAdaptor(config);
          const state$ = firstValueFrom(protocol.state().pipe(takeUntil(exit$), timeout(1000)));
          await protocol.connect('output');
          const state = await state$;
          protocol.disconnect();
          expect(state).toEqual('READY');
        });
      });
      describe('getStream', () => {
        let protocol;
        beforeEach(async () => {
          protocol = new NatsProtocolAdaptor(config);
          await protocol.connect('output');
        })
        afterEach(() => {
          protocol.disconnect();
        })
        it('should return a Writable stream', async () => {
          const stream = protocol.getStream('output');
          expect(stream).toBeInstanceOf(Writable)
        });
        it('should wait for responders until disconnect', async () => {
          const stream = protocol.getStream('output');
          stream.write('Hello world');
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await protocol.disconnect();
          stream.removeAllListeners();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should write data to NATS subject', async () => {
          const expectation = 'adapter makes requests and expects replies';
          const input = 'Hello world';

          const stream = protocol.getStream('output');

          stream.write(input);
          
          const output = await natsTestRequest(options, subject);
          
          expect(input).toEqual(output)
        }, 10000);
      });
    })
  });