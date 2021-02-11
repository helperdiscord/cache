import State from './bases/State';
import { Snowflake, Member } from '@helperdiscord/types';
/**
 *
 *
 * @export
 * @class Members
 * @extends {State}
 */
export class Members extends State {
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @return {*}  {(Member | null)}
     * @memberof Members
     */
    public get(id: Snowflake, guild_id: Snowflake): Member | null {
        let c = (this.client.query('SELECT * FROM members WHERE user_id = $1 AND guild_id = $2', [id, guild_id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.user_id, guild_id: c.guild_id }, c.data) as Member;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @return {*}  {(Promise<Member | null>)}
     * @memberof Members
     */
    public async fetch(id: Snowflake, guild_id: Snowflake): Promise<Member | null> {
        const rest = this.rest ? true : false;
        const cache = this.cache;
        let c = (this.client.query('SELECT * FROM members WHERE user_id = $1 AND guild_id = $2', [id, guild_id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.user_id, guild_id: c.guild_id }, c.data) as Member;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/members/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel) as Member;
                //@ts-ignore
                delete newObj.guild_id;
                //@ts-ignore
                delete newObj.id
                this.client.query('INSERT INTO members VALUES($1, $2, $3) ON CONFLICT("user_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, channel.guild_id, JSON.stringify(newObj)])
            }
            return channel;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @param {Member} [data]
     * @return {*}  {(Promise<boolean | null>)}
     * @memberof Members
     */
    public async set(id: Snowflake, guild_id: Snowflake, data?: Member): Promise<boolean | null> {
        const rest = this.rest ? true : false;
        if (data) {
            //@ts-ignore
            delete data.guild_id;
            //@ts-ignore
            delete data.id;
            this.client.query('INSERT INTO members VALUES($1, $2, $3) ON CONFLICT("user_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/members/${id}`);
            if (!channel) return false;
            delete channel.guild_id;
            delete channel.id;
            this.client.query('INSERT INTO members VALUES($1, $2, $3) ON CONFLICT("user_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @return {*}  {boolean}
     * @memberof Members
     */
    public del(id: Snowflake, guild_id: Snowflake): boolean {
        this.client.query('DELETE FROM members WHERE user_id = $1 AND guild_id = $2', [id, guild_id]);
        return true;
    }
    /**
     *
     *
     * @return {*}  {number}
     * @memberof Members
     */
    public size(): number {
        //@ts-ignore
        let amount = (this.client.query('SELECT COUNT(*) FROM members'))[0]?.count;
        return amount ?? 0;
    }
    /**
     *
     *
     * @return {*}  {Member[]}
     * @memberof Members
     */
    public getAll(): Member[] {
        const channels = this.client.query('SELECT * FROM members') as any[];
        let result: Member[] = [];
        for (const channel of channels) {
            result.push(this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: channel.user_id, guild_id: channel.guild_id }, channel.data) as Member);
        }
        return result;
    }
}