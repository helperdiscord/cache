import State from './bases/State';
import { Snowflake, User } from '@helperdiscord/types';
/**
 *
 *
 * @export
 * @class Users
 * @extends {State}
 */
export class Users extends State {
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(User | null)}
     * @memberof Users
     */
    public get(id: Snowflake): User | null {
        let c = (this.client.query('SELECT * FROM users WHERE user_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake }, any>({ id: c.user_id }, c.data) as User;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {(Promise<User | null>)}
     * @memberof Users
     */
    public async fetch(id: Snowflake): Promise<User | null> {
        const rest = this.rest ? true : false;
        const cache = this.cache;
        let c = (this.client.query('SELECT * FROM users WHERE user_id = $1', [id])) as any[][0]
        if (c) {
            return this.client.mergeObjects<{ id: Snowflake }, any>({ id: c.user_id }, c.data) as User;
        }
        if (rest) {
            let channel = await this.rest.get(`/users/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel) as User;
                //@ts-ignore
                delete newObj.id
                this.client.query('INSERT INTO users VALUES($1, $2) ON CONFLICT("user_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, channel.JSON.stringify(newObj)])
            }
            return channel;
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @param {User} [data]
     * @return {*}  {(Promise<boolean | null>)}
     * @memberof Users
     */
    public async set(id: Snowflake, data?: User): Promise<boolean | null> {
        const rest = this.rest ? true : false;
        if (data) {
            //@ts-ignore
            delete data.id;
            this.client.query('INSERT INTO users VALUES($1, $2) ON CONFLICT("user_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/users/${id}`);
            if (!channel) return false;
            delete channel.id;
            this.client.query('INSERT INTO users VALUES($1, $2) ON CONFLICT("user_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {Snowflake} id
     * @return {*}  {boolean}
     * @memberof Users
     */
    public del(id: Snowflake): boolean {
        this.client.query('DELETE FROM users WHERE user_id = $1', [id]);
        return true;
    }
    /**
     *
     *
     * @return {*}  {number}
     * @memberof Users
     */
    public size(): number {
        //@ts-ignore
        let amount = (this.client.query('SELECT COUNT(*) FROM users'))[0]?.count;
        return amount ?? 0;
    }
    /**
     *
     *
     * @return {*}  {User[]}
     * @memberof Users
     */
    public getAll(): User[] {
        const channels = this.client.query('SELECT * FROM users') as any[];
        let result: User[] = [];
        for (const channel of channels) {
            result.push(this.client.mergeObjects<{ id: Snowflake }, any>({ id: channel.id }, channel.data) as User);
        }
        return result;
    }
}