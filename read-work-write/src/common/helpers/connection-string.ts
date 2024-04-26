export function parseConnectionString(input: string): {
  protocol: string;
  connectionOptions: string;
} {
  let [protocol, ...rest] = input.split(':'); // eslint-disable-line prefer-const
  let connectionOptions: string;

  if (!protocol || protocol == 'std') {
    protocol = 'std';
  } else if (rest.length === 0) {
    connectionOptions = protocol;
    protocol = 'file';
  } else {
    connectionOptions = rest.join(':');
  }

  return {
    protocol,
    connectionOptions,
  };
}
