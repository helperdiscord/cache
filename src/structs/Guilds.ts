import State from './bases/State';
import { Guild, Snowflake } from '@helperdiscord/types';
/**
 *
 *
 * @export
 * @class Guilds
 * @extends {State}
 */
export class Guilds extends State {
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Guild | null)}
     * @memberof Guilds
     */
    public get(id: Snowflake): Guild | null {
        let g = (this.client.query('SELECT * FROM guilds WHERE guild_id = $1', [id])) as any[][0]
        if (g) {
            return this.client.mergeObjects<{ id: Snowflake }, any>({ id: g.guild_id }, g.data) as Guild;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Promise<Guild | null>)}
     * @memberof Guilds
     */
    public async fetch(id: Snowflake): Promise<Guild | null> {
        const rest = this.rest ? true : false;
        const cache = this.cache;
        let g = (this.client.query('SELECT * FROM guilds WHERE guild_id = $1', [id])) as any[][0]
        if (g) {
            return this.client.mergeObjects<{ id: Snowflake }, any>({ id: g.guild_id }, g.data) as Guild;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel) as Guild;
                //@ts-ignore
                delete newObj.id
                this.client.query('INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(channel)])
            }
            return channel;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Guild} [data]
     * @return {*}  {(Promise<boolean | null>)}
     * @memberof Guilds
     */
    public async set(id: Snowflake, data?: Guild): Promise<boolean | null> {
        const rest = this.rest ? true : false;
        if (data) {
            //@ts-ignore
            delete data.id;
            this.client.query('INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${id}`);
            delete channel.id;
            this.client.query('INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {boolean}
     * @memberof Guilds
     */
    public del(id: Snowflake): boolean {
        this.client.query('DELETE FROM guilds WHERE guild_id = $1', [id]);
        return true;
    }
    /**
     *
     *
     * @return {*}  {number}
     * @memberof Guilds
     */
    public size(): number {
        //@ts-ignore
        let amount = (this.client.query('SELECT COUNT(*) FROM guilds'))[0]?.count;
        return amount ?? 0;
    }
    /**
     *
     *
     * @return {*}  {Guild[]}
     * @memberof Guilds
     */
    public getAll(): Guild[] {
        const guilds = this.client.query('SELECT * FROM guilds') as any[];
        let result: Guild[] = [];
        for (const channel of guilds) {
            result.push(this.client.mergeObjects<{ id: Snowflake }, any>({ id: channel.id }, channel.data) as Guild);
        }
        return result;
    }
}