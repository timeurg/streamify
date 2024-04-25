// requests data from {subject}

import { ConnectionOptions, Empty, StringCodec, connect, headers } from "nats";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from 'node:os';

const sc = StringCodec();

export const natsHelloWorld = async (options: ConnectionOptions) => {
    //!sic can't call connect(options), as connect mutates options
    //resulting in "NatsError: port and servers options are mutually exclusive" on next call
    const testClient = await connect({...options}) 
    
    const sub = testClient.subscribe("hello");
    let data: Uint8Array;
    (async () => {
        for await (const m of sub) {
            data = m.data;
        }
    })();
    testClient.publish("hello", "world");
    
    await testClient.drain();
    // await testClient.close();
    const err = await testClient.closed();
    if (err) {
        console.log(err)
    }
    return sc.decode(data);
}

// sets "transactionId" header to identify request origin
export const natsTestRequest = async (options: ConnectionOptions, subject: string) => {
    const testClient = await connect({...options});
    const timeout = 5000, header = headers();
    header.append("transactionId", crypto.randomUUID());
    header.append("batchCount", '0');
    let output: string;
    await testClient.request(
        subject, 
        Empty, 
        { noMux: true, timeout, headers: header }
    ).then((m) => {
        output = sc.decode(m.data);
    }).catch(e => {
        console.log('TestClient request fail', e);
    });
    await testClient.drain();
    await testClient.close();
    return output;
}

// listens for {subject} requests and returns data
// if header "transactionId" is set each responce returns a chunk of data
// when all data for a transaction is sent subsequent requests return empty buffer
export const natsTestSubscribe = async (options: ConnectionOptions, subject: string, data: string) => {
    const testClient = await connect({...options});
    const subscription = testClient.subscribe(subject);
    const transactions = {};
    (async (sub) => {
      for await (const m of sub) {
        let transactionId: string;
        if (m.headers) {
          transactionId = m.headers.get("transactionId");
          transactions[transactionId] = transactions[transactionId] || data.split('');
          m.respond(sc.encode(transactionId ? transactions[transactionId].splice(0, 1) : data));
        }
      }
    })(subscription);
    return {
        testClient,
        subscription,
    };
}          
            
export const getConfig = async (connection: ConnectionOptions, subject: string) => {
    const filename = path.join(os.tmpdir(),'nats_adapter_config_' + crypto.randomUUID());
    
    await fs.writeFile(filename, JSON.stringify({
        connection,
        subject,
    }))

    return filename
}
            