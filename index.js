const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require("discord.js");

// CONFIG VIA RAILWAY ENV
const config = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    categoriaTicketsAnalise: process.env.CATEGORY_ANALISE_ID,
    staffRoleId: process.env.STAFF_ID
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const analise = {};

// EMBED PADRÃO
function embed(titulo, desc) {
    return new EmbedBuilder()
        .setTitle(titulo)
        .setDescription(desc)
        .setColor("#00bfff")
        .setFooter({ text: "Sistema Profissional • Zona Leste" })
        .setTimestamp();
}

// BOT ONLINE
client.once("ready", () => {
    console.log(`✅ Bot online como ${client.user.tag}`);
});

// QUANDO CRIAR CANAL
client.on(Events.ChannelCreate, async (channel) => {

    if (!channel.parentId) return;

    if (channel.parentId !== config.categoriaTicketsAnalise) return;

    analise[channel.id] = {
        etapa: 1,
        media: null,
        videos: null,
        lives: null
    };

    await channel.send({
        embeds: [
            embed("Média de views", "Exemplo: 800")
        ]
    });

});

// RESPOSTAS
client.on(Events.MessageCreate, async (message) => {

    if (message.author.bot) return;

    const canalId = message.channel.id;

    if (!analise[canalId]) return;

    const resposta = message.content.trim();

    if (!/^\d+$/.test(resposta)) {

        await message.reply("❌ Envie apenas números.");
        return;

    }

    const numero = parseInt(resposta);

    // ETAPA 1
    if (analise[canalId].etapa === 1) {

        analise[canalId].media = numero;
        analise[canalId].etapa = 2;

        await message.channel.send({
            embeds: [
                embed("Quantos vídeos por semana?", "Exemplo: 5")
            ]
        });

        return;
    }

    // ETAPA 2
    if (analise[canalId].etapa === 2) {

        analise[canalId].videos = numero;
        analise[canalId].etapa = 3;

        await message.channel.send({
            embeds: [
                embed("Quantas lives por semana?", "Exemplo: 3")
            ]
        });

        return;
    }

    // ETAPA 3 FINAL
    if (analise[canalId].etapa === 3) {

        analise[canalId].lives = numero;

        await message.channel.send({

            content: `<@&${config.staffRoleId}>`,

            embeds: [

                embed(
                    "📊 Análise Finalizada",
                    `📈 Média de views: ${analise[canalId].media}
🎥 Vídeos/semana: ${analise[canalId].videos}
📡 Lives/semana: ${analise[canalId].lives}

✅ Pronto para avaliação da equipe.`
                )

            ]

        });

        delete analise[canalId];

        return;
    }

});

// LOGIN
client.login(config.token);
