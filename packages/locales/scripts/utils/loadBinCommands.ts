/* eslint-disable import/no-dynamic-require */
import { join } from 'path';
import { Command } from 'commander';
import { get } from 'lodash';

/**
 * @description Batch load command
 */
export function loadBinCommands(program: Command, config: ConfigType) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { importCommand } = require(join(__dirname, '../commands/import.ts'));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { exportCommand } = require(join(__dirname, '../commands/export.ts'));
    const commonConfig = get(config, 'common');

    // eslint-disable-next-line
    importCommand(program, Object.assign({}, commonConfig, config['import']));
    // eslint-disable-next-line
    exportCommand(program, Object.assign({}, commonConfig, config['export']));
}
