const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
Events
} = require("discord.js");

const config = require("./config.json");

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.MessageContent
]
});

const analise = {};

function embed(titulo, desc) {
return new EmbedBuilder()
.setTitle(titulo)
.setDescription(desc)
.setColor("#00ffcc")
.setFooter({ text: "Sistema Profissional • Zona Leste" })
.setTimestamp();
}

client.once("ready", () => {
console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on(Events.ChannelCreate, enviarPainel);
client.on(Events.ChannelUpdate, (oldChannel, newChannel) => {

if (newChannel.parentId === config.categoriaTicketsAnalise)
enviarPainel(newChannel);

});

async function enviarPainel(channel) {

if (!channel.guild) return;

if (channel.parentId !== config.categoriaTicketsAnalise)
return;

// esperar Apollo mandar mensagem primeiro
setTimeout(async () => {

const botao = new ButtonBuilder()
.setCustomId("iniciar")
.setLabel("Iniciar análise")
.setStyle(ButtonStyle.Success);

await channel.send({

embeds: [

new EmbedBuilder()

.setColor("#00ffcc")

.setTitle("📊 Sistema de Análise de Streamers")

.setDescription(

"Clique no botão abaixo para iniciar sua análise.\n\n" +

"Envie informações corretas para garantir aprovação."

)

.setFooter({

text: "Zona Leste • Sistema Profissional"

})

.setTimestamp()

],

components: [

new ActionRowBuilder().addComponents(botao)

]

});

}, 2000);

}

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isButton()) return;

analise[interaction.user.id] = {

etapa: 1,
canal: interaction.channel

};

await interaction.reply({

embeds: [

embed(

"Envie o link do seu perfil",

"Exemplo:\nhttps://tiktok.com/@usuario"

)

],

ephemeral: true

});

});

client.on(Events.MessageCreate, async message => {

if (message.author.bot) return;

const user = analise[message.author.id];

if (!user) return;

// LINK
if (user.etapa === 1) {

user.link = message.content;

const nome = user.link.split("@")[1]?.split("/")[0];

user.nome = nome || "streamer";

user.etapa++;

return message.reply({

embeds: [

embed(

"Envie o ID do jogo",

"Exemplo: 143"

)

]

});

}

// ID DO JOGO
if (user.etapa === 2) {

user.idjogo = message.content;

user.etapa++;

return message.reply({

embeds: [

embed(

"Quantos seguidores você tem?",

"Envie apenas números.\nExemplo: 1500"

)

]

});

}

// SEGUIDORES
if (user.etapa === 3) {

user.seguidores = parseInt(message.content);

if (isNaN(user.seguidores))
return message.reply("Envie apenas números.");

user.etapa++;

return message.reply({

embeds: [

embed(

"Envie o print das métricas",

"Imagem mostrando seguidores e views"

)

]

});

}

// PRINT
if (user.etapa === 4) {

if (!message.attachments.first())
return message.reply("Envie uma imagem.");

user.etapa++;

return message.reply({

embeds: [

embed(

"Média de views",

"Exemplo: 800"

)

]

});

}

// VIEWS
if (user.etapa === 5) {

user.views = parseInt(message.content);

user.etapa++;

return message.reply({

embeds: [

embed(

"Quantos vídeos por semana?",

"Exemplo: 5"

)

]

});

}

// POSTS
if (user.etapa === 6) {

user.posts = parseInt(message.content);

user.etapa++;

return message.reply({

embeds: [

embed(

"Quantas lives por semana?",

"Exemplo: 3"

)

]

});

}

// FINAL
if (user.etapa === 7) {

user.lives = parseInt(message.content);

const seguidores = user.seguidores;

let categoria;
let cargo;
let destino;

// RENOMEAR CANAL
await message.channel.setName(
`${user.nome}-${user.idjogo}`
);

// CLASSIFICAÇÃO
if (seguidores >= 10000) {

categoria = "Diamante 💎";

await message.channel.setParent(
config.categoriasDestino.diamante
);

await message.channel.send({

content: `<@${config.idDono}>`,

embeds: [

embed(

"Streamer elegível para contrato",

"Perfil aprovado para contrato manual."

)

]

});

}
else if (seguidores >= 4000) {

categoria = "Rubi ♦";

cargo = config.cargos.rubi;

destino = config.categoriasDestino.rubi;

}
else if (seguidores >= 3000) {

categoria = "Ouro 🥇";

cargo = config.cargos.ouro;

destino = config.categoriasDestino.ouro;

}
else if (seguidores >= 2000) {

categoria = "Prata 🥈";

cargo = config.cargos.prata;

destino = config.categoriasDestino.prata;

}
else if (seguidores >= 1001) {

categoria = "Platina 💠";

cargo = config.cargos.platina;

destino = config.categoriasDestino.platina;

}
else if (seguidores >= 100) {

categoria = "Bronze 🥉";

cargo = config.cargos.bronze;

destino = config.categoriasDestino.bronze;

}
else {

categoria = "Reprovado";

}

// aplicar cargo
if (cargo)
await message.member.roles.add(cargo);

// mover ticket
if (destino)
await message.channel.setParent(destino);

// mensagem final profissional
await message.channel.send({

embeds: [

new EmbedBuilder()

.setColor("#00ffcc")

.setTitle("✅ Análise concluída com sucesso")

.setDescription(

`Parabéns, você foi aprovado como **Streamer ${categoria}**.\n\n` +

`Seja muito bem-vindo à equipe de streamers.\n\n` +

`📌 Confira os canais abaixo para evitar erros ou punições:\n` +

`• benefícios streamers\n` +

`• regras streamers\n\n` +

`🎁 Envie neste ticket qual benefício deseja resgatar.\n\n` +

`⏱️ Em até **1 hora**, um de nossos atendentes irá finalizar seu atendimento.`

)

.setFooter({

text: "Zona Leste • Sistema Profissional"

})

.setTimestamp()

]

});

delete analise[message.author.id];

}

});

client.login(config.token);