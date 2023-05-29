import fs from 'node:fs';
import { NoName as ConfigureBuild } from '../../configure/type/build.js';

export default class BuildComponent {
	protected readonly config: ConfigureBuild; // Configure

	constructor() {
		this.config = JSON.parse(fs.readFileSync('configure/build.json', 'utf8'));
	}
}
