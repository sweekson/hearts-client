
class API {}

API.ranked = (from, team) => {
  const host = 'https://aicontest2018.trendmicro.com/api/trend-hearts/ranked-games/';
  const params = `?format=json&from=${from}&limit=500&offset=0&playerNumber=${team}&sortField=createTime&sortOrder=1`;
  const url = host + params;
  return $.ajax({ url });
};

API.leaderboard = (week) => {
  const host = `https://aicontest2018.trendmicro.com/api/leaderboard/trend-hearts/week/${week}/`;
  const params = '?format=json&limit=1000&offset=0&sortField=rank&sortOrder=0';
  const url = host + params;
  return $.ajax({ url });
};

class Util {}

Util.percent = (value) => `${Number(value * 100).toFixed(0)}%`;

Util.week = date => {
  if (date >= new Date('2018/10/01') && date <= new Date('2018/10/06')) { return 3; }
  if (date >= new Date('2018/10/08') && date <= new Date('2018/10/13')) { return 4; }
  if (date >= new Date('2018/10/15') && date <= new Date('2018/10/20')) { return 5; }
  return 6;
};

class TeamStats {
  constructor (team, data) {
    this.team = team;
    this.rank = 0;
    this.data = data;
  }

  parse () {
    const { team, data } = this;
    const first = data.results[data.results.length - 1].players.find(v => v.playerNumber === team);
    const latest = data.results[0].players.find(v => v.playerNumber === team);
    const rating1 = first.ratings[first.ratings.length === 2 ? 1 : 0];
    const rating2 = latest.ratings[latest.ratings.length === 2 ? 1 : 0];
    const rating3 = rating2 - rating1;
    const rating4 = rating3 < 0 ? rating3 : `+${rating3}`;
    const records = this.records = data.totalRecords - (2 - latest.ratings.length);
    const ranks = [0, 0, 0, 0];
    const ranking = ranks => ranks.map((v, i) => `${i + 1}: ${v} (${Util.percent(v / records)})`).join(' | ');
    data.results.forEach(match => {
      const self = match.players.find(v => v.playerNumber === team);
      self.rank !== 0 && ++ranks[self.rank - 1];
    });
    this.ratings = `${rating1} -> ${rating2} (${rating4})`;
    this.ranks = `${team} - ${ranking(ranks)}`;
    return this;
  }

  get summary () {
    const { rank, ratings, records, ranks } = this;
    const team = String(this.team).padStart(3, 0);
    return {
      'Team': team,
      'Rank': rank,
      'Rating Stats': ratings,
      'Records': records,
      'Ranks Stats': ranks,
    };
  }
}

class HeartsSummary {
  constructor (teams, from) {
    this.teams = teams;
    this.from = from;
    this.stats = new Map();
    this.heading = ['Team', 'Rank', 'Rating Stats', 'Records', 'Ranks Stats'];
    this.summary = [];
  }

  report () {
    const date = this.from ? new Date(this.from) : new Date();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const from = today.getTime();
    const week = Util.week(from);
    const leaderboard = API.leaderboard(week).done(data => this.leaderboard = new Map(data.results.map(v => [v.playerNumber, v])));
    const ranked = this.teams.map(team => API.ranked(from * 0.001, team).done(data => this.parse(team, data)));
    $.when(leaderboard, ...ranked).done(_ => this.dump());
  }

  parse (team, data) {
    this.stats.set(team, new TeamStats(team, data).parse());
  }

  dump () {
    this.stats.forEach(v => {
      v.rank = this.leaderboard.get(v.team).rank;
      this.summary.push(v.summary);
    });
    this.summary.sort((a, b) => Number(a.Team) - Number(b.Team));
    console.table(this.summary, this.heading);
  }
}

HeartsSummary.report = (teams, from) => new HeartsSummary(teams, from).report();

HeartsSummary.report([79, 148, 272, 341, 350, 369, 410]);