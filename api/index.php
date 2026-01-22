<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Random Naija API Vibes — 500x (Responsive)</title>
	<style id="base">
		:root{
			/* Fluid scale */
			--space: clamp(10px, 2.5vw, 24px);
			--radius: clamp(10px, 2.2vw, 22px);
			--code-radius: clamp(8px, 2vw, 14px);

			--bg:#0b0b0c;
			--fg:#ffdb15;
			--card:rgba(255,255,255,.06);
			--muted:#cfcfcf;
			--accent:#ff4757;
			--ring:rgba(255,255,255,.3);
		}
		*{box-sizing:border-box}
		html,body{height:100%}
		body{
			margin:0;
			background:var(--bg);
			color:var(--fg);
			font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji;
			transition:background .6s ease,color .6s ease;
			line-height:1.4;
		}
		img,svg,canvas,video{max-width:100%;height:auto}
		code,pre{
			font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace
		}
		pre{
			overflow:auto;
			white-space:pre-wrap;
			word-break:break-word;
			background:#00000033;
			border:1px solid var(--ring);
			border-radius:var(--code-radius);
			padding:calc(var(--space) * 0.8);
		}
		.container{
			max-width:min(1100px, 92vw);
			margin:clamp(20px, 6vh, 48px) auto;
			padding:0 var(--space);
		}
		/* Toast */
		.toast{
			position:fixed;left:50%;transform:translateX(-50%);bottom:clamp(10px,3vh,24px);
			background:var(--fg);color:var(--bg);
			font-weight:700;
			padding:clamp(10px,2.2vw,14px) clamp(14px,3vw,22px);
			border-radius:clamp(10px, 2vw, 14px);
			box-shadow:0 10px 30px var(--ring);opacity:.98;transition:opacity .8s ease,transform .5s ease;z-index:1000
		}
		.toast.hide{opacity:0;transform:translateX(-50%) translateY(8px)}
		.sfx{display:none}

		@keyframes glowPulse{0%{text-shadow:0 0 8px var(--fg)}50%{text-shadow:0 0 26px var(--fg),0 0 42px var(--fg)}100%{text-shadow:0 0 8px var(--fg)}}
		@keyframes wakaShake{0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-4px) rotate(.2deg)}40%{transform:translateX(4px) rotate(-.2deg)}60%{transform:translateX(-3px) rotate(.15deg)}80%{transform:translateX(3px) rotate(-.15deg)}}

		/* Reduce motion accessibility */
		@media (prefers-reduced-motion: reduce){
			*{animation:none !important;transition:none !important}
		}

		/* Layout helpers each view can reuse */
		.block{display:grid;grid-template-columns:1fr;gap:var(--space)}
		.row{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--space) * 0.8)}
		.card{
			backdrop-filter:blur(10px);
			background:var(--card);
			border:1px solid var(--ring);
			border-radius:var(--radius);
			box-shadow:0 20px 70px var(--ring);
			padding:var(--space);
		}
		.badge{
			display:inline-block;
			background:linear-gradient(90deg, var(--fg), var(--accent));
			color:#000;
			padding:6px 12px;
			border-radius:999px;
			font-weight:800;
			font-size:clamp(12px, 1.9vw, 14px);
		}
		.h{
			font-weight:900;
			letter-spacing:.4px;
			font-size:clamp(24px, 5.2vw, 54px);
			line-height:1.06;
			margin:0 0 calc(var(--space) * 0.4);
			text-wrap:balance;
		}
		.sub{color:var(--muted);margin:4px 0 calc(var(--space) * 0.7);font-size:clamp(13px, 2.6vw, 16px)}
		.footer{opacity:.85;color:var(--muted);margin-top:calc(var(--space) * .7);font-size:clamp(12px, 2.3vw, 14px)}

		/* Responsive grids collapse */
		@media (max-width: 900px){
			.row{grid-template-columns:1fr}
		}

		/* Terminal/Newspaper/Poster minor tweaks for tiny screens */
		@media (max-width: 520px){
			.badge{padding:4px 10px}
			pre{max-height:42vh}
		}
	</style>
