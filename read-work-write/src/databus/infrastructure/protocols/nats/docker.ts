import * as path from 'node:path';
import * as compose from 'docker-compose';

const cwd = path.join(__dirname);

// https://pdmlab.github.io/docker-compose/api.html
export const getNatsPort = async () => {
  const composeUp = await compose.upAll({
    cwd,
    log: false,
  });
  const result = await compose.ps({
    cwd,
    commandOptions: [['--format', 'json']],
  });
  // console.log(
  //     'ps',
  //     JSON.parse(result.out.split("\n")[0]),
  //     result.data.services[0].ports
  // )
  /**
   * @TODO use result.data.services[0].ports after fixes
   * doesn't populate result.data.services properly:
   * 1. ps doesn't output all services -> offset of 1 service https://github.com/PDMLab/docker-compose/issues/251
   * 2. ports are not parsed correctly:
   * output: result.out = '... 6222/tcp, 0.0.0.0:32771->4222/tcp, 0.0.0.0:32770->8222/tcp ...'
   * parsed: result.data.services[0].ports = [ { exposed: { port: NaN, protocol: undefined } } ]
   */
  const service = JSON.parse(result.out.split('\n')[0]);
  return service.Publishers[0].PublishedPort;
};
