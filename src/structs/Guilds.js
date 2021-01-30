const State = require('./bases/State');
module.exports = class Guilds extends State {
    _get(id) {
        let g = (this.client.query(`SELECT * FROM guilds WHERE guild_id = $1`, [id]))[0]
        if (g) {
            return this.client.mergeObjects({ id: g.guild_id }, g.data);
        }
        return null;
    }
    async _fetch({ rest, cache }, id) {
        let g = (this.client.query(`SELECT * FROM guilds WHERE guild_id = $1`, [id]))[0]
        if (g) {
            return this.client.mergeObjects({ id: g.guild_id }, g.data);
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
                delete newObj.id
                this.client.query(`INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, JSON.stringify(channel)])
            }
            return channel;
        }
        return null;
    }
    async _set({ rest }, id, data = false) {
        if (data) {
            delete data.id;
            this.client.query(`INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${id}`);
            delete channel.id;
            this.client.query(`INSERT INTO guilds VALUES($1, $2) ON CONFLICT("guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, JSON.stringify(channel)])
        }
        return null;
    }
    _del(id){
        this.client.query(`DELETE FROM guilds WHERE guild_id = $1`, [id]);
        return true;
    }
    _size() {
        let amount = (this.client.query(`SELECT COUNT(*) FROM guilds`))[0]?.count;
        return amount ?? 0;
    }
}