</head>
<body>
	<div id="app"></div>
	<audio class="sfx" id="sfx"><source id="sfxsrc" src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_7d8a621d2f.mp3?filename=crowd-cheer-6713.mp3" type="audio/mpeg"></audio>

	<script>
		/* ===== helpers ===== */
		const pick = a => a[Math.floor(Math.random()*a.length)]
		const r = (min,max) => Math.floor(Math.random()*(max-min+1))+min
		const rh = () => r(0,359)

		function uniqueList(generator,count){
			const set=new Set(), out=[]
			let guard=0
			while(out.length<count && guard<count*50){
				guard++
				const v=generator(out.length)
				if(!set.has(v)){ set.add(v); out.push(v) }
			}
			return out
		}

		/* ===== palettes (500) ===== */
		function palFromHue(h){
			const s=r(70,97), l=r(48,62)
			return {
				bg:`hsl(${h} 12% ${r(6,10)}%)`,
				fg:`hsl(${h} ${s}% ${l}%)`,
				acc:`hsl(${(h+180)%360} ${r(70,95)}% ${r(52,70)}%)`,
				muted:`hsl(${h} 18% 82%)`,
				card:`hsla(${h} ${s}% ${l}% /.08)`,
				ring:`hsla(${h} 90% 60% /.35)`
			}
		}
		function buildPalettes500(){
			const out=[]
			for(let i=0;i<500;i++){
				const h=Math.round((360/500)*i)
				out.push(palFromHue(h))
			}
			return out
		}

		/* ===== text banks ===== */
		const titleLeft=['API','Endpoint','Server','Gateway','Service','Router','Balancer','Cluster','Daemon','Worker','Pod','Node','Kernel','Proxy','Registry','Scheduler','Runner','Broker','Stream','Webhook']
		const titleVerb=['Don','Just','Already','Finally','Suddenly','Now','Sharp Sharp','Abeg','Kpai','Proper']
		const titleMid=['Land','Show','Enter','Arrive','Touch Down','Turn Up','Spark','Wake','Loud','Blow','Assemble','Charge','Boot','Sync','Ping']
		const titleTail=['With Vibes','Gidigba','On Stage','Inside Arena','For Area','For Studio','Full Ground','Well','For Front','With Cruise','No Cap','On Code','Live and Direct','With Swagger','For Production']
		const titleExtras=['Wear Agbada','Carry Ring Light','Dey Live','Balance For Chair','Scatter Stage','Fire Up','Burst Speakers','Cruise Control','Wear Pilot Cap','Enter Red Carpet','Bring Jollof','Spray Awoof','Carry Trophy','Hold Mic','Drop Mic']

		const endpointBase=['gbasgbos','wahala','laugh','softwork','abeg','oyinbo','faji','snap','jara','choplife','gbedu','ajasa','kpako','kele','sakpa','smile','vibes','cruise','omo','ginger','sabi','tori','agbado','suya','zobo','palmwine','pako','jollof','akara','agbada','ajebo','okada','danfo','pidgin','raba','owo','tomato','pepper','bread','ewa','garri','amala','soup','tuwo','ofada','kulikuli','bole','kunu','ugwu','moimoi']
		const endpointMore=['egusi','ofe','ukodo','afia','okro','edika','nkwobi','isi-ewu','kilishi','asun','dodo','ewa-agoyin','agege','gbodi','obonge','kpangolo','kpekere','ewa-riro','ogbono','ewedu','io','api','router','queue','cache','cdn','broker','socket','stream','zinger','pulsar','kolo','ogbonge','tuntun','fresh','legacy','studio','arena','dance','feast','market','parade','agbala','oracle','agbari','ajegunle','padi','shayo','flex']

		const msgLeft=['Why dev','Why test','Why code','Why query','Why logger','Why css','Why feature','Why PR','Why cache','Why KPI','Why ticket','Why socket','Why webhook','Why cron','Why docker image','Why migrate','Why staging','Why env key','Why swagger','Why alert','Why service','Why pipeline','Why cpu','Why memory','Why queue','Why dns','Why cdn','Why index','Why json','Why token','Why healthcheck','Why rate limit','Why session','Why feature flag','Why branch','Why retry','Why timeout','Why upload','Why download','Why image','Why parser','Why linter','Why build','Why release note','Why hotfix','Why assets','Why monitor','Why metric','Why log','Why webhook retry','Why data seed']
		const msgTail=['dey drag leg','dey bend like plantain','dey shout anyhow','dey disappear','dey form celebrity','dey count beans','dey sleep on duty','dey cough for comma','dey love drama','dey change mood','dey waka like tortoise','dey pant like sprinter','dey chew suya without water','dey queue like market day','dey miss alarm','dey vanish for noon','dey smile but heart dey beat','dey forget people name','dey wink for night','dey quarrel for repo','dey fear network','dey flex weight','dey form fine boy','dey write poetry','dey sing lullaby','dey red like stew','long pass wedding program','fine pass the bug','carry face like supervisor','no fit sit down one place']

		const punchA=['Because','Na because','E be like say','Truth be say','Las las because','As e be','No lies—','On a low—']
		const punchB=['rollback','server','bug','database','logger','selector','reviewer','manager','network','acknowledgement','timezone','image','column','prod','copy paste','try out','service','pipeline','cpu','memory','queue','dns','cdn','index','json','token','healthcheck','limit','session','flag','branch','time','file','cache','router','socket','broker','load balancer']
		const punchC=['dey plan weekend picnic','no chop your environment','sabi drip','stop to jog','lose voice','over sabi','go owambe','add motivation','go buy puff puff','trek','enter night bus','chop canteen','add weight','get coconut head','travel','dey ginger belly','notice camera','need breakfast','chase cloud','no get manners','gate man sleep','ask for direction','do photoshoot','wear slippers','forget comma pride','go village','dey use filter','be oga','no sabi face','hold the remote','share same pot','no like story','dey lift weight','miss orientation','hide under feature flag']

		const moodNouns=['minerals','jollof','suya','keke','motor park','swagger','steering','graph','queue','cron','kettle','puffpuff','agbada','ring light','microphone','pilot cap','red carpet','studio','arena','market','feast','drum','palace','breeze','rain','sun','shade','agege bread','pepper soup','zobo','palmwine','agbado','garri','amala','tuwo','ofada','egusi','okro','ewedu','ogbono','kuli kuli','bole','kunu','ugwu','moimoi','asaro','asun','kilishi','kpomo','fura','masa','dambu','moin-moin','yaji']
		const moodOpen=['I need','I dey plan','I dey think of','Body dey crave','Mind dey chase','Spirit dey look','Soul dey toast','Brain dey reason']
		const moodMid=['small','better','premium','correct','serious','soft','extra','turbo']

		const toastStart=['Up NEPA','Light','Transformer','Crowd','Bulb','Compound','Street','Meter','Voltage','Power','Area boys','Generator','Switch','Wire','Fuse','Feeder','House','Gate man','Whole lane','Tailor','Barber','Mama put','Ice block','Children','Neighbour','Dog','Cat','Borehole','Router','TV','Kettle','Blender','Speaker','Ceiling fan','AC','Fridge','Market','Mosque','Church','Stadium','Balcony','Veranda','Corridor','Junction','Roundabout','Estate','Yard','Hostel','Office','Workshop','Kiosk','Mallam']
		const toastTail=['light don show','flash two times then balance','hum like afrobeat','shout up NEPA','blink then steady','just glow','don bright','smile like new baby','carry body come','waka come greet everybody','wave because light don enter','bow out in peace','up like festival','dey warm like fresh bread','greet us with salute','dance shaku for pole','glow like film set','shout praise break','begin selfie with light','machine begin sing','shop reopen like miracle','warm soup with smile','begin grow again','shout holiday','blow whistle','bark national anthem','purr remix','pump start to dance','flash as if na disco','shout we don come back','begin freestyle','do victory lap','begin spray breeze']

		/* build 500 lists */
		const titles = uniqueList(i=>{
			const parts=[pick(titleLeft),pick(titleVerb),pick(titleMid),pick(titleTail)]
			if(Math.random()>.5) parts.splice(2,0,pick(titleExtras))
			return parts.join(' ')
		},500)

		const endpoints = uniqueList(i=>{
			const base = pick(i<250?endpointBase:endpointMore).replaceAll(' ','-')
			const seg  = pick(['v1','v2','v3'])
			const suffix = `-${i}-${r(1,9999)}` // stable uniqueness
			return `/${seg}/${base}${suffix}`.replaceAll('--','-')
		},500)

		const msgs = uniqueList(()=>`${pick(msgLeft)} ${pick(msgTail)}`,500)
		const punchlines = uniqueList(()=>`${pick(punchA)} ${pick(punchB)} ${pick(punchC)}`,500)
		const moods = uniqueList(()=>`${pick(moodOpen)} ${pick(moodMid)} ${pick(moodNouns)}`,500)
		const toasts = uniqueList(()=>`${pick(toastStart)} ${pick(toastTail)}`,500)

		/* audio (unchanged) */
		const sfxList=[
			'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7d8a621d2f.mp3?filename=crowd-cheer-6713.mp3',
			'https://cdn.pixabay.com/download/audio/2021/09/28/audio_7b4e2a6c4f.mp3?filename=small-crowd-ambience-8862.mp3',
			'https://cdn.pixabay.com/download/audio/2023/04/18/audio_2a8f28f9a6.mp3?filename=short-applause-126590.mp3'
		]

		/* payload + theming */
		function payload(msg,punch){
			const statuses=[200,201,202,206,207,226,418]
			const vibes=['soft','hard','ginger','chill','steady','mad','premium']
			const levels=['low','medium','high','premium','legend','cosmic','ultimate']
			return{
				status:pick(statuses),message:msg,punchline:punch,vibe:pick(vibes),wahalaLevel:pick(levels),
				nonce:Math.random().toString(36).slice(2,10),time:new Date().toLocaleTimeString()
			}
		}
		function setVars(vars){
			const root=document.documentElement
			root.style.setProperty('--bg',vars.bg)
			root.style.setProperty('--fg',vars.fg)
			root.style.setProperty('--muted',vars.muted)
			root.style.setProperty('--card',vars.card)
			root.style.setProperty('--ring',vars.ring)
			root.style.setProperty('--accent',vars.acc)
		}
		function mountToast(text,fg,bg){
			const t=document.createElement('div')
			t.className='toast'
			t.style.background=fg
			t.style.color=bg
			t.textContent='🔊 '+text+' ⚡'
			document.body.appendChild(t)
			setTimeout(()=>{t.classList.add('hide');setTimeout(()=>t.remove(),900)},r(2200,4200))
		}
		function setCSS(css){
			const style=document.getElementById('dyn')||document.createElement('style')
			style.id='dyn'; style.textContent=css; document.head.appendChild(style)
		}

		/* ===== layouts (responsive) ===== */
		function neonGlass(vars,data){
			const g1=`radial-gradient(1200px 800px at 10% -10%, hsla(0 0% 100% /.08), transparent),
								radial-gradient(900px 600px at 110% 10%, ${vars.card}, transparent),
								radial-gradient(800px 600px at 50% 120%, ${vars.card}, transparent)`
			const css=`
				body{background:${vars.bg};background-image:${g1}}
				.shell{max-width:min(980px, 94vw);margin:clamp(20px,6vh,48px) auto;padding:0 var(--space)}
				.h{animation:glowPulse 2.2s infinite alternate, wakaShake 3.2s infinite ease-in-out}
			`
			setCSS(css)
			return `
				<div class="shell container">
					<div class="card">
						<span class="badge">${data.endpoint}</span>
						<h1 class="h">⚡ ${data.title} ⚡</h1>
						<p class="sub">rate ${data.rate} ${data.laughs} per minute</p>
						<div class="block">
							<pre>${data.pretty}</pre>
							<div class="row">
								<div><em>Server Mood</em><p>${data.mood}</p></div>
								<div><em>Debug Tip</em><p>${data.tip}</p></div>
							</div>
						</div>
						<p class="footer">${data.footer}</p>
					</div>
				</div>
			`
		}

		function terminal(vars,data){
			const css=`
				body{background:#000;color:#22ff88}
				.wrap{max-width:min(900px, 94vw);margin:clamp(20px,6vh,48px) auto;padding:0 var(--space)}
				.term{border:2px solid #1cff99;border-radius:var(--radius);box-shadow:0 0 30px #1cff9933;padding:var(--space);background:#001310}
				.h{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:clamp(18px, 4.4vw, 38px);margin:0 0 10px}
				pre{background:#000;border:1px solid #1cff99;color:#1cffaa}
				.footer{color:#1cffaa;margin-top:10px}
			`
			setCSS(css)
			return `
				<div class="wrap container">
					<div class="term">
						<div class="h">$ echo "<span style="color:#1cff99">${data.title}</span>"</div>
						<div>&gt; endpoint ${data.endpoint}</div>
						<pre>${data.pretty}</pre>
						<div class="row">
							<div><em>mood</em><p>${data.mood}</p></div>
							<div><em>tip</em><p>${data.tip}</p></div>
						</div>
						<div class="footer">rate ${data.rate} ${data.laughs}/min • ${data.footer}</div>
					</div>
				</div>
			`
		}

		function poster(vars,data){
			const css=`
				body{background:conic-gradient(from ${r(0,360)}deg at 50% 50%, ${vars.bg}, ${vars.acc}, ${vars.bg})}
				.wrap{max-width:min(1100px, 96vw);margin:clamp(20px,6vh,48px) auto;padding:0 var(--space)}
				.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:var(--space)}
				.left{background:#ffffff0e;border:1px solid var(--ring);backdrop-filter:blur(6px);padding:var(--space);border-radius:var(--radius)}
				.right{display:grid;gap:calc(var(--space) * 0.7)}
				.tile{background:#ffffff12;border:1px solid var(--ring);padding:calc(var(--space) * .8);border-radius:calc(var(--radius) * .8)}
				.h{font-family:Impact,Haettenschweiler,Arial Narrow Bold,sans-serif;letter-spacing:1px;text-transform:uppercase;font-size:clamp(28px,6vw,86px);line-height:.95;margin:0 0 10px;text-shadow:0 6px 0 #00000040, 0 0 40px ${vars.fg}}
				.badge{background:${vars.fg};color:#000;font-weight:900}
				pre{max-height:42vh}
				@media (max-width: 900px){ .hero{grid-template-columns:1fr} }
			`
			setCSS(css)
			return `
				<div class="wrap container">
					<div class="hero">
						<div class="left">
							<span class="badge">${data.endpoint}</span>
							<h1 class="h">${data.title}</h1>
							<pre>${data.pretty}</pre>
						</div>
						<div class="right">
							<div class="tile"><div style="font-weight:800;color:${vars.fg}">rate</div><div>${data.rate} ${data.laughs}/min</div></div>
							<div class="tile"><div style="font-weight:800;color:${vars.fg}">mood</div><div>${data.mood}</div></div>
							<div class="tile"><div style="font-weight:800;color:${vars.fg}">tip</div><div>${data.tip}</div></div>
							<div class="tile"><div style="font-weight:800;color:${vars.fg}">note</div><div>${data.footer}</div></div>
						</div>
					</div>
				</div>
			`
		}

		function newspaper(vars,data){
			const css=`
				body{background:#f6f5ef;color:#1c1c1c}
				.paper{max-width:min(900px, 96vw);margin:clamp(20px,6vh,48px) auto;padding:var(--space);background:#fff;border:1px solid #000;border-radius:8px;box-shadow:6px 6px 0 #000}
				.h{font-family:Georgia,serif;font-weight:900;font-size:clamp(24px,5vw,62px);line-height:1.05;margin:0 0 6px}
				.sub{font-family:Georgia,serif;font-style:italic;color:#444}
				.hr{height:2px;background:#000;margin:14px 0}
				.row{display:grid;grid-template-columns:1.2fr .8fr;gap:var(--space)}
				.box{border:2px solid #000;border-radius:6px;padding:calc(var(--space) * 0.8)}
				@media (max-width: 900px){ .row{grid-template-columns:1fr} }
			`
			setCSS(css)
			return `
				<div class="paper container">
					<span class="badge" style="border:2px solid #000;background:transparent;color:#000">${data.endpoint}</span>
					<h1 class="h">${data.title}</h1>
					<div class="sub">rate ${data.rate} ${data.laughs} per minute</div>
					<div class="hr"></div>
					<div class="row">
						<div class="box"><pre>${data.pretty}</pre></div>
						<div class="box">
							<p><strong>Mood</strong><br>${data.mood}</p>
							<p><strong>Tip</strong><br>${data.tip}</p>
							<p><strong>Note</strong><br>${data.footer}</p>
						</div>
					</div>
				</div>
			`
		}

		function emoji(vars,data){
			const cloud=Array.from({length:36},()=>pick(['🔥','⚡','💡','😆','🎉','🚀','🍾','🧪','🧰','🧠','💻','🔧','📡','🧊','🥤','🎛️','💎'])).join(' ')
			const css=`
				body{background:radial-gradient(1200px 600px at 20% -10%, ${vars.acc}, transparent), radial-gradient(1200px 600px at 120% 110%, ${vars.fg}, transparent), ${vars.bg}}
				.wrap{max-width:min(900px, 96vw);margin:clamp(20px,6vh,48px) auto;padding:0 var(--space)}
			`
			setCSS(css)
			return `
				<div class="wrap container">
					<div class="card">
						<div style="font-size:clamp(18px, 4.5vw, 24px);line-height:1.45">${cloud}</div>
						<h1 class="h">${data.title}</h1>
						<div class="sub">${data.endpoint} • ${data.rate} ${data.laughs}/min</div>
						<pre>${data.pretty}</pre>
						<div class="row">
							<div><em>Mood</em><p>${data.mood}</p></div>
							<div><em>Tip</em><p>${data.tip}</p></div>
						</div>
					</div>
				</div>
			`
		}

		function minimal(vars,data){
			const css=`
				body{background:${vars.bg}}
				.wrap{max-width:min(820px, 94vw);margin:clamp(20px,8vh,60px) auto;padding:0 var(--space)}
			`
			setCSS(css)
			return `
				<div class="wrap container">
					<span class="badge" style="background:${vars.fg};color:#000">${data.endpoint}</span>
					<h1 class="h">${data.title}</h1>
					<div class="card">
						<pre>${data.pretty}</pre>
						<div class="row">
							<div><em>mood</em><p>${data.mood}</p></div>
							<div><em>tip</em><p>${data.tip}</p></div>
						</div>
						<p class="footer">${data.footer}</p>
						<p class="footer">rate ${data.rate} ${data.laughs}/min</p>
					</div>
				</div>
			`
		}

		const layouts=[neonGlass,terminal,poster,newspaper,emoji,minimal]

		/* ===== render ===== */
		function render(){
			const palettes=buildPalettes500()
			const vars=pick(palettes)
			setVars(vars)

			const title=pick(titles)
			const endpoint=pick(endpoints)
			const msg=pick(msgs)
			const punch=pick(punchlines)

			const data={
				title, endpoint,
				rate:r(40,220),
				laughs:pick(['laugh','giggle','cackle','snort','chuckle','keke','hehe','hahaha']),
				mood:pick(moods),
				tip:pick([
					'Clear cache drink water continue','Off and on like gen then observe','Add index give query shoe','Pin version before dependency carry you go','Toggle flag make brain reset',
					'Scale small then chill like bus stop','Check env well greet am with sir','Reduce log before e burn light','Watch metrics like champions league','Invalidate cache pray small',
					'Open devtools look network tab well','Use pagination no carry all rice'
				]),
				footer:pick(['Made in Naija ❤️ Powered by Gbas Gbos API 😎','Built for vibes ❤️ Served hot by Cruise Engine 😎','Naija made ❤️ Engine run on pure ginger 😎']),
				pretty:JSON.stringify(payload(msg,punch),null,2)
			}

			const view=pick(layouts)(vars,data)
			document.getElementById('app').innerHTML=view
			mountToast(pick(toasts),vars.fg,vars.bg)

			const audio=document.getElementById('sfx')
			document.getElementById('sfxsrc').src=pick(sfxList)
			audio.load(); audio.play().catch(()=>{})
		}

		render()
	</script>
</body>
</html>
