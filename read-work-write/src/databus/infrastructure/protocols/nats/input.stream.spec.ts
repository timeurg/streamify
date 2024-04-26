
import { NatsConnection, connect } from "nats";
import { Subject } from "rxjs";
import { NoopLog } from "src/common/helpers/test-logger";
import { getNatsPort } from "./docker";
import { NatsReadableStream } from "./input.stream";
import { natsHelloWorld, natsTestSubscribe } from "./test-helpers";
import * as crypto from 'node:crypto';

let options, 
    testClient: NatsConnection, exit$ = new Subject<void>(); 
describe('NatsReadableStream', () => {
    beforeAll(async () => {
        const port = await getNatsPort();
        options = {
            port
        }
    });
    afterAll(async () => {
      exit$.next();
      await Promise.all([
          testClient ? testClient.close() : undefined,
      ]);
    })
    describe('testbed', () => {
      it('should have a NATS server for testing', async () => {
        const result = await natsHelloWorld(options)
        expect(result).toEqual("world");
      });
    });
    describe('stream', () => {
        let connection: NatsConnection;
        beforeEach(async () => {
          connection = await connect({...options});
        })
        afterEach(async () => {
            await connection.close();
            const err = await connection.closed()
            if (err) {
              console.log('NATS disconnect', err)
            }
        })
        it('should wait for responders until disconnect', async () => {
          const stream = new NatsReadableStream({}, connection, crypto.randomUUID(), new NoopLog());
          stream.on('data', (data) => console.log(data));
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await connection.drain();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should read data from NATS subject', async () => {
          const expectation = 'NatsReadableStream makes requests and expects replies';
          const data = 'Hello world';
          const subject = crypto.randomUUID();

          const { testClient } = await natsTestSubscribe(options, subject, data);

          const stream = new NatsReadableStream({}, connection, subject, new NoopLog());
          let result = '';
          for await (const chunk of stream) {
            result += chunk
          }
          await testClient.drain();
          await testClient.close();
          expect(result).toEqual(data);
        });
      });
  });