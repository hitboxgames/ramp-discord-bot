"use strict";var ke=Object.create;var $=Object.defineProperty;var Ye=Object.getOwnPropertyDescriptor;var Ue=Object.getOwnPropertyNames;var Fe=Object.getPrototypeOf,He=Object.prototype.hasOwnProperty;var Ke=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Ue(t))!He.call(e,n)&&n!==r&&$(e,n,{get:()=>t[n],enumerable:!(o=Ye(t,n))||o.enumerable});return e};var O=(e,t,r)=>(r=e!=null?ke(Fe(e)):{},Ke(t||!e||!e.__esModule?$(r,"default",{value:e,enumerable:!0}):r,e));var g=require("discord.js");var G=require("dotenv");(0,G.config)();var{DISCORD_TOKEN:k,RAMP_CLIENT_ID:Y,RAMP_CLIENT_SECRET:U,GUILD_ID:F,DISCORD_ID:H,GOOGLE_SERVICE_ACCOUNT_EMAIL:K,GOOGLE_PRIVATE_KEY:W,GMAIL_ADDRESS:z,GMAIL_APP_PASSWORD:j,GOOGLE_SHEETS_ID:J}=process.env;if(!k||!Y||!U||!F||!H||!K||!W||!z||!j||!J)throw new Error("Missing environment variables");var i={DISCORD_TOKEN:k,DISCORD_ID:H,RAMP_CLIENT_ID:Y,RAMP_CLIENT_SECRET:U,GUILD_ID:F,GOOGLE_SERVICE_ACCOUNT_EMAIL:K,GOOGLE_PRIVATE_KEY:W,GMAIL_ADDRESS:z,GMAIL_APP_PASSWORD:j,GOOGLE_SHEETS_ID:J};var D=require("discord.js"),We=null,ze=null;async function Q(e,t,r){let o=await e.guilds.fetch(t),s=(await o.channels.fetch()).find(p=>p?.type===D.ChannelType.GuildText&&p.name===r);if(s)return console.log(`Found existing channel: ${s.name}`),s;let c=await o.channels.create({name:r,type:D.ChannelType.GuildText,reason:`${r} channel required by bot`});return console.log(`Created new channel: ${c.name}`),c}async function X(e,t){let r=await Q(e,t,"ramp-transactions");return We=r.id,r}async function S(e,t){let r=await Q(e,t,"ramp-business-alerts");return ze=r.id,r}var a=require("discord.js");function x(e){return["virtual","physical"].includes(e.toLowerCase())}function M(e){return["daily","monthly","yearly","total"].includes(e.toLowerCase())}function b(e){if(!/^\d{2}\/\d{2}\/\d{4}$/.test(e))return!1;let[r,o,n]=e.split("/").map(Number),s=new Date(n,r-1,o);return s.getMonth()===r-1&&s.getDate()===o&&s.getFullYear()===n}var L=new Map,m={EMPLOYEE:"Employee - Ramp",MANAGER:"Manager - Ramp",VERIFIED:"Verified - Ramp"};async function Z(e){try{let t=await e.roles.fetch(),r=t.find(s=>s.name===m.EMPLOYEE),o=t.find(s=>s.name===m.MANAGER),n=t.find(s=>s.name===m.VERIFIED);return r||(console.log(`Creating ${m.EMPLOYEE} role in ${e.name}`),r=await e.roles.create({name:m.EMPLOYEE,color:"Blue",reason:"Required for Ramp bot card requests",permissions:[]})),o||(console.log(`Creating ${m.MANAGER} role in ${e.name}`),o=await e.roles.create({name:m.MANAGER,color:"Green",reason:"Required for Ramp bot card management",permissions:[]})),n||(console.log(`Creating ${m.VERIFIED} role in ${e.name}`),n=await e.roles.create({name:m.VERIFIED,color:"Purple",reason:"Required for verified Ramp users",permissions:[]})),L.set(e.id,{employeeRoleId:r.id,managerRoleId:o.id,verifiedRoleId:n.id}),{employee:r,manager:o,verified:n}}catch(t){throw console.error(`Error setting up roles in guild ${e.name}:`,t),t}}function ee(e){let t=L.get(e.guild.id);return t?e.roles.cache.has(t.employeeRoleId):!1}function v(e){let t=L.get(e.guild.id);return t?e.roles.cache.has(t.managerRoleId):!1}var te=new a.SlashCommandBuilder().setName("requestcard").setDescription("Request a new card").setDefaultMemberPermissions("0");async function re(e){try{if(!ee(e.member)){await e.reply({content:`You need the "${m.EMPLOYEE}" role to request cards.`,ephemeral:!0});return}let t=new a.ModalBuilder().setCustomId("cardRequestModal").setTitle("Request a Card"),r=new a.TextInputBuilder().setCustomId("cardName").setLabel("Name").setStyle(a.TextInputStyle.Short).setPlaceholder("Type a card name...").setRequired(!0).setMaxLength(100),o=new a.TextInputBuilder().setCustomId("cardType").setLabel("Card Type (Type: Virtual or Physical)").setStyle(a.TextInputStyle.Short).setPlaceholder("Virtual or Physical").setRequired(!0),n=new a.TextInputBuilder().setCustomId("amount").setLabel("Amount").setStyle(a.TextInputStyle.Short).setPlaceholder("Type an amount").setRequired(!0),s=new a.TextInputBuilder().setCustomId("frequency").setLabel("Frequency (Daily/Monthly/Yearly/Total)").setStyle(a.TextInputStyle.Short).setPlaceholder("Daily, Monthly, Yearly, or Total").setRequired(!0),c=new a.TextInputBuilder().setCustomId("autoLock").setLabel("Until When?").setStyle(a.TextInputStyle.Short).setPlaceholder("MM/DD/YYYY").setRequired(!1);t.addComponents(new a.ActionRowBuilder().addComponents(r),new a.ActionRowBuilder().addComponents(o),new a.ActionRowBuilder().addComponents(n),new a.ActionRowBuilder().addComponents(s),new a.ActionRowBuilder().addComponents(c)),await e.showModal(t)}catch(t){console.error("Error creating card request:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}async function ae(e){if(e.customId==="cardRequestModal")try{let t=e.fields.getTextInputValue("cardName"),r=e.fields.getTextInputValue("cardType"),o=e.fields.getTextInputValue("amount"),n=e.fields.getTextInputValue("frequency"),s=e.fields.getTextInputValue("autoLock")||"Not specified";if(!x(r)){await e.reply({content:'Invalid card type. Please use "Virtual" or "Physical".',ephemeral:!0});return}if(!M(n)){await e.reply({content:"Invalid frequency. Please use Daily, Monthly, Yearly, or Total.",ephemeral:!0});return}if(s!=="Not specified"&&!b(s)){await e.reply({content:"Invalid date format. Please use MM/DD/YYYY.",ephemeral:!0});return}if(!e.guildId){await e.reply({content:"This command can only be used in a server.",ephemeral:!0});return}let c=await S(e.client,e.guildId);if(!c){await e.reply({content:"Error: Could not find or create the business alerts channel.",ephemeral:!0});return}let p={cardName:t,cardType:r,amount:o,frequency:n,autoLock:s};try{await e.user.send({content:`\u{1F389} You requested the following card:
  
> **Card Name**: ${t}
> **Card Type**: ${r}
> **Spend Limit**: $${o} ${n}
> **Auto Lock**: ${s}`})}catch(C){console.error("Could not send DM to user:",C)}let y=oe(e.user.username,p);await je(c,y),await e.deferUpdate()}catch(t){console.error("Error handling card request:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}function oe(e,t){return`${e} is requesting a new card.

> **Card Name**: ${t.cardName}
> **Card Type**: ${t.cardType}
> **Spend Limit**: $${t.amount}
> **Reset Frequency**: ${t.frequency}
> **Auto Lock**: ${t.autoLock}

`}async function je(e,t){let r=new a.ActionRowBuilder().addComponents(new a.ButtonBuilder().setCustomId("approve_card").setLabel("Approve Card").setStyle(a.ButtonStyle.Success),new a.ButtonBuilder().setCustomId("edit_card").setLabel("Edit").setStyle(a.ButtonStyle.Primary),new a.ButtonBuilder().setCustomId("deny_card").setLabel("Decline Request").setStyle(a.ButtonStyle.Danger));await e.send({content:t,components:[r]})}async function ne(e){if(["approve_card","deny_card","edit_card","cancel_edit","edit_and_approve"].includes(e.customId)){if(!v(e.member)){await e.reply({content:`You need the "${m.MANAGER}" role to manage requests.`,ephemeral:!0});return}try{let t=e.message;if(e.customId==="edit_card"){let R=t.content.split(`
`),Ae=R.find(f=>f.includes("Card Name"))?.split(":")[1]?.trim()||"",qe=R.find(f=>f.includes("Card Type"))?.split(":")[1]?.trim()||"",_e=R.find(f=>f.includes("Amount Limit"))?.split("$")[1]?.split(" ")[0]||"",Pe=R.find(f=>f.includes("Reset Frequency"))?.split(":")[1]?.trim()||"",Be=R.find(f=>f.includes("Auto-lock Date"))?.split(":")[1]?.trim()||"",N=new a.ModalBuilder().setCustomId("editCardModal").setTitle("Edit Card Request"),Ve=new a.TextInputBuilder().setCustomId("cardName").setLabel("Name").setStyle(a.TextInputStyle.Short).setValue(Ae).setRequired(!0),Ne=new a.TextInputBuilder().setCustomId("cardType").setLabel("Card Type (Virtual or Physical)").setStyle(a.TextInputStyle.Short).setValue(qe).setRequired(!0),$e=new a.TextInputBuilder().setCustomId("amount").setLabel("Amount").setStyle(a.TextInputStyle.Short).setValue(_e).setRequired(!0),Oe=new a.TextInputBuilder().setCustomId("frequency").setLabel("Frequency (Daily/Monthly/Yearly/Total)").setStyle(a.TextInputStyle.Short).setValue(Pe).setRequired(!0),Ge=new a.TextInputBuilder().setCustomId("autoLock").setLabel("Until When? (MM/DD/YYYY)").setStyle(a.TextInputStyle.Short).setValue(Be).setRequired(!1);N.addComponents(new a.ActionRowBuilder().addComponents(Ve),new a.ActionRowBuilder().addComponents(Ne),new a.ActionRowBuilder().addComponents($e),new a.ActionRowBuilder().addComponents(Oe),new a.ActionRowBuilder().addComponents(Ge)),await e.showModal(N);return}if(e.customId==="cancel_edit"){await t.edit({components:[new a.ActionRowBuilder().addComponents(new a.ButtonBuilder().setCustomId("approve_card").setLabel("Approve Card").setStyle(a.ButtonStyle.Success),new a.ButtonBuilder().setCustomId("edit_card").setLabel("Edit").setStyle(a.ButtonStyle.Primary),new a.ButtonBuilder().setCustomId("deny_card").setLabel("Decline Request").setStyle(a.ButtonStyle.Danger))]}),await e.reply({content:"Edit cancelled.",ephemeral:!0});return}let r=e.customId==="approve_card"?"approved":e.customId==="deny_card"?"declined":e.customId==="edit_and_approve"?"approved with edits":"",o=t.content.split(`
`)[0].split(" ")[0],n=await e.guild?.members.cache.find(u=>u.user.username===o),s=new Date,c=s.toLocaleDateString(),p=s.toLocaleTimeString(),y=t.content.split(`
`),C=y.find(u=>u.includes("Card Name"))?.split(":")[1]?.trim()||"",T=y.find(u=>u.includes("Card Type"))?.split(":")[1]?.trim()||"",xe=y.find(u=>u.includes("Spend Limit")||u.includes("Amount Limit"))?.split(":")[1]?.trim()||"",Me=y.find(u=>u.includes("Reset Frequency"))?.split(":")[1]?.trim()||"",be=y.find(u=>u.includes("Auto Lock")||u.includes("Auto-lock"))?.split(":")[1]?.trim()||"",V=`> **Card Name**: ${C}
> **Card Type**: ${T}
> **Amount Limit**: ${xe}
> **Reset Frequency**: ${Me}
> **Auto Lock**: ${be}`,Le=`${o}'s card was ${r}.

${V}

**${o}'s card request was ${r} by ${e.user.username} on ${c} at ${p}.**`;if(await t.edit({content:Le,components:[]}),n)try{await n.send({content:`\u{1F389} **Your card request has been ${r} by ${e.user.username} on ${c} at ${p}**.

${V}`})}catch(u){console.error("Could not DM requester:",u)}await e.reply({content:`You have ${r} this card request. The requester has been notified.`,ephemeral:!0})}catch(t){console.error("Error handling button interaction:",t),await e.reply({content:"There was an error processing your action.",ephemeral:!0})}}}async function se(e){if(e.customId==="editCardModal")try{let t=e.fields.getTextInputValue("cardName"),r=e.fields.getTextInputValue("cardType"),o=e.fields.getTextInputValue("amount"),n=e.fields.getTextInputValue("frequency"),s=e.fields.getTextInputValue("autoLock")||"Not specified";if(!x(r)){await e.reply({content:'Invalid card type. Please use "Virtual" or "Physical".',ephemeral:!0});return}if(!M(n)){await e.reply({content:"Invalid frequency. Please use Daily, Monthly, Yearly, or Total.",ephemeral:!0});return}if(s!=="Not specified"&&!b(s)){await e.reply({content:"Invalid date format. Please use MM/DD/YYYY.",ephemeral:!0});return}let c=e.message;if(!c)return;let p=c.content.split(`
`)[0].split(" ")[0],C=oe(p,{cardName:t,cardType:r,amount:o,frequency:n,autoLock:s}),T=new a.ActionRowBuilder().addComponents(new a.ButtonBuilder().setCustomId("edit_and_approve").setLabel("Edit and Approve").setStyle(a.ButtonStyle.Success),new a.ButtonBuilder().setCustomId("cancel_edit").setLabel("Cancel").setStyle(a.ButtonStyle.Secondary));await c.edit({content:C,components:[T]}),await e.reply({content:"Card request updated. You can now approve the edited request or cancel.",ephemeral:!0})}catch(t){console.error("Error handling edit modal submit:",t),await e.reply({content:"There was an error processing your edit. Please try again.",ephemeral:!0})}}var l=require("discord.js");var A=require("date-fns");var w=O(require("axios"));var q=null,_=null;async function Je(){try{let e={Accept:"application/json",Authorization:`Basic ${btoa(`${i.RAMP_CLIENT_ID}:${i.RAMP_CLIENT_SECRET}`)}`,"Content-Type":"application/x-www-form-urlencoded"},t=new URLSearchParams({grant_type:"client_credentials",scope:"users:write"}),r=await w.default.post("https://demo-api.ramp.com/developer/v1/token",t.toString(),{headers:e}),{access_token:o,expires_in:n}=r.data;return q=o,_=Date.now()+n*1e3,console.log("Ramp Access Token fetched successfully"),o}catch(e){throw w.default.isAxiosError(e)?console.error("Failed to fetch Ramp Access Token:",{status:e.response?.status,data:e.response?.data,message:e.message}):console.error("Failed to fetch Ramp Access Token:",e),e}}async function Qe(){return(!q||_&&Date.now()>=_)&&await Je(),q}var ie=w.default.create({baseURL:"https://demo-api.ramp.com/developer/v1/"});ie.interceptors.request.use(async e=>{let t=await Qe();return t&&(e.headers=w.AxiosHeaders.from(e.headers),e.headers.set("Authorization",`Bearer ${t}`)),e},e=>Promise.reject(e));var P=ie;async function le(e){try{let t=await P.get("/users",{params:{email:e}});if(!t.data?.data)return console.log("No user found with this specified email"),null;let o=t.data.data.find(n=>n.email.toLowerCase()===e.toLowerCase());return o?(console.log("Found user:",o),o):null}catch(t){throw console.error("Error fetching user:",{status:t.response?.status,message:t.response?.data?.error_v2,email:e}),t}}async function de(e,t,r,o){try{let n=await P.post("/users/deferred",{params:{email:e,first_name:t,last_name:r,role:o}});n.status===201?console.log("Async user invite created successfully"):console.error("Failed to create user invite. Response:",n.data)}catch(n){throw console.error("Error inviting user:",{status:n.response?.status,message:n.response?.data?.error_v2}),n}}var ce=O(require("nodemailer"));var I=new Map,Xe=ce.default.createTransport({service:"gmail",auth:{user:i.GMAIL_ADDRESS,pass:i.GMAIL_APP_PASSWORD}});async function ue(e,t){try{let r=Math.floor(1e5+Math.random()*9e5).toString();return I.set(e,{code:r,email:t,expires:new Date(Date.now()+15*60*1e3)}),await Xe.sendMail({from:i.GMAIL_ADDRESS,to:t,subject:"Verify Your Ramp Discord Integration",html:`
        <h2>Ramp Bot Verfication Code</h2>
        <p>Your verification code is: <strong>${r}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `}),!0}catch(r){return console.error("Error sending verification email:",r),!1}}function me(e,t){let r=I.get(e);return r?new Date>r.expires?(I.delete(e),{valid:!1,message:"Verification code has expired. Please request a new one."}):r.code!==t?{valid:!1,message:"Invalid verification code. Please try again."}:(I.delete(e),{valid:!0,email:r.email,message:"Code verified successfully!"}):{valid:!1,message:"No verification code found. Please request a new one."}}setInterval(()=>{let e=new Date;for(let[t,r]of I.entries())e>r.expires&&I.delete(t)},5*60*1e3);var fe=require("google-spreadsheet"),ye=require("google-auth-library");var pe=["discordId","email","verifiedAt"],Ze=new ye.JWT({email:i.GOOGLE_SERVICE_ACCOUNT_EMAIL,key:i.GOOGLE_PRIVATE_KEY.replace(/\\n/g,`
`),scopes:["https://www.googleapis.com/auth/spreadsheets"]}),B=new fe.GoogleSpreadsheet(i.GOOGLE_SHEETS_ID,Ze);async function et(){try{await B.loadInfo();let e=B.sheetsByIndex[0],t=await e.getRows({offset:0,limit:1});return(!t||t.length===0)&&(console.log("Setting up initial headers..."),await e.setHeaderRow(pe),console.log("Headers set successfully")),e}catch(e){if(e.message.includes("No values in the header row")){console.log("Setting up headers...");let t=B.sheetsByIndex[0];return await t.setHeaderRow(pe),console.log("Headers set successfully"),t}throw console.error("Error initializing sheet:",e),e}}async function he(e,t){try{let r=await et();if((await r.getRows()).find(s=>s.get("discordId")===e||s.get("email").toLowerCase()===t.toLowerCase()))throw console.log("User already verified:",{discordId:e,email:t}),new Error("User already verified");await r.addRow({discordId:e,email:t,verifiedAt:new Date().toISOString()}),console.log("User verified and added to sheet:",{discordId:e,email:t})}catch(r){throw console.error("Error adding verified user:",r),r}}var ge=new l.SlashCommandBuilder().setName("verify").setDescription("Verify your Ramp account");async function we(e){try{let t=new l.ModalBuilder().setCustomId("verifyEmailModal").setTitle("Verify Your Ramp Email"),r=new l.TextInputBuilder().setCustomId("email").setLabel("Enter your Ramp email address").setStyle(l.TextInputStyle.Short).setPlaceholder("user@company.com").setRequired(!0);t.addComponents(new l.ActionRowBuilder().addComponents(r)),await e.showModal(t)}catch(t){console.error("Error showing verify modal:",t),await e.reply({content:"There was an error starting verification. Please try again.",ephemeral:!0})}}async function Ie(e){try{let t=e.fields.getTextInputValue("email").toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)){await e.reply({content:"Please enter a valid email address.",ephemeral:!0});return}if(!await le(t)){await e.reply({content:"This email is not associated with any Ramp account. Please make sure you've been invited to Ramp first.",ephemeral:!0});return}if(!await ue(e.user.id,t)){await e.reply({content:"Failed to send verification email. Please try again later.",ephemeral:!0});return}let s=new l.ActionRowBuilder().addComponents(new l.ButtonBuilder().setCustomId("enterVerificationCode").setLabel("Enter Verification Code").setStyle(l.ButtonStyle.Primary));await e.reply({content:"A verification code has been sent to your email. Click the button below to enter it.",components:[s],ephemeral:!0})}catch(t){console.error("Error in email verification:",t),e.replied||await e.reply({content:"There was an error processing your verification. Please try again.",ephemeral:!0})}}async function Ce(e){let t=new l.ModalBuilder().setCustomId("verifyCodeModal").setTitle("Enter Verification Code"),r=new l.TextInputBuilder().setCustomId("code").setLabel("Enter the code sent to your email").setStyle(l.TextInputStyle.Short).setPlaceholder("Enter 6-digit code").setRequired(!0);t.addComponents(new l.ActionRowBuilder().addComponents(r)),await e.showModal(t)}async function Re(e){try{let t=e.fields.getTextInputValue("code"),r=me(e.user.id,t);if(!r.valid){await e.reply({content:r.message,ephemeral:!0});return}await e.deferReply({ephemeral:!0}),r.email&&await he(e.user.id,r.email);let o=e.member,n=e.guild?.roles.cache.find(s=>s.name===m.VERIFIED);if(!n)throw new Error("Verified role not found");await o.roles.add(n),await e.editReply({content:"\u2705 Your email has been verified! You now have access to Ramp commands."})}catch(t){console.error("Error in code verification:",t),!e.replied&&!e.deferred?await e.reply({content:"There was an error completing your verification. Please try again.",ephemeral:!0}):await e.editReply({content:"There was an error completing your verification. Please try again."})}}var E=require("discord.js");var d=require("discord.js");var Ee=(o=>(o.ADMIN="Admin",o.CARDHOLDER="Cardholder",o.BOOKKEEPER="Bookkeeper",o))(Ee||{}),Se=new d.SlashCommandBuilder().setName("invite").setDescription("Invite a new user to Ramp").setDefaultMemberPermissions("0");async function ve(e){try{if(!v(e.member)){await e.reply({content:`You need the "${m.MANAGER}" role to invite users.`,ephemeral:!0});return}let t=new d.ModalBuilder().setCustomId("inviteModal").setTitle("Invite User to Ramp"),r=new d.TextInputBuilder().setCustomId("email").setLabel("Email").setStyle(d.TextInputStyle.Short).setPlaceholder("user@company.com").setRequired(!0),o=new d.TextInputBuilder().setCustomId("firstName").setLabel("First Name").setStyle(d.TextInputStyle.Short).setPlaceholder("Enter first name").setRequired(!0),n=new d.TextInputBuilder().setCustomId("lastName").setLabel("Last Name").setStyle(d.TextInputStyle.Short).setPlaceholder("Enter last name").setRequired(!0),s=new d.TextInputBuilder().setCustomId("role").setLabel("Role (Admin/Cardholder/Bookkeeper)").setStyle(d.TextInputStyle.Short).setPlaceholder("Enter role").setRequired(!0);t.addComponents(new d.ActionRowBuilder().addComponents(r),new d.ActionRowBuilder().addComponents(o),new d.ActionRowBuilder().addComponents(n),new d.ActionRowBuilder().addComponents(s)),await e.showModal(t)}catch(t){console.error("Error creating invite modal:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}async function Te(e){if(e.customId==="inviteModal")try{let t=e.fields.getTextInputValue("email"),r=e.fields.getTextInputValue("firstName"),o=e.fields.getTextInputValue("lastName"),n=e.fields.getTextInputValue("role").toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)){await e.reply({content:"Please enter a valid email address.",ephemeral:!0});return}let c=Object.values(Ee).find(p=>p.toLowerCase()===n);if(!c){await e.reply({content:"Invalid role. Please use Admin, Cardholder, or Bookkeeper.",ephemeral:!0});return}try{await de(t,r,o,c),await e.reply({content:`\u2705 Invite sent successfully to ${r} ${o} (${t}) as ${c}.`,ephemeral:!0})}catch(p){console.error("Error sending invite:",p),await e.reply({content:"There was an error sending the invite. Please try again.",ephemeral:!0})}}catch(t){console.error("Error handling invite modal submit:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}async function De(){try{let e=new Map;[te,ge,Se].forEach(o=>{e.set(o.name,o)});let t=Array.from(e.values()).map(o=>o.toJSON());console.log("Commands to be deployed:",t.map(o=>o.name));let r=new E.REST().setToken(i.DISCORD_TOKEN);console.log("Started refreshing application (/) commands."),await r.put(E.Routes.applicationGuildCommands(i.DISCORD_ID,i.GUILD_ID),{body:[]}),await r.put(E.Routes.applicationGuildCommands(i.DISCORD_ID,i.GUILD_ID),{body:t}),console.log("Successfully reloaded application (/) commands.")}catch(e){throw console.error("Error deploying commands:",e),e}}var h=new g.Client({intents:[g.GatewayIntentBits.Guilds]}),tt=async e=>{try{e.isAutocomplete()||await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}catch(t){console.error("Error sending error message:",t)}};h.once(g.Events.ClientReady,async e=>{console.log(`Ready! Logged in as ${e.user.tag}`);let t=await h.guilds.fetch(i.GUILD_ID);if(!t){console.error("Could not find guild with ID:",i.GUILD_ID);return}await De(),await Z(t),await X(h,i.GUILD_ID),await S(h,i.GUILD_ID)});h.on("interactionCreate",async e=>{try{if(e.isModalSubmit())switch(e.customId){case"cardRequestModal":await ae(e);break;case"editCardModal":await se(e);break;case"verifyEmailModal":await Ie(e);break;case"verifyCodeModal":await Re(e);break;case"inviteModal":await Te(e);break}else if(e.isButton())switch(e.customId){case"enterVerificationCode":await Ce(e);break;case"approve_card":case"deny_card":case"edit_card":case"cancel_edit":case"edit_and_approve":await ne(e);break}else if(e.isChatInputCommand())switch(e.commandName){case"requestcard":await re(e);break;case"verify":await we(e);break;case"invite":await ve(e);break}}catch(t){console.error("Error handling interaction:",t),(e.isCommand()||e.isModalSubmit()||e.isButton())&&await tt(e)}});h.on(g.Events.Error,e=>{console.error("Discord client error:",e)});h.login(i.DISCORD_TOKEN);
