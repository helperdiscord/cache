import State from './bases/State';
import { Channel, Snowflake } from '@helperdiscord/types';
/**
 *
 *
 * @export
 * @class Channels
 * @extends {State}
 */
export class Channels extends State {
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Channel | null)}
     * @memberof Channels
     */
    public get(id: Snowflake): Channel | null {
        let c = (this.client.query('SELECT * FROM channels WHERE channel_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.channel_id, guild_id: c.guild_id }, c.data) as Channel;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Promise<Channel | null>)}
     * @memberof Channels
     */
    public async fetch(id: Snowflake): Promise<Channel | null> {
        const rest = this.rest ? true : false;
        const cache = this.cache;
        let c = (this.client.query('SELECT * FROM channels WHERE channel_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.channel_id, guild_id: c.guild_id }, c.data) as Channel;
        }
        if (rest) {
            let channel: Channel = await this.rest.get(`/channels/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel) as Channel;
                delete newObj.guild_id;
                //@ts-ignore
                delete newObj.id;
                this.client.query('INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, channel.guild_id as string, JSON.stringify(newObj)])
            }
            return channel;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Channel} [data]
     * @return {*}  {(Promise<boolean | null>)}
     * @memberof Channels
     */
    public async set(id: Snowflake, data?: Channel): Promise<boolean | null> {
        const rest = this.rest ? true : false;
        if (data) {
            let { guild_id } = data;
            delete data.guild_id;
            //@ts-ignore
            delete data.id;
            this.client.query('INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id as string, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/channels/${id}`);
            if (!channel) return false;
            let { guild_id } = channel;
            delete channel.guild_id;
            delete channel.id;
            this.client.query('INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {boolean}
     * @memberof Channels
     */
    public del(id: Snowflake): boolean {
        this.client.query('DELETE FROM channels WHERE channel_id = $1', [id]);
        return true;
    }
    /**
     *
     *
     * @return {*}  {number}
     * @memberof Channels
     */
    public size(): number {
        //@ts-ignore
        let amount = (this.client.query('SELECT COUNT(*) FROM channels'))[0]?.count;
        return amount ?? 0;
    }
    /**
     *
     *
     * @return {*}  {Channel[]}
     * @memberof Channels
     */
    public getAll(): Channel[] {
        const channels = this.client.query('SELECT * FROM channels') as any[];
        let result: Channel[] = [];
        for (const channel of channels) {
            result.push(this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: channel.channel_id, guild_id: channel.guild_id }, channel.data) as Channel);
        }
        return result;
    }
}