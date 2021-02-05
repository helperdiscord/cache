const State = require('./bases/State')
module.exports = class Users extends State {
    /**
     *
     *
     * @param {string} id
     * @return {*} 
     */
    _get(id) {
        let c = (this.client.query('SELECT * FROM users WHERE user_id = $1', [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.user_id }, c.data);
        }
        return null;
    }
    /**
     *
     *
     * @param {*} { rest, cache }
     * @param {string} id
     * @return {*} 
     */
    async _fetch({ rest, cache }, id) {
        let c = (this.client.query('SELECT * FROM users WHERE user_id = $1', [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.user_id }, c.data);
        }
        if (rest) {
            let channel = await this.rest.get(`/users/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
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
     * @param {*} { rest }
     * @param {string} id
     * @param {object|boolean} [data=false]
     * @return {*} 
     */
    async _set({ rest }, id, data = false) {
        if (data) {
            delete data.id;
            this.client.query('INSERT INTO users VALUES($1, $2) ON CONFLICT("user_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/users/${id}`);
            if(!channel) return false;
            delete channel.id;
            this.client.query('INSERT INTO users VALUES($1, $2) ON CONFLICT("user_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {string} id
     * @return {boolean} 
     */
    _del(id) {
        this.client.query('DELETE FROM users WHERE user_id = $1', [id]);
        return true;
    }
    /**
     *
     *
     * @return {number} 
     */
    _size() {
        let amount = (this.client.query('SELECT COUNT(*) FROM users'))[0]?.count;
        return amount ?? 0;
    }

    total() {
        let rows = this.client.query(`SELECT(SELECT data->'member_count') members FROM guilds`);
        r.rows.reduce((a,b) => a+b.members, 0);
        let amount = (this.client.query('SELECT COUNT(*) FROM users'))[0]?.count;
        return amount ?? 0;
    }
}