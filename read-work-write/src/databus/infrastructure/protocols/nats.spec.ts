
import { NatsProtocolAdaptor } from "./nats";
import { getNatsPort } from "./nats/docker";
import { promises as fs } from "node:fs";
import { JSONCodec, NatsConnection, StringCodec } from "nats";
import { Subject, firstValueFrom, takeUntil, timeout } from "rxjs";
import { Readable, Writable } from "node:stream";
import { getConfig, natsHelloWorld, natsTestRequest, natsTestSubscribe } from "./nats/test-helpers";
import { deps } from "./helpers/test.dependencies";
import { NatsReadableStream } from "./nats/input.stream";
import { NatsWritableStream } from "./nats/output.stream";

let options, subject = '', config = '', 
    testClient: NatsConnection, sc = StringCodec(), jc = JSONCodec(), exit$ = new Subject<void>(); 
describe('NatsProtocolAdaptor', () => {
  //@TODO test new (FILENAME) initialization
    beforeAll(async () => {
        const port = await getNatsPort();
        subject = crypto.randomUUID();
        options = {
            port
        }
    });
    afterAll(async () => {
      exit$.next();
    })
    describe('testbed', () => {
      it('should have a NATS server for testing', async () => {
        const result = await natsHelloWorld(options)
        expect(result).toEqual("world");
      });
    });
    describe('input mode', () => {
      describe('connect', () => {
        it('should connect with [port/subject] initialization string', async () => {
          const protocol = new NatsProtocolAdaptor(`${options.port}/${crypto.randomUUID()}`, deps);
          const state$ = firstValueFrom(protocol.state().pipe(takeUntil(exit$), timeout(1000)));
          await protocol.connect('input');
          const state = await state$;
          protocol.disconnect();
          expect(state).toEqual('READY');
        });
        it('should connect with [filename] initialization string', async () => {
          config = await getConfig(options, crypto.randomUUID());
          const protocol = new NatsProtocolAdaptor(config, deps);
          const state$ = firstValueFrom(protocol.state().pipe(takeUntil(exit$), timeout(1000)));
          await protocol.connect('input');
          const state = await state$;
          protocol.disconnect();
          await fs.unlink(config)
          expect(state).toEqual('READY');
        });
      });
      describe('getStream', () => {
        let protocol;
        beforeEach(async () => {
          subject = crypto.randomUUID();
          protocol = new NatsProtocolAdaptor(`${options.port}/${subject}`, deps);
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
          const protocol = new NatsProtocolAdaptor(`${options.port}/${crypto.randomUUID()}`, deps);
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
          subject = crypto.randomUUID();
          protocol = new NatsProtocolAdaptor(`${options.port}/${subject}`, deps);
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
          
          expect(input).toEqual(output);
        });
      });
    })
    describe('integration', () => {
      test('data written to NatsProtocolAdaptor in output mode can be read from NatsProtocolAdaptor in input mode', async () => {
        const data1 = 'A stream is an abstract interface for working with streaming data in Node.js. The node:stream module provides an API for implementing the stream interface.',
              data2 = 'There are many stream objects provided by Node.js. For instance, a request to an HTTP server and process.stdout are both stream instances.',
              subject = crypto.randomUUID(),
              output = new NatsProtocolAdaptor(`${options.port}/${subject}`, deps), 
              input = new NatsProtocolAdaptor(`${options.port}/${subject}`, deps);
        await Promise.all([output.connect('output'), input.connect('input')]);
        const sin = input.getStream('input') as NatsReadableStream, sout = output.getStream('output') as NatsWritableStream;
        sout.write(data1);
        await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
        sout.write("\n");
        sout.write(data2);
        sout.end('');
        let result = '';
        for await (const chunk of sin) {
          result += chunk
        }
        expect(result).toEqual(data1 + "\n" + data2);
      }, 10000);
    });
  });