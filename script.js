/*
 * Sistema de Agendamento de Consultas Médicas - protótipo
 * Indexação com Árvore B (CPF, CRM e Data) + relatório ordenado com Merge Sort.
 * Os dados são fictícios e ficam apenas na memória do navegador.
 */

// ---------- Árvore B (grau mínimo t) ----------
// Cada nó guarda entre t-1 e 2t-1 chaves (a raiz pode ter menos).
// Cada chave aponta para uma LISTA de ids de consultas (chaves repetidas
// como CRM ou data reúnem várias consultas na mesma lista).
// Em disco, cada nó seria uma página/bloco: ler um nó = 1 acesso.
class BTree{
 constructor(t){this.t=t;this.root=this.nd(true);this.h=1;this.keys=0}
 nd(leaf){return{keys:[],vals:[],ch:[],leaf}}
 // Busca a chave k descendo da raiz até a folha.
 // v = nós visitados (acessos a disco simulados); path = nº de chaves de cada nó do caminho.
 find(k){let x=this.root,v=0,path=[];for(;;){v++;path.push(x.keys.length);let i=0;while(i<x.keys.length&&k>x.keys[i])i++;
  if(i<x.keys.length&&k===x.keys[i])return{x,i,found:true,v,path};if(x.leaf)return{found:false,v,path};x=x.ch[i]}}
 search(k){const f=this.find(k);return{val:f.found?f.x.vals[f.i]:[],v:f.v,path:f.path}}
 // Divide o filho cheio x.ch[i]: a chave do meio sobe para x e o nó vira dois.
 split(x,i){const t=this.t,y=x.ch[i],z=this.nd(y.leaf),mk=y.keys[t-1],mv=y.vals[t-1];
  z.keys=y.keys.slice(t);z.vals=y.vals.slice(t);if(!y.leaf){z.ch=y.ch.slice(t);y.ch=y.ch.slice(0,t)}
  y.keys=y.keys.slice(0,t-1);y.vals=y.vals.slice(0,t-1);x.keys.splice(i,0,mk);x.vals.splice(i,0,mv);x.ch.splice(i+1,0,z)}
 // Insere a chave k. Se ela já existe, apenas acrescenta o id à lista.
 // Nós cheios são divididos durante a descida; se a raiz enche, a altura cresce.
 insert(k,id){const f=this.find(k);if(f.found){f.x.vals[f.i].push(id);return}
  const t=this.t;this.keys++;
  if(this.root.keys.length===2*t-1){const s=this.nd(false);s.ch=[this.root];this.root=s;this.split(s,0);this.h++}
  let x=this.root;for(;;){let i=x.keys.length-1;
   if(x.leaf){while(i>=0&&k<x.keys[i])i--;x.keys.splice(i+1,0,k);x.vals.splice(i+1,0,[id]);return}
   while(i>=0&&k<x.keys[i])i--;i++;
   if(x.ch[i].keys.length===2*t-1){this.split(x,i);if(k>x.keys[i])i++}x=x.ch[i]}}
}
// Merge Sort (ordenação por comparação, O(n log n)) usado no relatório diário.
function mergeSort(a,c){if(a.length<2)return a;const m=a.length>>1,l=mergeSort(a.slice(0,m),c),r=mergeSort(a.slice(m),c),o=[];let i=0,j=0;
 while(i<l.length&&j<r.length)o.push(c(l[i],r[j])<=0?l[i++]:r[j++]);return o.concat(l.slice(i),r.slice(j))}

// ---------- Dados fictícios ----------
// Gerador pseudoaleatório com semente fixa: os mesmos dados a cada carregamento.
let seed=42;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const R=n=>Math.floor(rnd()*n);
const FN=["Ana","Bruno","Carla","Diego","Elisa","Fábio","Gabriela","Hugo","Isabela","João","Karina","Lucas","Marina","Nelson","Olívia","Paulo","Rafaela","Sérgio","Talita","Vitor"];
const LN=["Silva","Souza","Costa","Pereira","Lima","Ferreira","Ribeiro","Alves","Rocha","Martins","Barros","Cardoso","Moura","Teixeira"];
const ESP=["Clínico Geral","Cardiologia","Pediatria","Ortopedia","Dermatologia","Ginecologia","Neurologia","Oftalmologia"];
const fmtCpf=d=>d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");
const cpfs=[],meds=[];
for(let i=0;i<800;i++){let d="";for(let k=0;k<11;k++)d+=R(10);cpfs.push({cpf:fmtCpf(d),nome:FN[R(20)]+" "+LN[R(14)]+" "+LN[R(14)]})}
for(let i=0;i<40;i++)meds.push({crm:"CRM-MA "+(10100+i*7),nome:"Dr(a). "+FN[R(20)]+" "+LN[R(14)],esp:ESP[i%8]});
// C = tabela de consultas; tCpf/tCrm/tData = índices em Árvore B sobre ela.
const C=[],tCpf=new BTree(5),tCrm=new BTree(5),tData=new BTree(5);
function addC(p,m,data,hora){const id=C.length;C.push({id,cpf:p.cpf,nome:p.nome,crm:m.crm,med:m.nome,esp:m.esp,data,hora});tCpf.insert(p.cpf,id);tCrm.insert(m.crm,id);tData.insert(data,id);return id}
for(let i=0;i<4000;i++){const day=R(92),dt=new Date(Date.UTC(2026,9,1+day)),data=dt.toISOString().slice(0,10),h=8+R(10),mi=R(2)*30;
 addC(cpfs[R(800)],meds[R(40)],data,String(h).padStart(2,"0")+":"+(mi?"30":"00"))}

