
import { NatsProtocolAdaptor } from "./nats";
import { getNatsPort } from "./nats/docker";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from 'node:os';
import { NatsConnection, StringCodec, connect } from "nats";
import { firstValueFrom, timeout } from "rxjs";

let config = '', testClient: NatsConnection, sc = StringCodec(); 
describe('NatsProtocolAdaptor', () => {
    beforeAll(async () => {
        const port = await getNatsPort();
        console.log('NATS listening at', port)
        config = path.join(os.tmpdir(),'nats_adapter_config' + new Date());
        const options = {
            port
        }
        testClient = await connect(options)
        await fs.writeFile(config, JSON.stringify(options))
    });
    afterAll(async () => {
        await Promise.all([
            fs.unlink(config),
            testClient.close(),
        ]);
    })
    describe('testbed', () => {
      it('should have a NATS server for testing', async () => {
        const sub = testClient.subscribe("hello");
        let result;
        (async () => {
          for await (const m of sub) {
            console.log(`[${sub.getProcessed()}]: ${m.data}`);
            result = m.data;
          }
          console.log("subscription closed");
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
    describe('connect', () => {
      it('should connect to a running NATS server', async () => {
        const protocol = new NatsProtocolAdaptor('');
        const state$ = firstValueFrom(protocol.state().pipe(timeout(1000)));
        await protocol.connect('input');
        const state = await state$;
        expect(state).toEqual('READY');
      });
    });
  });