const color = require('colors');
const fetch = require('node-fetch');
const hypixel = require("hypixel-api-nodejs");
const humanizeDuration = require('humanize-duration');
const { DISCORD_TOKEN, clientId, PREFIX, MONGO_URI, AppClientID, AppSecretToken} = require("../../../config.json");

module.exports = {
    name: 'hypixel',
    permissions: [],
    description: "this sends help!",
    aliases: ['h'],
    execute(client, message, cmd, args, Discord) {

        let
            key = '7197ed2d-894c-4580-98f3-d2597574c0d4', 
            token = TOKEN, 
            prefix = PREFIX 
        ;

        const cooldowns = {
            "hypixel": {
                "main": new Map(),
                "pit": new Map()
            }
        };

        let cooldownT = 30 * 1000, cooldownG = cooldowns.hypixel.main.get(message.author.id);
        if(cooldownG) return m.channel.send(`Please wait ${humanizeDuration(cooldownG - Date.now(), { round: true })} before running ${command} again`);

        function minecraftColorToHex(colorname) {
            switch(colorname) {
                case "BLACK":
                    return "#000000";
                case "DARK_BLUE":
                    return "#0100BD";
                case "DARK_GREEN":
                    return "#00BF00";
                case "DARK_AQUA":
                    return "#00BDBD";
                case "DARK_RED":
                    return "#BE0000";
                case "DARK_PURPLE":
                    return "#BC01BC";
                case "GOLD":
                    return "#DB9F37";
                case "GRAY":
                    return "#BEBDBE";
                case "DARK_GRAY":
                    return "#3F3F3F";
                case "BLUE":
                    return "#3F3FFE";
                case "GREEN":
                    return "#3FFE3E";
                case "AQUA":
                    return "#40FCFF";
                case "RED":
                    return "#FF3E3F";
                case "LIGHT_PURPLE":
                    return "#FE3FFE";
                case "YELLOW":
                    return "#FEFD3F";
                case "WHITE":
                    return "#FFFFFF";
            }
        }
        // Change games returned by the Hypixel API to clean ones
        String.prototype.toCleanGameType = function() {
            switch(this.toString()) {
                case "BEDWARS": 
                    return "BedWars";
                case "QUAKECRAFT":
                    return "Quake";
                case "WALLS":
                    return "Walls";
                case "PAINTBALL":
                    return "Paintball";
                case "SURVIVAL_GAMES":
                    return "Blitz Survival Games";
                case "TNTGAMES":
                    return "TNT Games";
                case "VAMPIREZ":
                    return "VampireZ";
                case "WALLS3":
                    return "Mega Walls";
                case "ARCADE":
                    return "Arcade";
                case "ARENA":
                    return "Arena";
                case "UHC":
                    return "UHC Champions";
                case "MCGO":
                    return "Cops and Crims";
                case "BATTLEGROUND":
                    return "Warlords";
                case "SUPER_SMASH":
                    return "Smash Heroes";
                case "GINGERBREAD":
                    return "Turbo Kart Racers";
                case "HOUSING":
                    return "Housing";
                case "SKYWARS":
                    return "SkyWars";
                case "TRUE_COMBAT":
                    return "Crazy Walls";
                case "SPEED_UHC":
                    return "Speed UHC";
                case "SKYCLASH":
                    return "SkyClash";
                case "LEGACY":
                    return "Classic Games";
                case "PROTOTYPE":
                    return "Prototype";
                case "MURDER_MYSTERY":
                    return "Murder Mystery";
                case "BUILD_BATTLE":
                    return "Build Battle";
                case "DUELS":
                    return "Duels";
                case "SKYBLOCK":
                    return "SkyBlock";
                case "PIT":
                    return "Pit";
                default:
                    return "None";
            }
        }
        // Foreach in objects
        var ObjectforEach = function (collection, callback, scope) {
            if (Object.prototype.toString.call(collection) === '[object Object]') {
              for (var prop in collection) {
                if (Object.prototype.hasOwnProperty.call(collection, prop)) {
                  callback.call(scope, collection[prop], prop, collection);
                }
              }
            } else {
              for (var i = 0, len = collection.length; i < len; i++) {
                callback.call(scope, collection[i], i, collection);
              }
            }
        };
        // Capitalize first letter and lowercase the rest
        String.prototype.capitalizeFirst = function() {
            return this.toString().charAt(0).toUpperCase() + this.toString().slice(1).toLowerCase();
        }
        String.prototype.toTimeString = function() {
            let num = this.toString();
            if(num < 60) return `${num}m`;
            let hours = (num / 60);
            let rhours = Math.floor(hours);
            let minutes = (hours - rhours) * 60;
            let rminutes = Math.round(minutes);
            return `${rhours}h ${rminutes}m`;
        }
        // Add leading zeros
        function pad(n){return n<10 ? '0'+n : n}
        

        const embedHelper = { 
            footer: {
                text: 'JustShush#0773',                                        
                image: {
                    'green': 'https://cdn.discordapp.com/emojis/722990201307398204.png?v=1',
                    'red':   'https://cdn.discordapp.com/emojis/722990201302941756.png?v=1'
                }
            } 
        };

        function sendErrorEmbed(channel, error, description) {
            const exampleEmbed = new Discord.MessageEmbed()
                .setColor('#F64B4B')
                .setTitle(`Oops!`)
                .addField(`${error}`, `${description}`)
                //.setThumbnail('https://hypixel.DMarques/assets/images/hypixel.png')              // Change this, its not working!
                .setTimestamp()
                .setFooter(embedHelper.footer.text, embedHelper.footer.image.red)
            return channel.send({
                embeds: [exampleEmbed]
            })
        }

        if (!args[0]) return sendErrorEmbed(message.channel, `Usage`, `${prefix}hypixel <user>`);
        let dmdata = {
            "rank": {},
            "user": {}
        };
        message.channel.send(`${message.author}, fetching **Hypixel API Data**`).then(medit => {
            console.log('parou aqui 1')
            hypixel.getPlayerByName(key, `${args[0]}`).then(user => {
                console.log('parou aqui 2'.brightBlue)
                if (!user.success || user.success == false || user.player == null || user.player == undefined || !user.player) {
                    medit.delete();
                    console.log('deu erro am algo ')
                    return sendErrorEmbed(message.channel, `Unknown Player ` + `Player has no data in Hypixel's Database`);
                };
                hypixel.getGuildByPlayer(key, `${user.player.uuid}`).then(guild => {
                    switch (user.player.newPackageRank) {
                        case "MVP_PLUS":
                            dmdata.rank.displayName = "[MVP+]";
                            dmdata.rank.name = "MVP+";
                            dmdata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "MVP":
                            dmdata.rank.displayName = "[MVP]";
                            dmdata.rank.name = "MVP";
                            dmdata.rank.color = minecraftColorToHex("AQUA");
                            break;
                        case "VIP_PLUS":
                            dmdata.rank.displayName = "[VIP+]";
                            dmdata.rank.name = "VIP+";
                            dmdata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        case "VIP":
                            dmdata.rank.displayName = "[VIP]";
                            dmdata.rank.name = "VIP";
                            dmdata.rank.color = minecraftColorToHex("GREEN");
                            break;
                        default:
                            dmdata.rank.displayName = "";
                            dmdata.rank.name = "None";
                            dmdata.rank.color = minecraftColorToHex("GRAY");
                    }
                    if (user.player.monthlyPackageRank == "SUPERSTAR") {
                        dmdata.rank.displayName = "[MVP++]";
                        dmdata.rank.name = "MVP++";
                        dmdata.rank.color = minecraftColorToHex("GOLD");
                    }
                    if (user.player.rank != undefined) {
                        let rank = user.player.rank;
                        if (rank == "YOUTUBER") {
                            dmdata.rank.displayName = "[YouTuber]";
                            dmdata.rank.name = "YouTuber";
                            dmdata.rank.color = minecraftColorToHex("RED");
                        } else {
                            dmdata.rank.displayName = "[" + rank.capitalizeFirst() + "]";
                            dmdata.rank.name = dmdata.rank.displayName.slice(1, dmdata.rank.displayName.length - 1).capitalizeFirst();
                            dmdata.rank.color = minecraftColorToHex("RED");
                        }
                    }
                    if (user.player.prefix != undefined) {
                        let prefix = user.player.prefix;
                        dmdata.rank.displayName = `[${prefix.replace(/[\[\]]|(\§a)|(\§b)|(\§c)|(\§d)|(\§e)|(\§f)|(\§0)|(\§9)|(\§8)|(\§7)|(\§6)|(\§5)|(\§4)|(\§3)|(\§2)|(\§1)|(\§b)|(\§l)|(\§c)|(\§s)|(\§n)|(\§r)/gmi, "").capitalizeFirst()}]`;
                        dmdata.rank.name = dmdata.rank.displayName.slice(1, dmdata.rank.displayName.length - 1).capitalizeFirst();
                        dmdata.rank.color = minecraftColorToHex("RED");
                    }
                    if (user.player.rankPlusColor) dmdata.rank.color = minecraftColorToHex(user.player.rankPlusColor);
                    if (user.player.userLanguage) dmdata.user.language = user.player.userLanguage.capitalizeFirst();
                    else dmdata.user.language = "Not set";
                    if (user.player.mcVersionRp && user.player.mcVersionRp != undefined && user.player.mcVersionRp != "") dmdata.user.version = user.player.mcVersionRp;
                    else dmdata.user.version = "Not set";
                    if (guild && guild.guild && guild.guild != undefined && guild.guild != null && guild.success == true && guild.guild.name != undefined && guild.guild.name) dmdata.user.guild = `[${guild.guild.name}](https://hypixel.net/guilds/${guild.guild.name_lower.replace(/[ ]/, "+")})`;
                    else dmdata.user.guild = "None";
                    if (user.player.mostRecentGameType && user.player.mostRecentGameType != undefined) dmdata.user.recentGameType = user.player.mostRecentGameType.toCleanGameType();
                    dmdata.user.level = Math.ceil((Math.sqrt(user.player.networkExp + 15312.5) - 125 / Math.sqrt(2)) / (25 * Math.sqrt(2)));
                    let lastLogin = new Date(user.player.lastLogin);
                    let firstLogin = new Date(user.player.firstLogin);
                    const embed = new Discord.MessageEmbed()
                        .setColor(`${dmdata.rank.color}`)
                        .setAuthor(`${message.author.tag}`, `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}?size=128`)
                        .setTitle(`${dmdata.rank.displayName} ${user.player.displayname}`)
                        .setURL(`https://hypixel.net/players/${user.player.displayname}`)
                        .setThumbnail(`https://visage.surgeplay.com/head/128/${user.player.uuid}`)
                        .setImage(`https://visage.surgeplay.com/full/512/${user.player.uuid}`)
                        .addFields({
                            name: `**Rank**`,
                            value: `${dmdata.rank.name}`,
                            inline: true
                        }, {
                            name: `**Karma**`,
                            value: `${(user.player.karma == undefined) ? 0 : user.player.karma}`,
                            inline: true
                        }, {
                            name: `**Level**`,
                            value: `${dmdata.user.level}`,
                            inline: true
                        }, {
                            name: `**Language**`,
                            value: `${dmdata.user.language}`,
                            inline: true
                        }, {
                            name: `**Version**`,
                            value: `${dmdata.user.version}`,
                            inline: true
                        }, {
                            name: `**Guild**`,
                            value: `${dmdata.user.guild}`,
                            inline: true
                        }, {
                            name: `**Recent Game Type**`,
                            value: `${(dmdata.user.recentGameType == undefined) ? "Not set" : dmdata.user.recentGameType}`,
                            inline: true
                        }, {
                            name: `**First Login**`,
                            value: `${pad(firstLogin.getDate())}/${pad(firstLogin.getMonth() + 1)}/${firstLogin.getFullYear()} - ${pad(firstLogin.getHours())}:${pad(firstLogin.getMinutes())}`,
                            inline: true
                        }, {
                            name: `**Last Login**`,
                            value: `${pad(lastLogin.getDate())}/${pad(lastLogin.getMonth() + 1)}/${lastLogin.getFullYear()} - ${pad(lastLogin.getHours())}:${pad(lastLogin.getMinutes())}`,
                            inline: true
                        })
                        .setTimestamp()
                        .setFooter(embedHelper.footer.text, embedHelper.footer.image.green)
                    if (user.player.socialMedia != undefined && user.player.socialMedia.links) {
                        embed.addField(`\u200b`, `\u200b`);
                        ObjectforEach(user.player.socialMedia.links, function (value, prop, obj) {
                            if (prop == "HYPIXEL") value = `[${value.split("/")[4].split(".")[0]}](${value})`;
                            if (prop == "TWITTER") value = `[${value.split("/")[3]}](${value})`;
                            if (prop == "INSTAGRAM") value = `[${value.split("/")[3]}](${value})`;
                            if (prop == "MIXER") value = `[${value.split("/")[3]}](${value})`;
                            if (prop == "TWITCH") value = `[${value.split("/")[3]}](${value})`;
                            if (prop == "YOUTUBE" && (value.toLowerCase().includes("/channel/") || value.toLowerCase().includes("/user/") || value.toLowerCase().includes("/c/"))) value = `[${value.split("/")[4]}](${value})`;
                            if (prop == "YOUTUBE" && !(value.toLowerCase().includes("/channel/") || value.toLowerCase().includes("/user/") || value.toLowerCase().includes("/c/"))) value = `[${value.split("/")[3]}](${value})`;
                            embed.addField(`**${prop.capitalizeFirst()}**`, `${value}`, true);
                        });
                    }
                    cooldowns.hypixel.main.set(message.author.id, Date.now() + cooldownT);
                    setTimeout(() => cooldowns.hypixel.main.delete(message.author.id), cooldownT);
                    return medit.edit({
                        embeds: [embed]
                    });
                });
            }).catch(e => function () {
                medit.edit(`Hypixel API Error`);
                console.log(e);
            });
        });

    }

}