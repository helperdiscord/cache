const State = require('./bases/State')
module.exports = class Channels extends State {
    async _get({ rest, cache }, id) {
        let c = (await this.client.query(`SELECT * FROM channels WHERE channel_id = $1`, [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.channel_id, guild_id: c.guild_id }, c.data);
        }
        if (rest) {
            let channel = await this.rest.get(`/channels/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
                delete newObj.guild_id;
                delete newObj.id
                this.client.query(`INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, channel.guild_id, JSON.stringify(newObj)])
            }
            return channel;
        }
        return null;
    }
    async _set({ rest }, id, data = false) {
        if (data) {
            let { guild_id } = data;
            delete data.guild_id;
            delete data.id;
            this.client.query(`INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, guild_id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/channels/${id}`);
            let { guild_id } = channel;
            delete channel.guild_id;
            delete channel.id;
            this.client.query(`INSERT INTO channels VALUES($1, $2, $3) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    async _del(id){
        this.client.query(`DELETE FROM channels WHERE channel_id = $1`, [id]);
        return true;
    }
    async _size() {
        let amount = (await this.client.query(`SELECT COUNT(*) FROM channels`))[0]?.count;
        return amount ?? 0;
    }
}