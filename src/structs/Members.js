const State = require('./bases/State')
module.exports = class Members extends State {
    /**
     *
     *
     * @param {string} id
     * @param {string} guild_id
     * @return {*} 
     */
    _get(id, guild_id) {
        let c = (this.client.query('SELECT * FROM members WHERE user_id = $1 AND guild_id = $2', [id, guild_id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.user_id, guild_id: c.guild_id }, c.data);
        }
        return null;
    }
    /**
     *
     *
     * @param {*} { rest, cache }
     * @param {string} id
     * @param {string} guild_id
     * @return {*} 
     */
    async _fetch({ rest, cache }, id, guild_id) {
        let c = (this.client.query('SELECT * FROM members WHERE user_id = $1', [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.user_id, guild_id: c.guild_id }, c.data);
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/members/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
                delete newObj.guild_id;
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
     * @param {*} { rest }
     * @param {string} id
     * @param {string} guild_id
     * @param {object|boolean} [data=false]
     * @return {*} 
     */
    async _set({ rest }, id, guild_id, data = false) {
        if (data) {
            delete data.guild_id;
            delete data.id;
            this.client.query('INSERT INTO members VALUES($1, $2, $3) ON CONFLICT("user_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/members/${id}`);
            if(!channel) return false;
            delete channel.guild_id;
            delete channel.id;
            this.client.query('INSERT INTO members VALUES($1, $2, $3) ON CONFLICT("user_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;', [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    /**
     *
     *
     * @param {string} id
     * @param {string} guild_id
     * @return {boolean} 
     */
    _del(id, guild_id) {
        this.client.query('DELETE FROM members WHERE user_id = $1 AND guild_id = $2', [id, guild_id]);
        return true;
    }
    /**
     *
     *
     * @return {number} 
     */
    _size() {
        let amount = (this.client.query('SELECT COUNT(*) FROM members'))[0]?.count;
        return amount ?? 0;
    }
}