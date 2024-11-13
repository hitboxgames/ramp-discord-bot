"use strict";var Ze=Object.create;var W=Object.defineProperty;var et=Object.getOwnPropertyDescriptor;var tt=Object.getOwnPropertyNames;var rt=Object.getPrototypeOf,at=Object.prototype.hasOwnProperty;var ot=(e,t,r,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of tt(t))!at.call(e,n)&&n!==r&&W(e,n,{get:()=>t[n],enumerable:!(a=et(t,n))||a.enumerable});return e};var K=(e,t,r)=>(r=e!=null?Ze(rt(e)):{},ot(t||!e||!e.__esModule?W(r,"default",{value:e,enumerable:!0}):r,e));var R=require("discord.js");var j=require("dotenv");(0,j.config)();var{DISCORD_TOKEN:z,RAMP_CLIENT_ID:J,RAMP_CLIENT_SECRET:Q,GUILD_ID:X,DISCORD_ID:Z,GOOGLE_SERVICE_ACCOUNT_EMAIL:ee,GOOGLE_PRIVATE_KEY:te,GMAIL_ADDRESS:re,GMAIL_APP_PASSWORD:ae,GOOGLE_SHEETS_ID:oe}=process.env;if(!z||!J||!Q||!X||!Z||!ee||!te||!re||!ae||!oe)throw new Error("Missing environment variables");var l={DISCORD_TOKEN:z,DISCORD_ID:Z,RAMP_CLIENT_ID:J,RAMP_CLIENT_SECRET:Q,GUILD_ID:X,GOOGLE_SERVICE_ACCOUNT_EMAIL:ee,GOOGLE_PRIVATE_KEY:te,GMAIL_ADDRESS:re,GMAIL_APP_PASSWORD:ae,GOOGLE_SHEETS_ID:oe};var B=require("discord.js"),nt=null,st=null;async function ne(e,t,r){let a=await e.guilds.fetch(t),s=(await a.channels.fetch()).find(f=>f?.type===B.ChannelType.GuildText&&f.name===r);if(s)return console.log(`Found existing channel: ${s.name}`),s;let i=await a.channels.create({name:r,type:B.ChannelType.GuildText,reason:`${r} channel required by bot`});return console.log(`Created new channel: ${i.name}`),i}async function _(e,t){let r=await ne(e,t,"ramp-transactions");return nt=r.id,r}async function L(e,t){let r=await ne(e,t,"ramp-business-alerts");return st=r.id,r}var o=require("discord.js");function $(e){return["virtual","physical"].includes(e.toLowerCase())}function P(e){return["daily","monthly","yearly","total"].includes(e.toLowerCase())}function N(e){if(!/^\d{2}\/\d{2}\/\d{4}$/.test(e))return!1;let[r,a,n]=e.split("/").map(Number),s=new Date(n,r-1,a);return s.getMonth()===r-1&&s.getDate()===a&&s.getFullYear()===n}var V=new Map,y={EMPLOYEE:"Employee - Ramp",MANAGER:"Manager - Ramp",VERIFIED:"Verified - Ramp"};async function se(e){try{let t=await e.roles.fetch(),r=t.find(s=>s.name===y.EMPLOYEE),a=t.find(s=>s.name===y.MANAGER),n=t.find(s=>s.name===y.VERIFIED);return r||(console.log(`Creating ${y.EMPLOYEE} role in ${e.name}`),r=await e.roles.create({name:y.EMPLOYEE,color:"Blue",reason:"Required for Ramp bot card requests",permissions:[]})),a||(console.log(`Creating ${y.MANAGER} role in ${e.name}`),a=await e.roles.create({name:y.MANAGER,color:"Green",reason:"Required for Ramp bot card management",permissions:[]})),n||(console.log(`Creating ${y.VERIFIED} role in ${e.name}`),n=await e.roles.create({name:y.VERIFIED,color:"Purple",reason:"Required for verified Ramp users",permissions:[]})),V.set(e.id,{employeeRoleId:r.id,managerRoleId:a.id,verifiedRoleId:n.id}),{employee:r,manager:a,verified:n}}catch(t){throw console.error(`Error setting up roles in guild ${e.name}:`,t),t}}function ie(e){let t=V.get(e.guild.id);return t?e.roles.cache.has(t.employeeRoleId):!1}function C(e){let t=V.get(e.guild.id);return t?e.roles.cache.has(t.managerRoleId):!1}var le=new o.SlashCommandBuilder().setName("requestcard").setDescription("Request a new card").setDefaultMemberPermissions("0");async function de(e){try{if(!ie(e.member)){await e.reply({content:`You need the "${y.EMPLOYEE}" role to request cards.`,ephemeral:!0});return}let t=new o.ModalBuilder().setCustomId("cardRequestModal").setTitle("Request a Card"),r=new o.TextInputBuilder().setCustomId("cardName").setLabel("Name").setStyle(o.TextInputStyle.Short).setPlaceholder("Type a card name...").setRequired(!0).setMaxLength(100),a=new o.TextInputBuilder().setCustomId("cardType").setLabel("Card Type (Type: Virtual or Physical)").setStyle(o.TextInputStyle.Short).setPlaceholder("Virtual or Physical").setRequired(!0),n=new o.TextInputBuilder().setCustomId("amount").setLabel("Amount").setStyle(o.TextInputStyle.Short).setPlaceholder("Type an amount").setRequired(!0),s=new o.TextInputBuilder().setCustomId("frequency").setLabel("Frequency (Daily/Monthly/Yearly/Total)").setStyle(o.TextInputStyle.Short).setPlaceholder("Daily, Monthly, Yearly, or Total").setRequired(!0),i=new o.TextInputBuilder().setCustomId("autoLock").setLabel("Until When?").setStyle(o.TextInputStyle.Short).setPlaceholder("MM/DD/YYYY").setRequired(!1);t.addComponents(new o.ActionRowBuilder().addComponents(r),new o.ActionRowBuilder().addComponents(a),new o.ActionRowBuilder().addComponents(n),new o.ActionRowBuilder().addComponents(s),new o.ActionRowBuilder().addComponents(i)),await e.showModal(t)}catch(t){console.error("Error creating card request:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}async function ce(e){if(e.customId==="cardRequestModal")try{let t=e.fields.getTextInputValue("cardName"),r=e.fields.getTextInputValue("cardType"),a=e.fields.getTextInputValue("amount"),n=e.fields.getTextInputValue("frequency"),s=e.fields.getTextInputValue("autoLock")||"Not specified";if(!$(r)){await e.reply({content:'Invalid card type. Please use "Virtual" or "Physical".',ephemeral:!0});return}if(!P(n)){await e.reply({content:"Invalid frequency. Please use Daily, Monthly, Yearly, or Total.",ephemeral:!0});return}if(s!=="Not specified"&&!N(s)){await e.reply({content:"Invalid date format. Please use MM/DD/YYYY.",ephemeral:!0});return}if(!e.guildId){await e.reply({content:"This command can only be used in a server.",ephemeral:!0});return}let i=await L(e.client,e.guildId);if(!i){await e.reply({content:"Error: Could not find or create the business alerts channel.",ephemeral:!0});return}let f={cardName:t,cardType:r,amount:a,frequency:n,autoLock:s};try{await e.user.send({content:`\u{1F389} You requested the following card:
  
> **Card Name**: ${t}
> **Card Type**: ${r}
> **Spend Limit**: $${a} ${n}
> **Auto Lock**: ${s}`})}catch(d){console.error("Could not send DM to user:",d)}let g=ue(e.user.username,f);await it(i,g),await e.deferUpdate()}catch(t){console.error("Error handling card request:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}function ue(e,t){return`${e} is requesting a new card.

> **Card Name**: ${t.cardName}
> **Card Type**: ${t.cardType}
> **Spend Limit**: $${t.amount}
> **Reset Frequency**: ${t.frequency}
> **Auto Lock**: ${t.autoLock}

`}async function it(e,t){let r=new o.ActionRowBuilder().addComponents(new o.ButtonBuilder().setCustomId("approve_card").setLabel("Approve Card").setStyle(o.ButtonStyle.Success),new o.ButtonBuilder().setCustomId("edit_card").setLabel("Edit").setStyle(o.ButtonStyle.Primary),new o.ButtonBuilder().setCustomId("deny_card").setLabel("Decline Request").setStyle(o.ButtonStyle.Danger));await e.send({content:t,components:[r]})}async function me(e){if(["approve_card","deny_card","edit_card","cancel_edit","edit_and_approve"].includes(e.customId)){if(!C(e.member)){await e.reply({content:`You need the "${y.MANAGER}" role to manage requests.`,ephemeral:!0});return}try{let t=e.message;if(e.customId==="edit_card"){let T=t.content.split(`
`),Ue=T.find(w=>w.includes("Card Name"))?.split(":")[1]?.trim()||"",Fe=T.find(w=>w.includes("Card Type"))?.split(":")[1]?.trim()||"",He=T.find(w=>w.includes("Amount Limit"))?.split("$")[1]?.split(" ")[0]||"",We=T.find(w=>w.includes("Reset Frequency"))?.split(":")[1]?.trim()||"",Ke=T.find(w=>w.includes("Auto-lock Date"))?.split(":")[1]?.trim()||"",H=new o.ModalBuilder().setCustomId("editCardModal").setTitle("Edit Card Request"),je=new o.TextInputBuilder().setCustomId("cardName").setLabel("Name").setStyle(o.TextInputStyle.Short).setValue(Ue).setRequired(!0),ze=new o.TextInputBuilder().setCustomId("cardType").setLabel("Card Type (Virtual or Physical)").setStyle(o.TextInputStyle.Short).setValue(Fe).setRequired(!0),Je=new o.TextInputBuilder().setCustomId("amount").setLabel("Amount").setStyle(o.TextInputStyle.Short).setValue(He).setRequired(!0),Qe=new o.TextInputBuilder().setCustomId("frequency").setLabel("Frequency (Daily/Monthly/Yearly/Total)").setStyle(o.TextInputStyle.Short).setValue(We).setRequired(!0),Xe=new o.TextInputBuilder().setCustomId("autoLock").setLabel("Until When? (MM/DD/YYYY)").setStyle(o.TextInputStyle.Short).setValue(Ke).setRequired(!1);H.addComponents(new o.ActionRowBuilder().addComponents(je),new o.ActionRowBuilder().addComponents(ze),new o.ActionRowBuilder().addComponents(Je),new o.ActionRowBuilder().addComponents(Qe),new o.ActionRowBuilder().addComponents(Xe)),await e.showModal(H);return}if(e.customId==="cancel_edit"){await t.edit({components:[new o.ActionRowBuilder().addComponents(new o.ButtonBuilder().setCustomId("approve_card").setLabel("Approve Card").setStyle(o.ButtonStyle.Success),new o.ButtonBuilder().setCustomId("edit_card").setLabel("Edit").setStyle(o.ButtonStyle.Primary),new o.ButtonBuilder().setCustomId("deny_card").setLabel("Decline Request").setStyle(o.ButtonStyle.Danger))]}),await e.reply({content:"Edit cancelled.",ephemeral:!0});return}let r=e.customId==="approve_card"?"approved":e.customId==="deny_card"?"declined":e.customId==="edit_and_approve"?"approved with edits":"",a=t.content.split(`
`)[0].split(" ")[0],n=await e.guild?.members.cache.find(p=>p.user.username===a),s=new Date,i=s.toLocaleDateString(),f=s.toLocaleTimeString(),g=t.content.split(`
`),d=g.find(p=>p.includes("Card Name"))?.split(":")[1]?.trim()||"",c=g.find(p=>p.includes("Card Type"))?.split(":")[1]?.trim()||"",x=g.find(p=>p.includes("Spend Limit")||p.includes("Amount Limit"))?.split(":")[1]?.trim()||"",v=g.find(p=>p.includes("Reset Frequency"))?.split(":")[1]?.trim()||"",D=g.find(p=>p.includes("Auto Lock")||p.includes("Auto-lock"))?.split(":")[1]?.trim()||"",M=`> **Card Name**: ${d}
> **Card Type**: ${c}
> **Amount Limit**: ${x}
> **Reset Frequency**: ${v}
> **Auto Lock**: ${D}`,q=`${a}'s card was ${r}.

${M}

**${a}'s card request was ${r} by ${e.user.username} on ${i} at ${f}.**`;if(await t.edit({content:q,components:[]}),n)try{await n.send({content:`\u{1F389} **Your card request has been ${r} by ${e.user.username} on ${i} at ${f}**.

${M}`})}catch(p){console.error("Could not DM requester:",p)}await e.reply({content:`You have ${r} this card request. The requester has been notified.`,ephemeral:!0})}catch(t){console.error("Error handling button interaction:",t),await e.reply({content:"There was an error processing your action.",ephemeral:!0})}}}async function pe(e){if(e.customId==="editCardModal")try{let t=e.fields.getTextInputValue("cardName"),r=e.fields.getTextInputValue("cardType"),a=e.fields.getTextInputValue("amount"),n=e.fields.getTextInputValue("frequency"),s=e.fields.getTextInputValue("autoLock")||"Not specified";if(!$(r)){await e.reply({content:'Invalid card type. Please use "Virtual" or "Physical".',ephemeral:!0});return}if(!P(n)){await e.reply({content:"Invalid frequency. Please use Daily, Monthly, Yearly, or Total.",ephemeral:!0});return}if(s!=="Not specified"&&!N(s)){await e.reply({content:"Invalid date format. Please use MM/DD/YYYY.",ephemeral:!0});return}let i=e.message;if(!i)return;let f=i.content.split(`
`)[0].split(" ")[0],d=ue(f,{cardName:t,cardType:r,amount:a,frequency:n,autoLock:s}),c=new o.ActionRowBuilder().addComponents(new o.ButtonBuilder().setCustomId("edit_and_approve").setLabel("Edit and Approve").setStyle(o.ButtonStyle.Success),new o.ButtonBuilder().setCustomId("cancel_edit").setLabel("Cancel").setStyle(o.ButtonStyle.Secondary));await i.edit({content:d,components:[c]}),await e.reply({content:"Card request updated. You can now approve the edited request or cancel.",ephemeral:!0})}catch(t){console.error("Error handling edit modal submit:",t),await e.reply({content:"There was an error processing your edit. Please try again.",ephemeral:!0})}}var u=require("discord.js");var ye=require("uuid");var S=K(require("axios"));var k=null,O=null;async function lt(){try{let e={Accept:"application/json",Authorization:`Basic ${btoa(`${l.RAMP_CLIENT_ID}:${l.RAMP_CLIENT_SECRET}`)}`,"Content-Type":"application/x-www-form-urlencoded"},t=new URLSearchParams({grant_type:"client_credentials",scope:"users:read users:write transactions:read"}),r=await S.default.post("https://demo-api.ramp.com/developer/v1/token",t.toString(),{headers:e}),{access_token:a,expires_in:n}=r.data;return k=a,O=Date.now()+n*1e3,console.log("Ramp Access Token fetched successfully"),a}catch(e){throw S.default.isAxiosError(e)?console.error("Failed to fetch Ramp Access Token:",{status:e.response?.status,data:e.response?.data,message:e.message}):console.error("Failed to fetch Ramp Access Token:",e),e}}async function dt(){return(!k||O&&Date.now()>=O)&&await lt(),k}var fe=S.default.create({baseURL:"https://demo-api.ramp.com/developer/v1/"});fe.interceptors.request.use(async e=>{let t=await dt();return t&&(e.headers=S.AxiosHeaders.from(e.headers),e.headers.set("Authorization",`Bearer ${t}`)),e},e=>Promise.reject(e));var A=fe;async function he(e,t){try{let r=await A.get("/transactions",{params:{from_date:e,to_date:t,order_by_date_desc:!0}});return r.data?.data?(console.log(`Found ${r.data.data.length} transactions`),r.data.data):(console.log("No transactions found for the specified date range"),[])}catch(r){throw console.error("Error fetching transactions:",r),r}}async function G(e){try{let t=await A.get("/users",{params:{email:e}});if(!t.data?.data)return console.log("No user found with this specified email"),null;let a=t.data.data.find(n=>n.email.toLowerCase()===e.toLowerCase());return a?(console.log("Found user:",a),a):null}catch(t){throw console.error("Error fetching user:",{status:t.response?.status,message:t.response?.data?.error_v2,email:e}),t}}async function ge(e,t,r,a){try{let n=(0,ye.v4)(),s={email:e,first_name:t,last_name:r,role:a,idempotency_key:n},i=await A.post("/users/deferred",s);console.log(i),i.status===201?console.log("Async user invite created successfully"):console.error("Failed to create user invite. Response:",i.data)}catch(n){throw console.error("Error inviting user:",{status:n.response?.status,message:n.response?.data?.error_v2}),n}}var we=K(require("nodemailer"));var E=new Map,ct=we.default.createTransport({service:"gmail",auth:{user:l.GMAIL_ADDRESS,pass:l.GMAIL_APP_PASSWORD}});async function Ie(e,t){try{let r=Math.floor(1e5+Math.random()*9e5).toString();return E.set(e,{code:r,email:t,expires:new Date(Date.now()+15*60*1e3)}),await ct.sendMail({from:l.GMAIL_ADDRESS,to:t,subject:"Verify Your Ramp Discord Integration",html:`
        <h2>Ramp Bot Verfication Code</h2>
        <p>Your verification code is: <strong>${r}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `}),!0}catch(r){return console.error("Error sending verification email:",r),!1}}function Re(e,t){let r=E.get(e);return r?new Date>r.expires?(E.delete(e),{valid:!1,message:"Verification code has expired. Please request a new one."}):r.code!==t?{valid:!1,message:"Invalid verification code. Please try again."}:(E.delete(e),{valid:!0,email:r.email,message:"Code verified successfully!"}):{valid:!1,message:"No verification code found. Please request a new one."}}setInterval(()=>{let e=new Date;for(let[t,r]of E.entries())e>r.expires&&E.delete(t)},5*60*1e3);var Se=require("google-spreadsheet"),Ee=require("google-auth-library");var Ce=["discordId","rampId","rampRole","email","verifiedAt"],ut=new Ee.JWT({email:l.GOOGLE_SERVICE_ACCOUNT_EMAIL,key:l.GOOGLE_PRIVATE_KEY.replace(/\\n/g,`
`),scopes:["https://www.googleapis.com/auth/spreadsheets"]}),Y=new Se.GoogleSpreadsheet(l.GOOGLE_SHEETS_ID,ut);async function mt(){try{await Y.loadInfo();let e=Y.sheetsByIndex[0],t=await e.getRows({offset:0,limit:1});return(!t||t.length===0)&&(console.log("Setting up initial headers..."),await e.setHeaderRow(Ce),console.log("Headers set successfully")),e}catch(e){if(e.message.includes("No values in the header row")){console.log("Setting up headers...");let t=Y.sheetsByIndex[0];return await t.setHeaderRow(Ce),console.log("Headers set successfully"),t}throw console.error("Error initializing sheet:",e),e}}async function ve(e,t,r,a){try{let n=await mt();if((await n.getRows()).find(f=>f.get("discordId")===e||f.get("email").toLowerCase()===t.toLowerCase()))throw console.log("User already verified:",{discordId:e,email:t}),new Error("User already verified");await n.addRow({discordId:e,rampId:r,rampRole:a,email:t,verifiedAt:new Date().toISOString()}),console.log("User verified and added to sheet:",{discordId:e,email:t,rampId:r})}catch(n){throw console.error("Error adding verified user:",n),n}}var Te=new u.SlashCommandBuilder().setName("verify").setDescription("Verify your Ramp account");async function be(e){try{let t=new u.ModalBuilder().setCustomId("verifyEmailModal").setTitle("Verify Your Ramp Email"),r=new u.TextInputBuilder().setCustomId("email").setLabel("Enter your Ramp email address").setStyle(u.TextInputStyle.Short).setPlaceholder("user@company.com").setRequired(!0);t.addComponents(new u.ActionRowBuilder().addComponents(r)),await e.showModal(t)}catch(t){console.error("Error showing verify modal:",t),await e.reply({content:"There was an error starting verification. Please try again.",ephemeral:!0})}}async function xe(e){try{let t=e.fields.getTextInputValue("email").toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)){await e.reply({content:"Please enter a valid email address.",ephemeral:!0});return}if(!await G(t)){await e.reply({content:"This email is not associated with any Ramp account. Please make sure you've been invited to Ramp first.",ephemeral:!0});return}if(!await Ie(e.user.id,t)){await e.reply({content:"Failed to send verification email. Please try again later.",ephemeral:!0});return}let s=new u.ActionRowBuilder().addComponents(new u.ButtonBuilder().setCustomId("enterVerificationCode").setLabel("Enter Verification Code").setStyle(u.ButtonStyle.Primary));await e.reply({content:"A verification code has been sent to your email. Click the button below to enter it.",components:[s],ephemeral:!0})}catch(t){console.error("Error in email verification:",t),e.replied||await e.reply({content:"There was an error processing your verification. Please try again.",ephemeral:!0})}}async function De(e){let t=new u.ModalBuilder().setCustomId("verifyCodeModal").setTitle("Enter Verification Code"),r=new u.TextInputBuilder().setCustomId("code").setLabel("Enter the code sent to your email").setStyle(u.TextInputStyle.Short).setPlaceholder("Enter 6-digit code").setRequired(!0);t.addComponents(new u.ActionRowBuilder().addComponents(r)),await e.showModal(t)}async function Me(e){try{let t=e.fields.getTextInputValue("code"),r=Re(e.user.id,t);if(!r.email)throw Error;if(!r.valid){await e.reply({content:r.message,ephemeral:!0});return}await e.deferReply({ephemeral:!0});let a=await G(r.email);if(!a||!a.id||!a.role)throw new Error("Ramp user or user ID not found during verification.");await ve(e.user.id,r.email,a.id,a.role);let n=e.member,s=e.guild?.roles.cache.find(i=>i.name===y.VERIFIED);if(!s)throw new Error("Verified role not found");await n.roles.add(s),await e.editReply({content:"\u2705 Your email has been verified! You now have access to Ramp commands."})}catch(t){console.error("Error in code verification:",t),!e.replied&&!e.deferred?await e.reply({content:"There was an error completing your verification. Please try again.",ephemeral:!0}):await e.editReply({content:"There was an error completing your verification. Please try again."})}}var b=require("discord.js");var m=require("discord.js");var _e={USER:"BUSINESS_USER"};var Le=new m.SlashCommandBuilder().setName("invite").setDescription("Invite a new user to Ramp").setDefaultMemberPermissions("0");async function Ae(e){try{if(!C(e.member)){await e.reply({content:`You need the "${y.MANAGER}" role to invite users.`,ephemeral:!0});return}let t=new m.ModalBuilder().setCustomId("inviteModal").setTitle("Invite User to Ramp"),r=new m.TextInputBuilder().setCustomId("email").setLabel("Email").setStyle(m.TextInputStyle.Short).setPlaceholder("user@company.com").setRequired(!0),a=new m.TextInputBuilder().setCustomId("firstName").setLabel("First Name").setStyle(m.TextInputStyle.Short).setPlaceholder("Enter first name").setRequired(!0),n=new m.TextInputBuilder().setCustomId("lastName").setLabel("Last Name").setStyle(m.TextInputStyle.Short).setPlaceholder("Enter last name").setRequired(!0),s=new m.TextInputBuilder().setCustomId("role").setLabel("Role (ADMIN, USER, BOOKKEEPER)").setStyle(m.TextInputStyle.Short).setPlaceholder("Enter role").setRequired(!0);t.addComponents(new m.ActionRowBuilder().addComponents(r),new m.ActionRowBuilder().addComponents(a),new m.ActionRowBuilder().addComponents(n),new m.ActionRowBuilder().addComponents(s)),await e.showModal(t)}catch(t){console.error("Error creating invite modal:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}async function qe(e){if(e.customId==="inviteModal")try{let t=e.fields.getTextInputValue("email"),r=e.fields.getTextInputValue("firstName"),a=e.fields.getTextInputValue("lastName"),n=e.fields.getTextInputValue("role").toUpperCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)){await e.reply({content:"Please enter a valid email address.",ephemeral:!0});return}let i=_e[n];if(!i){await e.reply({content:"Invalid role. Please use User role.",ephemeral:!0});return}try{await ge(t,r,a,i),await e.reply({content:`\u2705 Invite sent successfully to ${r} ${a} (${t}) as ${i}. 
        Please let them know once they accept, to do /verify on discord to connect their Ramp account.`,ephemeral:!0})}catch(f){console.error("Error sending invite:",f),await e.reply({content:"There was an error sending the invite. Please try again.",ephemeral:!0})}}catch(t){console.error("Error handling invite modal submit:",t),await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}}var ke=require("discord.js");var h=require("date-fns");function Be(){let e=(0,h.startOfDay)(new Date),t=(0,h.endOfDay)(new Date);return{fromDate:e.toISOString(),toDate:t.toISOString()}}function $e(){let e=(0,h.subDays)(new Date,1),t=(0,h.startOfDay)(e),r=(0,h.endOfDay)(e);return{fromDate:t.toISOString(),toDate:r.toISOString()}}function Pe(){let e=(0,h.startOfDay)((0,h.subDays)(new Date,7)),t=(0,h.endOfDay)(new Date);return{fromDate:e.toISOString(),toDate:t.toISOString()}}function Ne(){let e=(0,h.startOfDay)((0,h.subDays)(new Date,30)),t=(0,h.endOfDay)(new Date);return{fromDate:e.toISOString(),toDate:t.toISOString()}}var F=require("discord.js");async function Ve(e,t,r){if(!t?.length){await e.send("No transactions found for the specified period.");return}let a=t.reduce((d,c)=>d+c.amount,0),n={},s={};t.forEach(d=>{let{card_holder:c,amount:x,sk_category_name:v}=d;if(c&&c.user_id){let{user_id:D,first_name:M,last_name:q}=c,p=`${M} ${q}`;n[D]={name:p,amount:(n[D]?.amount||0)+x}}v&&(s[v]=(s[v]||0)+x)});let i=Object.values(n).sort((d,c)=>c.amount-d.amount).slice(0,3),f=Object.entries(s).sort((d,c)=>c[1]-d[1]).slice(0,3).map(([d,c])=>({categoryName:d,amount:c})),g=`
    ${r}
    > **Total Amount Spent:** ${U(a)}
    > **Top Spenders:**
    ${i.map((d,c)=>`> ${c+1}. ${d.name}: ${U(d.amount)}`).join(`
`)}
    > **Top Categories:**
    ${f.map((d,c)=>`> ${c+1}. ${d.categoryName}: ${U(d.amount)}`).join(`
`)}
    `;await e.send(g)}function U(e){if(e==null)return"N/A";try{return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e)}catch{return`$${e}`}}var Oe=new ke.SlashCommandBuilder().setName("report").setDescription("Generate a report for transactions").addStringOption(e=>e.setName("period").setDescription("Select the time period for the report").setRequired(!0).addChoices({name:"Today",value:"today"},{name:"Yesterday",value:"yesterday"},{name:"Last Week",value:"lastWeek"},{name:"Last Month",value:"lastMonth"}));async function Ge(e){try{if(!C(e.member)){await e.reply({content:"You must have the manager role to use this command.",ephemeral:!0});return}await e.deferReply({ephemeral:!0});let t=e.options.getString("period");if(!t){await e.editReply("Please select a valid time period.");return}let r,a;switch(t){case"today":r=Be(),a="Your daily business spending report is available!";break;case"yesterday":r=$e(),a="Yesterday's business spending report is available!";break;case"lastWeek":r=Pe(),a="Your weekly business spending report is available!";break;case"lastMonth":r=Ne(),a="Your monthly business spending report is available!";break;default:await e.editReply("Invalid time period selected.");return}let n=await he(r.fromDate,r.toDate),s=await _(e.client,e.guildId);if(!s){await e.editReply("Failed to access the transactions channel. Please try again later.");return}await Ve(s,n,a),await e.editReply(`${a} has been generated and sent to the transactions channel.`)}catch(t){console.error("Error generating report:",t),await e.editReply("An error occurred while generating the report. Please try again later.")}}async function Ye(){try{let e=new Map;[le,Te,Le,Oe].forEach(a=>{e.set(a.name,a)});let t=Array.from(e.values()).map(a=>a.toJSON());console.log("Commands to be deployed:",t.map(a=>a.name));let r=new b.REST().setToken(l.DISCORD_TOKEN);console.log("Started refreshing application (/) commands."),await r.put(b.Routes.applicationGuildCommands(l.DISCORD_ID,l.GUILD_ID),{body:[]}),await r.put(b.Routes.applicationGuildCommands(l.DISCORD_ID,l.GUILD_ID),{body:t}),console.log("Successfully reloaded application (/) commands.")}catch(e){throw console.error("Error deploying commands:",e),e}}var I=new R.Client({intents:[R.GatewayIntentBits.Guilds]}),pt=async e=>{try{e.isAutocomplete()||await e.reply({content:"There was an error processing your request. Please try again.",ephemeral:!0})}catch(t){console.error("Error sending error message:",t)}};I.once(R.Events.ClientReady,async e=>{console.log(`Ready! Logged in as ${e.user.tag}`);let t=await I.guilds.fetch(l.GUILD_ID);if(!t){console.error("Could not find guild with ID:",l.GUILD_ID);return}await Ye(),await se(t),await _(I,l.GUILD_ID),await L(I,l.GUILD_ID)});I.on("interactionCreate",async e=>{try{if(e.isModalSubmit())switch(e.customId){case"cardRequestModal":await ce(e);break;case"editCardModal":await pe(e);break;case"verifyEmailModal":await xe(e);break;case"verifyCodeModal":await Me(e);break;case"inviteModal":await qe(e);break}else if(e.isButton())switch(e.customId){case"enterVerificationCode":await De(e);break;case"approve_card":case"deny_card":case"edit_card":case"cancel_edit":case"edit_and_approve":await me(e);break}else if(e.isChatInputCommand())switch(e.commandName){case"requestcard":await de(e);break;case"verify":await be(e);break;case"invite":await Ae(e);break;case"report":await Ge(e);break}}catch(t){console.error("Error handling interaction:",t),(e.isCommand()||e.isModalSubmit()||e.isButton())&&await pt(e)}});I.on(R.Events.Error,e=>{console.error("Discord client error:",e)});I.login(l.DISCORD_TOKEN);
