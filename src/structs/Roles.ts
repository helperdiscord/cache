import State from './bases/State';
import { Snowflake, Role } from '@helperdiscord/types';
/**
 *
 *
 * @export
 * @class Roles
 * @extends {State}
 */
export class Roles extends State {
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Role | null)}
     * @memberof Roles
     */
    public get(id: Snowflake): Role | null {
        let c = (this.client.query('SELECT * FROM roles WHERE role_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.role_id, guild_id: c.guild_id }, c.data) as Role;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @return {*}  {(Promise<Role | Role[] | null>)}
     * @memberof Roles
     */
    public async fetch(id: Snowflake, guild_id: Snowflake): Promise<Role | Role[] | null> {
        const rest = this.rest ? true : false;
        const cache = this.cache;
        let c = (this.client.query('SELECT * FROM roles WHERE role_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: c.role_id, guild_id: c.guild_id }, c.data) as Role;
        }
        if (rest) {
            let channels: Role[] = await this.rest.get(`/guilds/${guild_id}/roles`);
            if (cache) {
                let channel: Role = channels.filter(role => role.id === id)[0]
                if (!channel) return null;
                let newObj = this.client.deepClone(channel) as Role;
                //@ts-ignore
                delete newObj.guild_id;
                //@ts-ignore
                delete newObj.id
                this.client.query('INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, channel.guild_id, JSON.stringify(newObj)])
            }
            return channels;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {Snowflake} guild_id
     * @param {Role} [data]
     * @return {*}  {(Promise<boolean | null>)}
     * @memberof Roles
     */
    public async set(id: Snowflake, guild_id: Snowflake, data?: Role): Promise<boolean | null> {
        const rest = this.rest ? true : false;
        if (data) {
            //@ts-ignore
            delete data.guild_id;
            //@ts-ignore
            delete data.id;
            this.client.query('INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channels: Role[] = await this.rest.get(`/guilds/${guild_id}/roles`);
            let channel: Role = channels.filter(role => role.id === id)[0]
            if (!channel) return null;
            //@ts-ignore
            delete channel.guild_id;
            //@ts-ignore
            delete channel.id;
            this.client.query('INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {boolean}
     * @memberof Roles
     */
    public del(id: Snowflake): boolean {
        this.client.query('DELETE FROM roles WHERE role_id = $1', [id]);
        return true;
    }
    /**
     *
     *
     * @return {*}  {number}
     * @memberof Roles
     */
    public size(): number {
        //@ts-ignore
        let amount = (this.client.query('SELECT COUNT(*) FROM roles'))[0]?.count;
        return amount ?? 0;
    }
    /**
     *
     *
     * @return {*}  {Role[]}
     * @memberof Roles
     */
    public getAll(): Role[] {
        const channels = this.client.query('SELECT * FROM channels') as any[];
        let result: Role[] = [];
        for (const channel of channels) {
            result.push(this.client.mergeObjects<{ id: Snowflake, guild_id: Snowflake }, any>({ id: channel.role_id, guild_id: channel.guild_id }, channel.data) as Role);
        }
        return result;
    }
}