export function parseConnectionString(input: string) : {
    protocol: string,
    connectionOptions: string
} {
    let [protocol, ...rest] = input.split(':');
    let connectionOptions: string;
    if (rest.length === 0) {
        connectionOptions = protocol;
        protocol = 'file';
    } else {
        connectionOptions = rest.join(':');
    }
    if (!protocol) {
        protocol = 'std';
    }

    return {
        protocol, 
        connectionOptions,
    }
}