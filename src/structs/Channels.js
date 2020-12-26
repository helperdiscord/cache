const State = require('./bases/State')
module.exports = class Channels extends State {
    async _get({ rest, cache }, id) {
        let c = (await this.client.pg.query(`SELECT * FROM channels WHERE channel_id = ${id}`))?.rows[0]
        if (c) {
            return this.client.mergeObjects({ id: c.channel_id, guild_id: c.guild_id }, c.data);
        }
        if (rest) {
            let channel = await this.client.rest.get(`/channels/${id}`);
            if (cache) {
                let newObj = this.client.deepClone(channel);
                delete newObj.guild_id;
                delete newObj.id
                await this.client.pg.query(`INSERT INTO channels VALUES(
                    ${id},
                    ${channel.guild_id},
                    '${JSON.stringify(newObj).replace(`'`, ``)}'
                  ) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;`)
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
            await this.client.pg.query(`INSERT INTO channels VALUES(
                ${id},
                ${guild_id},
                '${JSON.stringify(data).replace(`'`, ``)}'
              ) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;
            `)
            return true;
        }
        if (rest) {
            let channel = await this.client.rest.get(`/channels/${id}`);
            let { guild_id } = channel;
            delete channel.guild_id;
            delete channel.id;
            await this.client.pg.query(`INSERT INTO channels VALUES(
                ${id},
                ${guild_id},
                '${JSON.stringify(channel).replace(`'`, ``)}'
              ) ON CONFLICT("channel_id", "guild_id") DO UPDATE SET "data" = EXCLUDED.data;
            `)
        }
        return null;
    }
    async _size() {
        let amount = (await this.client.pg.query(`SELECT COUNT(*) FROM channels`))?.rows[0]?.count;
        return amount ?? 0;
    }
}