import { ApiPromise, WsProvider } from "@polkadot/api";
import "@polkadot/api-augment";
var sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const WEB_SOCKET = "ws://127.0.0.1:9944";
const connect = async () => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({provider: wsProvider});
    await api.isReady;
    return api;
}

const subscribeStorageValue = async (api: ApiPromise) => {
    await api.query.templateModule.something((value: { toHuman: () => any; }) => {
        console.log("something is ", value.toHuman());
    });
}

const subscribeSomethingStoredEvent = async (api: ApiPromise) => {
    await api.query.system.events(events => {
        events.forEach(record => {
            const event = record.event;
            if(event.method === "SomethingStored") {
                console.log("SomethingStored : ", record.toHuman());
            }
        });
    });
}

const offchainStorageGet = async (api: ApiPromise) => {
    const key = "node-template::storage";
    
    let data = await api.rpc.offchain.localStorageGet("PERSISTENT", key);
    if(data.isSome) {
        console.log(data.toHuman());
    }else{
        console.log("key: node-template::storage 未找到值");
    }
    
}

const main = async () => {
    const api = await connect();

    await subscribeStorageValue(api);
    
    await subscribeSomethingStoredEvent(api);

    await offchainStorageGet(api);
    
    await sleep(50000);

    console.log("function main");
}

main().then(() => {
    console.log("exits with success");
    process.exit(0);
}).catch(err => {
    console.error("error is ", err);
    process.exit(1);
});