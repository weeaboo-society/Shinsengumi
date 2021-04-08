/**
 * Shinsengumi is a discord bot offering general utilities and server moderation tools
 * Copyright (C) 2020 Yi Fan Song <yfsong00@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 **/

/** */
type timezones = 'EST';

// TODO: Logger looks weird, investigate.
export class Logger {

	// There is probably no need to support other time zones, but keep in mind that this type will need to be changed.
	private timezone: timezones;

	public constructor(timezone: timezones) {
		this.timezone = timezone;
	}

	/**
	 * Logs to stdout and prepends the time.
	 * @param data data to log (same as `console.log`)
	 */
	public log(...data: any[]) {
		let now = new Date(Date.now());

		console.log(`[${now.toLocaleString('en-CA', { timeZone: this.timezone })}]`, ...data);
	}

	/**
	 * Logs to stderr and prepends the time
	 * @param data data to error (same as `console.error`)
	 */
	public error(...data: any[]) {
		let now = new Date(Date.now());

		console.error(`[${now.toLocaleString('en-CA', { timeZone: this.timezone })}]`, ...data);
	}

}
