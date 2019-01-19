let app = new Vue({
    el: '#app',
    data: {
      players: [Baron, Metodios, Alykas, Veybex, Aku, Greenfinite, Jadixa],
      team : team
    },
    mounted() {
      if (localStorage.getItem('players')) {
          try {
              this.players = JSON.parse(localStorage.getItem('players'));
              for (let i = 0; i < this.players.length; i++){
                  if (this.players[i].lastUpdated)
                      this.players[i].lastUpdatedTimer = moment(this.players[i].lastUpdated).fromNow();	
              }
              getTeamStats();
          }
            catch(e) {
              console.log("erreur ", e);
              localStorage.removeItem('players');
            }
      }
    },
  });
  
  function save(){
      for (let i = 0; i < app.players.length; i++){
          app.players[i].fetching = false;
      }
      localStorage.setItem('players', JSON.stringify(app.players));
      console.log("saved", JSON.parse(localStorage.getItem("players")));
  
      getTeamStats();
  }
  
  function getTeamStats(){
      let maxRank = 0;
      let maxRankTotal = 0;
      let maxRankIndex = 0;
      let minRank = 5000;
      let minRankPlayer;
      let maxRankPlayer;
      for (let i = 0; i < app.players.length; i++){
  
          //calcultating maxRank
          if (app.players[i].maxRank){
                  maxRankIndex ++;
                  maxRankTotal += app.players[i].maxRank;
                  if (app.players[i].maxRank > maxRank){
                      maxRank = app.players[i].maxRank;
                      maxRankPlayer = app.players[i].name;
                  }
                  if (app.players[i].maxRank < minRank){
                      minRank = app.players[i].maxRank;
                      minRankPlayer = app.players[i].name;
                  }
          }
      }
      let maxRankAverage = Math.round(maxRankTotal / maxRankIndex);
  
      app.team.maxRank = maxRank;
      app.team.maxRankPlayer = maxRankPlayer;
      app.team.minRank = minRank;
      app.team.minRankPlayer = minRankPlayer;
      app.team.averageMaxRank = maxRankAverage;
  
      if (app.team.maxRank>=4000) team.maxRankIcon="./assets/ranks/gm.png";
      else if (app.team.maxRank>=3500) team.maxRankIcon="./assets/ranks/master.png";
      else if (app.team.maxRank>=3000) team.maxRankIcon="./assets/ranks/diamant.png";
      else if (app.team.maxRank>=2500) team.maxRankIcon="./assets/ranks/plat.png";
      else app.team.maxRankIcon="./assets/ranks/gold.png";
  
      if (app.team.minRank>=4000) team.minRankIcon="./assets/ranks/gm.png";
      else if (app.team.minRank>=3500) team.minRankIcon="./assets/ranks/master.png";
      else if (app.team.minRank>=3000) team.minRankIcon="./assets/ranks/diamant.png";
      else if (app.team.minRank>=2500) team.minRankIcon="./assets/ranks/plat.png";
      else app.team.minRankIcon="./assets/ranks/gold.png";
  
      if (app.team.averageMaxRank>=4000) team.averageMaxRankIcon="./assets/ranks/gm.png";
      else if (app.team.averageMaxRank>=3500) team.averageMaxRankIcon="./assets/ranks/master.png";
      else if (app.team.averageMaxRank>=3000) team.averageMaxRankIcon="./assets/ranks/diamant.png";
      else if (app.team.averageMaxRank>=2500) team.averageMaxRankIcon="./assets/ranks/plat.png";
      else app.team.averageMaxRankIcon="./assets/ranks/gold.png";
  }
  
  
  
  //fetch player stats (index is smurf n°index n°0 for main)
  function pull( player, index ){
  
      player.fetching = true;
      
      let url = 'https://owapi.net/api/v3/u/' + player.battletags[index] + '/blob';
  
      fetch(url) 
      .then(function(data) {
          data = data.json(); 
          return data;
      }).then(function(data){
  
          console.log(data);
  
          //check if rate limited
          if (data.error == 429){
              setTimeout( function(){pull(player, index)},10000);
              console.log(player.battletags[index] + "ratelimited")
          }
          else if (data.error == 500){
              console.log(player.battletags[index] + " private")
          }
          else{
              if (index == 0){
                  if (data.eu.stats.competitive.overall_stats.comprank){
  
                      //getting stats
                      player.rank = [data.eu.stats.competitive.overall_stats.comprank];
                      player.maxRank =  data.eu.stats.competitive.overall_stats.comprank;
                      player.averageRank =  data.eu.stats.competitive.overall_stats.comprank;
                      player.wins = data.eu.stats.competitive.overall_stats.wins;
                      player.playerIcon = data.eu.stats.competitive.overall_stats.avatar;
                      player.loss = data.eu.stats.competitive.overall_stats.losses;
                      player.games = data.eu.stats.competitive.overall_stats.games;
                      player.draws = data.eu.stats.competitive.overall_stats.ties;
                      player.winrate = data.eu.stats.competitive.overall_stats.win_rate;
                      player.endorsement = data.eu.stats.competitive.overall_stats.endorsement_level;
                      player.rankTotal = data.eu.stats.competitive.overall_stats.comprank;
  
                      if (player.winrate > 51) player.winrateColor="green";
                      else if (player.winrate> 49) player.winrateColor="orange";
                      else player.winrateColor="red";
  
                      player.level = data.eu.stats.competitive.overall_stats.level + 100 * data.eu.stats.competitive.overall_stats.prestige;
                          
                      if (player.maxRank>=4000) player.rankIcon="./assets/ranks/gm.png";
                      else if (player.maxRank>=3500) player.rankIcon="./assets/ranks/master.png";
                      else if (player.maxRank>=3000) player.rankIcon="./assets/ranks/diamant.png";
                      else if (player.maxRank>=2500) player.rankIcon="./assets/ranks/plat.png";
                      else player.rankIcon="./assets/ranks/gold.png";
  
                      if (player.maxRank>=4000) player.rankName="gm";
                      else if (player.maxRank>=3500) player.rankName="master";
                      else if (player.maxRank>=3000) player.rankName="diamant";
                      else if (player.maxRank>=2500) player.rankName="plat";
                      else player.rankIcon="gold";
  
                      player.averageRankIcon = player.rankIcon;
                      player.mostPlayed = data.eu.heroes.playtime.competitive;
                      player.mostPlayedMapped = Object.keys(player.mostPlayed).map(function(key) {
                            return [key, player.mostPlayed[key]];
                      });
  
                      let most1=0; let most11="";
                      let most2=0; let most22="";
                      let most3=0; let most33="";
                      let most4=0; let most44="";
                      let most5=0; let most55="";
                      
                      for (let j=0; j<5; j++){
                          for (let i=0;i < player.mostPlayedMapped.length;i++){
                              let key = player.mostPlayedMapped[i][0];
                              let value = player.mostPlayedMapped[i][1];
                              if (value >= most1){most1=value;most11=key;}
                              else if (value >= most2){most2=value;most22=key;}
                              else if (value >= most3){most3=value;most33=key;}
                              else if (value >= most4){most4=value;most44=key;}
                              else if (value >= most5){most5=value;most55=key;}
                          }
                      }
  
                      player.mostPlayedTime = [most1, most2, most3, most4, most5 ];
                      player.mostPlayedKey = [most11, most22, most33, most44, most55 ];
  
                      player.display = true;
                      
                      player.lastUpdated = moment();
                      player.lastUpdatedTimer = moment().fromNow();
                      save();
                  }
                  else{
                      console.log("no data");
                  }
              }
              else {	//if smurf
  
                  if (data.eu.stats.competitive.overall_stats.comprank){
  
                  if (player.averageRank>=4000) player.averageRankIcon="./assets/ranks/gm.png";
                  else if (player.averageRank>=3500) player.averageRankIcon="./assets/ranks/master.png";
                  else if (player.averageRank>=3000) player.averageRankIcon="./assets/ranks/diamant.png";
                  else if (player.averageRank>=2500) player.averageRankIcon="./assets/ranks/plat.png";
                  else player.rankIcon="./assets/ranks/gold.png";
  
                  if (player.rank.length < index + 1) player.rank.push(data.eu.stats.competitive.overall_stats.comprank)
  
  
                  player.wins += data.eu.stats.competitive.overall_stats.wins;
                  player.loss += data.eu.stats.competitive.overall_stats.losses;
                  player.games += data.eu.stats.competitive.overall_stats.games;
                  player.draws += data.eu.stats.competitive.overall_stats.ties;
                  player.winrate = (Math.round(((player.games * 100) / player.loss)* 10) / 10) / 4;
  
                  let avgRank = 0;
                  for (let i = 0; i < player.rank.length; i++){
                      avgRank += player.rank[i]
                  }
  
                  player.averageRank = Math.round(avgRank / player.rank.length);
  
                  //if new best rank
                  if (data.eu.stats.competitive.overall_stats.comprank > player.maxRank){
                      player.maxRank = data.eu.stats.competitive.overall_stats.comprank;
                      if (player.maxRank>=4000) player.rankIcon="./assets/ranks/gm.png";
                      else if (player.maxRank>=3500) player.rankIcon="./assets/ranks/master.png";
                      else if (player.maxRank>=3000) player.rankIcon="./assets/ranks/diamant.png";
                      else if (player.maxRank>=2500) player.rankIcon="./assets/ranks/plat.png";
                      else player.rankIcon="./assets/ranks/gold.png";
                  }
  
                  if (player.maxRank>=4000) player.averageRankIcon="./assets/ranks/gm.png";
                      else if (player.averageRank>=3500) player.averageRankIconn="./assets/ranks/master.png";
                      else if (player.averageRank>=3000) player.averageRankIcon="./assets/ranks/diamant.png";
                      else if (player.averageRank>=2500) player.averageRankIcon="./assets/ranks/plat.png";
                      else player.averageRankIcon="./assets/ranks/gold.png";
  
                  if (player.maxRank>=4000) player.rankName="gm";
                      else if (player.maxRank>=3500) player.rankName="master";
                      else if (player.maxRank>=3000) player.rankName="diamant";
                      else if (player.maxRank>=2500) player.rankName="plat";
                      else player.rankIcon="gold";
  
                  let mostPlayed = data.eu.heroes.playtime.competitive;
  
                  let mapped = Object.keys(mostPlayed).map(function(key) {
                        return [key, mostPlayed[key]];
                  });
  
                  let most1=0; let most11="";
                  let most2=0; let most22="";
                  let most3=0; let most33="";
                  let most4=0; let most44="";
                  let most5=0; let most55="";
                  //reunite both array
                  for (let i=0;i < player.mostPlayedMapped.length;i++){
                      for (let j=0;j < mapped.length;j++){
                          if (player.mostPlayedMapped[i][0] == mapped[j][0]){
                              player.mostPlayedMapped[i][1] += mapped[j][1];
                              mapped[j][0] = null;
                          }
                      }
                  }
  
                  //then merge them
                  for (let j=0; j<5; j++){
                      for (let i=0;i < player.mostPlayedMapped.length;i++){
  
                          let key = player.mostPlayedMapped[i][0];
                          let value = player.mostPlayedMapped[i][1];
                          if (value >= most1){most1=value;most11=key;}
                          else if (value >= most2){most2=value;most22=key;}
                          else if (value >= most3){most3=value;most33=key;}
                          else if (value >= most4){most4=value;most44=key;}
                          else if (value >= most5){most5=value;most55=key;}
                      }
                  }
  
                  player.mostPlayedTime = [most1, most2, most3, most4, most5 ];
                  player.mostPlayedKey = [most11, most22, most33, most44, most55 ];
  
                  save();
              }else{
                  console.log("no data");
                  player.fetching = false;
  
              }
  
              }
  
              
                  
  
              if (player.battletags.length > index + 1){
                  setTimeout(function(){pull(player, index + 1)},10000);
              }
              else{
                  player.fetching = false;
              }
  
          }
      });
  }
  
  function showAll(){
      pull(app.players[0], 0);
      setTimeout(function(){pull(app.players[1], 0)},5000);
      setTimeout(function(){pull(app.players[2], 0)},10000);
      setTimeout(function(){pull(app.players[3], 0)},15000);
      setTimeout(function(){pull(app.players[4], 0)},20000);
      setTimeout(function(){pull(app.players[5], 0)},25000);
      setTimeout(function(){pull(app.players[6], 0)},30000);
  }