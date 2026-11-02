(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.PRV56Clubs=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const CLUBS={
    'Real Madrid':{short:'RM',url:'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg'},
    'Barcelona':{short:'FCB',url:'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg'},
    'Manchester City':{short:'MCI',url:'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg'},
    'Liverpool':{short:'LIV',url:'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg'},
    'Arsenal':{short:'ARS',url:'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg'},
    'AC Milan':{short:'ACM',url:'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg'},
    'Bayern Munich':{short:'FCB',url:'https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg'},
    'Juventus':{short:'JUV',url:'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg'},
    'Manchester United':{short:'MUN',url:'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg'},
    'Chelsea':{short:'CHE',url:'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg'},
    'Atletico Madrid':{short:'ATM',url:'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg'},
    'Tottenham':{short:'TOT',url:'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg'},
    'Paris SG':{short:'PSG',url:'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg'},
    'Borussia Dortmund':{short:'BVB',url:'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg'},
    'Inter Milan':{short:'INT',url:'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg'},
    'Porto':{short:'FCP',url:'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg'},
    'Brazil':{short:'BRA',url:'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg'},
    'Spain':{short:'ESP',url:'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg'},
    'Germany':{short:'GER',url:'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg'},
    'France':{short:'FRA',url:'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg'},
    'Belgium':{short:'BEL',url:'https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg'},
    'England':{short:'ENG',url:'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg'},
    'Portugal':{short:'POR',url:'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg'},
    'Argentina':{short:'ARG',url:'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg'},
    'Uruguay':{short:'URU',url:'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Uruguay.svg'},
    'Netherlands':{short:'NED',url:'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg'}
  };
  function initials(name){
    return String(name||'Club').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'CL';
  }
  function clubMeta(name){
    const n=String(name||'').trim();
    const hit=CLUBS[n];
    return {name:n||'Club',short:hit?hit.short:initials(n),url:hit?hit.url:''};
  }
  return {CLUBS,clubMeta,initials};
});
