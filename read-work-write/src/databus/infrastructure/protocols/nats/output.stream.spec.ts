
import { NatsConnection, connect } from "nats";
import { Subject } from "rxjs";
import { NoopLog } from "src/common/helpers/test-logger";
import { getNatsPort } from "./docker";
import { NatsWritableStream } from "./output.stream";
import { natsHelloWorld, natsTestRequest } from "./test-helpers";

let options, exit$ = new Subject<void>(); 
describe('NatsWritableStream', () => {
    beforeAll(async () => {
        const port = await getNatsPort();
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
          const subject = crypto.randomUUID();
          const stream = new NatsWritableStream({}, connection, subject, new NoopLog());
          stream.write('Hello world');
          await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
          await connection.drain();
          expect('wait and clean disconnect').toBeTruthy();
        });
        it('should write data to NATS subject', async () => {
          const subject = crypto.randomUUID();
          const expectation = 'adapter makes requests and expects replies';
          const input = 'Hello world';

          const stream = new NatsWritableStream({}, connection, subject, new NoopLog());
          stream.write(input);

          const output = await natsTestRequest(options, subject);

          expect(input).toEqual(output)
          });
      });
  });