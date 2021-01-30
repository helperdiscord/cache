const State = require('./bases/State')
module.exports = class Roles extends State {
    _get(id) {
        let c = (this.client.query(`SELECT * FROM roles WHERE role_id = $1`, [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.role_id, guild_id: c.guild_id }, c.data);
        }
        return null;
    }
    async _fetch({ rest, cache }, id, guild_id) {
        let c = (this.client.query(`SELECT * FROM roles WHERE role_id = $1`, [id]))[0]
        if (c) {
            return this.client.mergeObjects({ id: c.role_id, guild_id: c.guild_id }, c.data);
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/roles`);
            if (cache) {
                channel = channel.filter(role => role.id === id)[0]
                if (!channel) return null;
                let newObj = this.client.deepClone(channel);
                delete newObj.guild_id;
                delete newObj.id
                this.client.query(`INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, channel.guild_id, JSON.stringify(newObj)])
            }
            return channel;
        }
        return null;
    }
    async _set({ rest }, id, guild_id, data = false) {
        if (data) {
            delete data.guild_id;
            delete data.id;
            this.client.query(`INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, guild_id, JSON.stringify(data)])
            return true;
        }
        if (rest) {
            let channel = await this.rest.get(`/guilds/${guild_id}/roles`);
            channel = channel.filter(role => role.id === id)[0]
            if (!channel) return null;
            delete channel.guild_id;
            delete channel.id;
            this.client.query(`INSERT INTO roles VALUES($1, $2, $3) ON CONFLICT("role_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`, [id, guild_id, JSON.stringify(channel)])
        }
        return null;
    }
    _del(id) {
        this.client.query(`DELETE FROM roles WHERE role_id = $1`, [id]);
        return true;
    }
    _size() {
        let amount = (this.client.query(`SELECT COUNT(*) FROM roles`))[0]?.count;
        return amount ?? 0;
    }
}