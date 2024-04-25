
import { getNatsPort } from "./docker";
import { promises as fs } from "node:fs";
import { JSONCodec, NatsConnection, StringCodec, connect } from "nats";
import { Subject } from "rxjs";
import { NatsReadableStream } from "./input.stream";
import { getConfig, natsHelloWorld, natsTestSubscribe } from "./test-helpers";

let options, config = '', subject = 'testread' + new Date().getTime(), 
    testClient: NatsConnection, sc = StringCodec(), jc = JSONCodec(), exit$ = new Subject<void>(); 
describe('NatsReadableStream', () => {
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
          const stream = new NatsReadableStream({}, connection, subject);
          stream.on('data', (data) => console.log(data));
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await connection.drain();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should read data from NATS subject', async () => {
          const expectation = 'NatsReadableStream makes requests and expects replies';
          const data = 'Hello world';

          const { testClient } = await natsTestSubscribe(options, subject, data);

          const stream = new NatsReadableStream({}, connection, subject);
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