// ---------- UI ----------
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function stats(){$("stats").innerHTML=[["Consultas",C.length],["Índice CPF · altura",tCpf.h],["Índice CRM · altura",tCrm.h],["Índice Data · altura",tData.h],["Chaves por nó (máx.)",2*5-1]]
 .map(([a,b])=>`<div class="chip">${a}: <b>${b}</b></div>`).join("")}
function table(rows){return`<div class="tw"><table><tr><th>Data</th><th>Hora</th><th>Paciente</th><th>CPF</th><th>Médico</th><th>Especialidade</th></tr>${rows.map(c=>`<tr><td>${esc(c.data.split("-").reverse().join("/"))}</td><td>${c.hora}</td><td>${esc(c.nome)}</td><td>${esc(c.cpf)}</td><td>${esc(c.med)} (${esc(c.crm)})</td><td>${esc(c.esp)}</td></tr>`).join("")}</table></div>`}
const T={cpf:tCpf,crm:tCrm,data:tData},PH={cpf:"ex.: 123.456.789-00",crm:"ex.: CRM-MA 10100",data:""};
function ex(){const by=$("by").value,q=$("q");q.type=by==="data"?"date":"text";q.placeholder=PH[by];q.value="";
 const s=by==="cpf"?[C[0].cpf,C[1].cpf]:by==="crm"?[meds[0].crm,meds[5].crm]:["2026-10-15","2026-11-20"];
 $("ex").innerHTML="Exemplos: "+s.map(v=>`<a>${v}</a>`).join("");$("ex").querySelectorAll("a").forEach(a=>a.onclick=()=>{q.value=a.textContent;busca()})}
// Busca pelo índice escolhido e compara acessos: Árvore B x busca sequencial (C.length).
function busca(){const by=$("by").value;let v=$("q").value.trim();if(!v)return;
 if(by==="cpf"){const d=v.replace(/\D/g,"");if(d.length===11)v=fmtCpf(d)}
 const t0=performance.now(),r=T[by].search(v),ms=(performance.now()-t0).toFixed(2);
 const rows=r.val.map(i=>C[i]);
 $("bres").innerHTML=`<div class="m"><div><b>${r.v}</b><span>nós lidos no disco (Árvore B)</span></div><div class="s"><b>${C.length}</b><span>registros lidos numa busca sequencial</span></div></div>
 <div class="path">Caminho na árvore (chaves por nó): ${r.path.map((n,i)=>`nível ${i}[${n}]`).join(" → ")} · ${ms} ms</div>
 ${rows.length?`<p><b>${rows.length}</b> consulta(s) encontrada(s)</p>`+table(rows):"<p>Nenhuma consulta encontrada para este valor.</p>"}`}
// Relatório: busca a data no índice e ordena os resultados por horário (Merge Sort).
function relatorio(){const d=$("rdata").value;if(!d)return;const r=tData.search(d),rows=mergeSort(r.val.map(i=>C[i]),(a,b)=>a.hora<b.hora?-1:a.hora>b.hora?1:0);
 $("rres").innerHTML=`<p class="note">${rows.length} atendimentos em ${d.split("-").reverse().join("/")} · localizados com ${r.v} nós lidos e ordenados por horário com Merge Sort.</p>`+(rows.length?table(rows):"")}
// Agendar = inserir a nova consulta na tabela e nos três índices.
function agendar(){const d=$("acpf").value.replace(/\D/g,""),nome=$("anome").value.trim(),data=$("adata").value,hora=$("ahora").value;
 if(d.length!==11||!nome||!data||!hora){$("amsg").style.color="var(--mut)";$("amsg").textContent="Preencha CPF (11 dígitos), nome, data e hora.";return}
 const m=meds[$("acrm").selectedIndex],id=addC({cpf:fmtCpf(d),nome},m,data,hora);stats();
 $("amsg").style.color="var(--ok)";$("amsg").textContent=`Consulta #${id+1} agendada e indexada. Busque pelo CPF ${fmtCpf(d)} para conferir.`}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on",x===b));
 ["b","a","r"].forEach(s=>$(s).classList.toggle("hide",s!==b.dataset.t))});
$("acrm").innerHTML=meds.map(m=>`<option>${esc(m.crm)} — ${esc(m.esp)}</option>`).join("");
$("by").onchange=ex;$("bgo").onclick=busca;$("q").onkeydown=e=>{if(e.key==="Enter")busca()};$("ago").onclick=agendar;$("rgo").onclick=relatorio;
stats();ex();
