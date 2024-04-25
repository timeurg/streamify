
import { getNatsPort } from "./docker";
import { promises as fs } from "node:fs";
import { JSONCodec, NatsConnection, StringCodec, connect } from "nats";
import { Subject } from "rxjs";
import { NatsWritableStream } from "./output.stream";
import { getConfig, natsHelloWorld, natsTestRequest } from "./test-helpers";

let options, config = '', subject = 'testread' + new Date().getTime(), 
    testClient: NatsConnection, sc = StringCodec(), jc = JSONCodec(), exit$ = new Subject<void>(); 
describe('NatsWritableStream', () => {
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
          const stream = new NatsWritableStream({}, connection, subject);
          stream.write('Hello world');
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await connection.drain();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should write data to NATS subject', async () => {
            const expectation = 'adapter makes requests and expects replies';
            const input = 'Hello world';
  
            const stream = new NatsWritableStream({}, connection, subject);
            stream.write(input);

            const output = await natsTestRequest(options, subject);

            expect(input).toEqual(output)
          });
      });
  });