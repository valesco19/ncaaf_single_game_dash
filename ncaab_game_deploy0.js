
//Global Vars
let color_dict = {
    black: "#000",
    charcoal: "#333",
    white: "#fff",
    light_gray: "#cec1ae",
    med_gray: "#cec1ae",
    dark_gray: '#cec1ae',
    orange: "#f57e42",
    dark_bg: "#1a1a1a",
}

let global_var_dict = {
    schedule_date_str: '',
    game_filter_type: "date",
    games_for_day: [],
    mobile_screen_width: 625,
    schedule_date_str: pullCurrentDateStr(),
    schedule_array: [],

}

function convertWinProbToAmericanOdds(win_prob) {
    // Ensure american_odds is a valid probability (between 0 and 1)
    if (win_prob < 0 || win_prob > 1) {
        throw new Error("Win probability must be between 0 and 1");
    }

    // Convert win probability to American moneyline odds
    var moneyline_odds;
    if (win_prob === 0) {
        moneyline_odds = NaN;
    } else if (win_prob === 1) {
        moneyline_odds = Infinity;
    } else if (win_prob < 0.5) {
        
        moneyline_odds = Math.round((100 / win_prob) - 100);

    } else {

        moneyline_odds = Math.round((win_prob * 100) / (1 - win_prob) * -1);

    }

    return moneyline_odds;
}

function calcTeamTotal(spread, game_total) {

    let team_total = (game_total / 2) + (spread / 2);

    return team_total

}

function calcGameClockStr(game_clock, game_period) {

    game_clock = parseInt(game_clock);

    if (game_clock > 1200) {

        let derived_game_period =  "1H";

        game_clock -= 1200;

        let game_clock_minutes = Math.floor(game_clock / 60);
        let game_clock_seconds = game_clock % 60;

        let game_clock_minutes_str = game_clock_minutes.toString().padStart(2, '0');
        let game_clock_seconds_str = game_clock_seconds.toString().padStart(2, '0');

        let game_clock_str = game_clock_minutes_str + ":" + game_clock_seconds_str + " " + derived_game_period;

        return game_clock_str

    } else if (game_clock === 1200) {

        return "Halftime"
    
    } else if (game_clock >= 0) {

        let derived_game_period =  "2H";

        let game_clock_minutes = Math.floor(game_clock / 60);
        let game_clock_seconds = game_clock % 60;

        let game_clock_minutes_str = game_clock_minutes.toString().padStart(2, '0');
        let game_clock_seconds_str = game_clock_seconds.toString().padStart(2, '0');

        let game_clock_str = game_clock_minutes_str + ":" + game_clock_seconds_str + " " + derived_game_period;

        return game_clock_str

    } else {

        let derived_game_period = "OT";

        let ot_game_clock = 300 + game_clock;

        let game_clock_minutes = Math.floor(ot_game_clock / 60);
        let game_clock_seconds = ot_game_clock % 60;

        let game_clock_minutes_str = game_clock_minutes.toString().padStart(2, '0');
        let game_clock_seconds_str = game_clock_seconds.toString().padStart(2, '0');

        let game_clock_str = game_clock_minutes_str + ":" + game_clock_seconds_str + " " + derived_game_period;

        return game_clock_str

    }
}

function calcGameStatus(d) {

    if (d.game_status === "final") {

        return "Final"

    } else if (d.game_status === "pre") {

        return "Pregame"
    
    } else if (d.game_status === "live") {

        let game_clock_str = calcGameClockStr(d.game_clock, d.game_period);

        return game_clock_str;

    } else if (d.game_status === "postponed") {

        return "Postponed"

    } else {

        console.log("Error: game_status not recognized", d.game_status)
        return ""

    }
}

function pullCurrentDateStr() {

    let current_date = new Date();

    // Get the components of the date
    let year = current_date.getFullYear();
    let month = (current_date.getMonth() + 1).toString().padStart(2, '0'); 
    let day = current_date.getDate().toString().padStart(2, '0');

    // Format the date as "YYYY-MM-DD"
    let date_str = `${year}-${month}-${day}`;

    return date_str
}

function sendLoadGamesReq() {

    //Send request for new day's games
    let games_req_dict = {
        user_email: logged_in_user.email,
        req_type: "load_games",
        params: {
            "schedule_date_str": global_var_dict.schedule_date_str,
        }
    };

    //Remove currently displayed games
    d3.select("#game_div").selectAll("*").remove();

    ws_conn.send(JSON.stringify(games_req_dict));

}

function launchGamePage(game_url) {

    let full_game_url = "http://127.0.0.1:5501?game_url=" + game_url;

    window.open(full_game_url, '_blank');

};

function populateSchedule(schedule_array) {

    console.log("----> populate_schedule", schedule_array[0]);

    //Filter Out Games where  either teams rank is null not the string "null"
    schedule_array = schedule_array.filter(function(d) {

        return d.away_team_rank !== null && d.home_team_rank !== null

    });

    let game_div = d3.select('#game_div');
    let game_div_width = game_div.node().getBoundingClientRect().width;

    let game_row_width = game_div_width - 30;
    let game_row_height = 120;
    let game_row_padding = 12;

    let game_rows = game_div.selectAll(".game_rows")
                                                .data(schedule_array)
                                                .enter()
                                                .append('div')
                                                .attr('class', 'game_rows')
                                                .attr('id', function(d, i) {
                                                        
                                                        return "game_row_" + i
    
                                                })
                                                .append('svg')
                                                .attr('id', function(d, i) {

                                                    console.log(
                                                        d.game_url, d.away_team_seo_name, d.home_team_seo_name
                                                    );

                                                    return "game_row_" + i + "_svg"
                                                })
                                                .attr('width', game_row_width + "px")
                                                .attr('height', (game_row_height) + "px");

    let game_row_bgs = game_rows.append("rect")
                                                .attr('class', 'game_row_bgs')
                                                .attr('width', (game_row_width) + "px")
                                                .attr('height', (game_row_height) + "px")
                                                .attr('fill', color_dict.dark_bg)
                                                // .attr('stroke', color_dict.black)
                                                // .attr('stroke-width', '2px')
                                                .attr('rx', '15px')
                                                .attr('ry', '15px')
                                                //.style('shape-rendering', 'CrispEdges');

    let game_padding_dict = {
        left: 15,
        top: 14,
        bottom: 15,
        right: 10,
    };

    let team_name_font_size = game_div_width < global_var_dict.mobile_screen_width ? '14px' : '18px';
    let sub_text_size = game_div_width < global_var_dict.mobile_screen_width ? '10px' : '14px';
    let team_logo_size = game_div_width < global_var_dict.mobile_screen_width ? 25 : 32;
    let away_top_padding = 42;

    let game_away_team_rank_text = game_rows.append('text')
                                                                                    .text(function(d) {
                                                                                        return d.away_team_rank
                                                                                    })
                                                                                    .attr('x', game_padding_dict.left)
                                                                                    .attr('y', game_padding_dict.top + 8)
                                                                                    .attr('id', function(d) {

                                                                                        //Replace "/" with "_" in game_url
                                                                                        let game_url = d.game_url.replace(/\//g, "_");

                                                                                        return 'game_away_team_rank_' + game_url

                                                                                    })
                                                                                    .attr('text-anchor', 'middle')
                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                    .attr('fill', color_dict.med_gray)
                                                                                    .style('font-size', '12px')
                                                                                    .style('font-weight', 500)
                                                                                    .style('font-family', 'Work Sans');

    let game_home_team_rank_text = game_rows.append('text')
                                                                                    .text(function(d) {
                                                                                        return d.home_team_rank
                                                                                    })
                                                                                    .attr('x', game_padding_dict.left)
                                                                                    .attr('y', game_padding_dict.top + away_top_padding)
                                                                                    .attr('id', function(d) {

                                                                                        //Replace "/" with "_" in game_url
                                                                                        let game_url = d.game_url.replace(/\//g, "_");

                                                                                        return 'game_home_team_rank_' + game_url;

                                                                                    })
                                                                                    .attr('text-anchor', 'middle')
                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                    .attr('fill', color_dict.med_gray)
                                                                                    .style('font-size', '12px')
                                                                                    .style('font-weight', 500)
                                                                                    .style('font-family', 'Work Sans');

    let game_away_team_logo = game_rows.append("svg:image")
                                                                                    .attr("id", "away_team_logo_img")
                                                                                    .attr('x', game_padding_dict.left + 17)
                                                                                    .attr('y',  13)
                                                                                    .attr('width', team_logo_size + 'px')
                                                                                    .attr('xlink:href', function(d) {

                                                                                        return d.away_team_logo_url

                                                                                    });

    let game_home_team_logo = game_rows.append("svg:image")
                                                                                    .attr("id", "home_team_logo_img")
                                                                                    .attr('x', game_padding_dict.left + 17)
                                                                                    .attr('y',  game_padding_dict.top + away_top_padding - 9)
                                                                                    .attr('width', team_logo_size + 'px')
                                                                                    .attr('xlink:href', function(d) {

                                                                                        return d.home_team_logo_url

                                                                                    });
                
    let game_away_team_name_text = game_rows.append("text")
                                                .text(function(d) {
                                                    return d.away_team_short_name
                                                })
                                                .attr('x', game_padding_dict.left + team_logo_size + 28)
                                                .attr('y', game_padding_dict.top)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('fill', color_dict.med_gray)
                                                .style('font-size', team_name_font_size)
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_away_team_conference_text = game_rows.append('text')
                                                .text(function(d) {
                                                    return d.away_conference_name
                                                })
                                                .attr('x', game_padding_dict.left + team_logo_size + 28)
                                                .attr('y', game_padding_dict.top + 17)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('fill', color_dict.med_gray)
                                                .style('font-size', sub_text_size)
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');
    
    let game_home_team_name_text = game_rows.append('text')
                                                .text(function(d) {
                                                    return d.home_team_short_name
                                                })
                                                .attr('x', game_padding_dict.left + team_logo_size + 28)
                                                .attr('y', game_padding_dict.top + away_top_padding + 8)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'baseline')
                                                .attr('fill', color_dict.med_gray)
                                                .style('font-size', team_name_font_size)
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_home_team_conference_text = game_rows.append('text')
                                                .text(function(d) {
                                                    return d.home_conference_name
                                                })
                                                .attr('x', game_padding_dict.left + team_logo_size + 28)
                                                .attr('y', game_padding_dict.top + away_top_padding + 22)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'baseline')
                                                .attr('fill', color_dict.med_gray)
                                                .style('font-size', sub_text_size)
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');
        
    let score_padding_left = game_div_width < global_var_dict.mobile_screen_width ? 200 : 260;
    let team_score_font_size = game_div_width < global_var_dict.mobile_screen_width ? '16px' : '20px';

    let game_away_team_score = game_rows.append('text')
                                            .text(function(d) {

                                                if (d.away_team_score === "null") {
                                                    return ""
                                                } else {
                                                    return parseInt(d.away_team_score)
                                                }

                                            })
                                            .attr('x', score_padding_left)
                                            .attr('y', game_padding_dict.top + 5)
                                            .attr('id', function(d) {

                                                //Replace "/" with "_" in game_url
                                                let game_url = d.game_url.replace(/\//g, "_");

                                                return 'game_away_team_score' + game_url
                                            
                                            })
                                            .attr('text-anchor', 'middle')
                                            .attr('dominant-baseline', 'hanging')
                                            .attr('fill', color_dict.med_gray)
                                            .style('font-size', team_score_font_size)
                                            .style('font-weight', 500)
                                            
    let game_home_team_score = game_rows.append('text')
                                            .text(function(d) {
                                                
                                                if (d.home_team_score === "null") {
                                                    return ""
                                                } else {
                                                    return parseInt(d.home_team_score)
                                                }

                                            })
                                            .attr('x', score_padding_left)
                                            .attr('y', game_padding_dict.top + away_top_padding + 12)
                                            .attr('id', function(d) {

                                                //Replace "/" with "_" in game_url
                                                let game_url = d.game_url.replace(/\//g, "_");

                                                return 'game_home_team_score' + game_url

                                            })
                                            .attr('text-anchor', 'middle')
                                            .attr('dominant-baseline', 'baseline')
                                            .attr('fill', color_dict.med_gray)
                                            .style('font-size', team_score_font_size)
                                            .style('font-weight', 500)
                                            .style('font-family', 'Work Sans');

    let game_status_text = game_rows.append('text')
                                            .text(function(d) {

                                                return calcGameStatus(d);
                                                
                                            })
                                            .attr('x', score_padding_left)
                                            .attr('y', game_padding_dict.top + away_top_padding + 35)
                                            .attr('id', function(d) {

                                                //Replace "/" with "_" in game_url
                                                let game_url = d.game_url.replace(/\//g, "_");

                                                return 'game_status' + game_url;

                                            })
                                            .attr('text-anchor', 'middle')
                                            .attr('dominant-baseline', 'baseline')
                                            .attr('fill', color_dict.med_gray)
                                            .style('font-size', "14px")
                                            .style('font-family', 'Work Sans');

    let game_start_date_text = game_rows.append('text')
                                            .text(function(d) {

                                                //pull time and convert to local time from milatary time
                                                //date_str is in format YYYY-MM-DD HH:MM
                                                //If minutes == 0, display 00
                                                //Display browser timezone

                                                //Get browser timezone
                                                let browser_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                                                let date_str = d.start_date;
                                                // Parse the date string
                                                let date = new Date(date_str + ' EST');

                                                // Get the browser's timezone
                                                let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                                                // Format the local time
                                                let local_time = date.toLocaleString('en-US', {
                                                    hour: 'numeric',
                                                    minute: 'numeric',
                                                    hour12: true,
                                                    timeZone: timezone,
                                                    timeZoneName: 'short'
                                                });

                                                return local_time
                                                
                                            })
                                            .attr('x', game_padding_dict.left + team_logo_size)
                                            .attr('y', game_row_height - 15)
                                            .attr('text-anchor', 'start')
                                            .attr('dominant-baseline', 'baseline')
                                            .attr('fill', color_dict.med_gray)
                                            .style('font-size', '12px')
                                            .style('font-weight', 500)
                                            .style('font-family', 'Work Sans');
    
    let game_odds_left = game_div_width < global_var_dict.mobile_screen_width ? 230 : 350;
    let game_odds_top = 20;
    let game_odds_right_padding = game_div_width < global_var_dict.mobile_screen_width ? 20 : 40;
    let game_odds_width = game_div_width - game_odds_left - game_odds_right_padding;
    let game_odds_middle_padding = 4;
    let game_odds_height = game_row_height - (2 * game_odds_top) - 18;

    let game_odds_g = game_rows.append('g')
                                            .attr('id', function(d) {

                                                //get parent row index
                                                let parent_game_row_id = d3.select(this.parentNode).attr('id');
                                                let game_row_index = parent_game_row_id.split('_')[2];

                                                return 'game_odds_g_' + game_row_index;

                                            })
                                            .attr('transform', 'translate(' + game_odds_left + ',' + game_odds_top + ')');

    let game_odds_cols = ["Spread", "Total", "ML", "TT"];

    if (game_div_width < global_var_dict.mobile_screen_width) {

        game_odds_cols = ["Spread", "Total", "ML"];

    };

    let game_odds_col_width = (game_odds_width - ((game_odds_cols.length - 1) * game_odds_middle_padding)) / game_odds_cols.length;
    let game_odds_row_height = (game_odds_height - game_odds_middle_padding) / 2;

    let game_odds_col_g = game_odds_g.selectAll(".game_odds_col_g")
                                            .data(game_odds_cols)
                                            .enter()
                                            .append('g')
                                            .attr('class', 'game_odds_col_g')
                                            .attr('id', function(d) {

                                                //get parent row index
                                                let parent_game_row_id = d3.select(this.parentNode).attr('id');
                                                let game_row_index = parent_game_row_id.split('_')[3];

                                                return 'game_odds_col_g_' + game_row_index;

                                            })
                                            .attr('transform', function(d,i) {

                                                let x_value = i * (game_odds_col_width + game_odds_middle_padding);

                                                return 'translate(' + x_value + ',0)'

                                            });

    let game_odds_col_text = game_odds_col_g.append('text')
                                            .text(function(d) {

                                                return d

                                            })
                                            .attr('x', game_odds_col_width / 2)
                                            .attr('y', -5)
                                            .attr('text-anchor', 'middle')
                                            .attr('dominant-baseline', 'baseline')
                                            .attr('fill', color_dict.med_gray)
                                            .style('font-size', '10px')
                                            .style('font-weight', 700)
                                            .style('font-family', 'Work Sans');

    let game_odds_away_row_g = game_odds_col_g.append('g')
                                        .attr('class', 'game_odds_away_row_g')
                                        .attr("id", function(d, i) {

                                            //get parent row index
                                            let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');
                                            let game_row_index = parent_game_row_id.split('_')[3];

                                            return 'game_odds_away_row_g_' + game_row_index;

                                        });

    let game_odds_away_odds_g = game_odds_away_row_g.append('g')
                                        .attr('class', 'game_odds_away_odds_g')
                                        .attr('id', function(d, i) { 

                                            //Get parent game row id
                                            let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');

                                            //Get game row index
                                            let game_row_index = parent_game_row_id.split('_')[3];

                                            return 'game_odds_away_odds_g_' + game_row_index

                                        })
                                        .attr('transform', 'translate(0,0)');

    let game_odds_away_odds_bg = game_odds_away_odds_g.append('rect')
                                        .attr('width', game_odds_col_width)
                                        .attr('height', game_odds_row_height)
                                        .attr('fill', color_dict.black)
                                        .attr('rx', '5px')
                                        .attr('ry', '5px')
                                        .style('shape-rendering', 'CrispEdges');

    let formatDecimal1Place = d3.format(".1f");

    let game_odds_away_odds_text = game_odds_away_odds_g.append('text')
                                        .text(function(d, i) {

                                            let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');
                                            let game_row_index = parent_game_row_id.split('_')[5];

                                            if (i === 0) {
                                                
                                                let away_odds_spread = formatDecimal1Place(schedule_array[game_row_index]['consensus_pricing_dict']['away_fg_spread_consensus']);

                                                if (away_odds_spread > 0) {
                                                    return "+" + away_odds_spread
                                                } else {
                                                    return away_odds_spread
                                                }
                                  

                                            } else if (i === 1) {
                                                
                                                let game_total_line = formatDecimal1Place(schedule_array[game_row_index]['consensus_pricing_dict']['fg_total_points_consensus']);

                                                return game_total_line

                                            } else if (i === 2) {
                                                
                                                let away_win_prob = schedule_array[game_row_index]['consensus_pricing_dict']['away_fg_win_prob_consensus'];

                                                let away_odds_ml = convertWinProbToAmericanOdds(away_win_prob);

                                                if (away_odds_ml > 0) {
                                                    return "+" + away_odds_ml
                                                } else {
                                                    return away_odds_ml
                                                }

                                            } else if (i === 3) {

                                                let away_odds_spread = schedule_array[game_row_index]['consensus_pricing_dict']['away_fg_spread_consensus'];
                                                let game_total_line = schedule_array[game_row_index]['consensus_pricing_dict']['fg_total_points_consensus'];

                                                let away_team_total = formatDecimal1Place(calcTeamTotal(-away_odds_spread, game_total_line));

                                                return away_team_total

                                            }
                                        })
                                        .attr('id', function(d, i) {

                                            return 'game_odds_away_odds_text_' + i

                                        })
                                        .attr('x', game_odds_col_width / 2)
                                        .attr('y', game_odds_row_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('fill', color_dict.med_gray)
                                        .style('font-size', '12px')
                                        .style('font-weight', 700)
                                        .style('font-family', 'Work Sans');

    let game_odds_home_row_g = game_odds_col_g.append('g')
                                        .attr('class', 'game_odds_home_row_g')
                                        .attr("id", function(d, i) {
                                                
                                                //get parent row index
                                                let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');
                                                let game_row_index = parent_game_row_id.split('_')[3];
    
                                                return 'game_odds_home_row_g_' + game_row_index;
    
                                            })
                                        .attr('transform', 'translate(0,' + (game_odds_row_height + game_odds_middle_padding) + ')');
                                        
    let game_odds_home_odds_g = game_odds_home_row_g.append('g')
                                        .attr('class', 'game_odds_home_odds_g')
                                        .attr('id', function(d, i) {
                                                
                                                //Get parent game row id
                                                let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');
    
                                                //Get game row index
                                                let game_row_index = parent_game_row_id.split('_')[3];
    
                                                return 'game_odds_home_odds_g_' + game_row_index
    
                                        })
                                        .attr('transform', 'translate(0,0)');

    let game_odds_home_odds_bg = game_odds_home_odds_g.append('rect')
                                        .attr('width', game_odds_col_width)
                                        .attr('height', game_odds_row_height)
                                        .attr('fill', color_dict.black)
                                        .attr('rx', '5px')
                                        .attr('ry', '5px')
                                        .style('shape-rendering', 'CrispEdges');

    let game_odds_home_odds_text = game_odds_home_odds_g.append('text')
                                        .text(function(d, i) {

                                            let parent_game_row_id = d3.select(this.parentNode.parentNode).attr('id');
                                            let game_row_index = parent_game_row_id.split('_')[5];

                                            if (i === 0) {
                                                
                                                let home_odds_spread = formatDecimal1Place(schedule_array[game_row_index]['consensus_pricing_dict']['home_fg_spread_consensus']);

                                                if (home_odds_spread > 0) {
                                                    return "+" + home_odds_spread
                                                } else {
                                                    return home_odds_spread
                                                }
                                  
                                            } else if (i === 1) {
                                                
                                                let game_total_line = formatDecimal1Place(schedule_array[game_row_index]['consensus_pricing_dict']['fg_total_points_consensus']);

                                                return game_total_line

                                            } else if (i === 2) {
                                                
                                                let home_win_prob = schedule_array[game_row_index]['consensus_pricing_dict']['home_fg_win_prob_consensus'];

                                                let home_odds_ml = convertWinProbToAmericanOdds(home_win_prob);

                                                if (home_odds_ml > 0) {
                                                    return "+" + home_odds_ml
                                                } else {
                                                    return home_odds_ml
                                                }

                                            } else if (i === 3) {

                                                let home_odds_spread = schedule_array[game_row_index]['consensus_pricing_dict']['home_fg_spread_consensus'];
                                                let game_total_line = schedule_array[game_row_index]['consensus_pricing_dict']['fg_total_points_consensus'];

                                                let home_team_total = formatDecimal1Place(calcTeamTotal(-home_odds_spread, game_total_line));

                                                return home_team_total

                                            }
                                        })
                                        .attr('id', function(d, i) {

                                            return 'game_odds_home_odds_text_' + i

                                        })
                                        .attr('x', game_odds_col_width / 2)
                                        .attr('y', game_odds_row_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('fill', color_dict.med_gray)
                                        .style('font-size', '12px')
                                        .style('font-weight', 700)
                                        .style('font-family', 'Work Sans');

    let game_button_width = game_row_width > 550 ? 80 : 60;
    let game_button_height = game_row_width > 550 ? 23 : 20;
    let game_button_padding = 8;
    let game_button_left = game_odds_left + (game_odds_width / 2) - ((game_button_width * 3) + (game_button_padding * 2)) / 2;
    
    //Populate buttons if game_div_width > 450;

    if (game_div_width > 450) {

        let matchup_button_g = game_rows.append('g')
                                                .attr('id', function(d) {  
                                                    return 'matchup_button_' + d.game_url
                                                })
                                                .attr('transform', 'translate(' + game_button_left + ',' + (game_row_height - (game_button_height / 2) - 15) + ')' )
                                                .style('cursor', 'pointer')
                                                .on('click', function(d) {

                                                    launchGamePage(d.game_url);

                                                });

        let matchup_button_bg = matchup_button_g.append('rect')
                                                .attr('width', game_button_width)
                                                .attr('height', game_button_height)
                                                .attr('rx', '12px')
                                                .attr('ry', '12px')
                                                // .attr('stroke', color_dict.dark_gray)
                                                // .attr('stroke-width', '1px')
                                                .attr('fill', color_dict.orange)
                                                .style('shape-rendering', 'CrispEdges');

        let matchup_button_text = matchup_button_g.append('text')
                                                .text("Matchup")
                                                .attr('x', game_button_width / 2)
                                                .attr('y', game_button_height / 2)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('fill', color_dict.black)
                                                .style('font-size', '12px')
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');

        let ingame_button_g = game_rows.append('g')
                                                .attr('id', function(d) {
                                                    return 'ingame_button_' + d.game_url
                                                })
                                                .attr('transform', 'translate(' + (game_button_left + game_button_width + game_button_padding) + ',' + (game_row_height - (game_button_height / 2) - 15) + ')' )
                                                .style('cursor', 'not-allowed');

        let ingame_button_bg = ingame_button_g.append('rect')
                                                .attr('width', game_button_width)
                                                .attr('height', game_button_height)
                                                .attr('rx', '12px')
                                                .attr('ry', '12px')
                                                .attr('stroke', color_dict.dark_gray)
                                                .attr('stroke-width', '1px')
                                                .attr('fill', color_dict.dark_gray)
                                                .style('shape-rendering', 'CrispEdges');

        let ingame_button_text = ingame_button_g.append('text')
                                                .text("Ingame")
                                                .attr('x', game_button_width / 2)
                                                .attr('y', game_button_height / 2)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('fill', color_dict.black)
                                                .style('font-size', '12px')
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');

        let recap_button_g = game_rows.append('g')
                                                .attr('id', function(d) {
                                                    return 'recap_button_' + d.game_url
                                                })
                                                .attr('transform', 'translate(' + (game_button_left + (game_button_width * 2) + (game_button_padding * 2)) + ',' + (game_row_height - (game_button_height / 2) - 15) + ')' )
                                                .style('cursor', 'not-allowed');

        let recap_button_bg = recap_button_g.append('rect')
                                                .attr('width', game_button_width)
                                                .attr('height', game_button_height)
                                                .attr('rx', '12px')
                                                .attr('ry', '12px')
                                                // .attr('stroke', color_dict.dark_gray)
                                                // .attr('stroke-width', '1px')
                                                .attr('fill', color_dict.dark_gray)
                                                .style('shape-rendering', 'CrispEdges');

        let recap_button_text = recap_button_g.append('text')
                                                .text("Recap")
                                                .attr('x', game_button_width / 2)
                                                .attr('y', game_button_height / 2)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('fill', color_dict.black)
                                                .style('font-size', '12px')
                                                .style('font-weight', 500)
                                                .style('font-family', 'Work Sans');
    }
}

function populateDateSelector() {

    let game_filter_svg = d3.select("#game_filter_svg");
    let game_filter_width = game_filter_svg.node().getBoundingClientRect().width;
    let game_filter_height = game_filter_svg.node().getBoundingClientRect().height;

    //Number of games to display on either side of the  currently selected day
    let num_days_to_display = game_filter_width < global_var_dict.mobile_screen_width ? 1 : 2;
    let arrow_select_width = 30;

    let date_padding_dict = {
        left: 20,
        right: 20,
        top: 0,
        bottom: 30,
    };

    let game_date_select_height = game_filter_height;
    let game_date_select_width = (game_filter_width - (2 * arrow_select_width) - date_padding_dict.left - date_padding_dict.right) / (num_days_to_display * 2 + 1);

    //Populate Date Arrow Selectors
    let left_arrow_select_g =  game_filter_svg.append('g')
                                                                            .attr('id', 'game_date_left_arrow_select_g')
                                                                            .attr('transform', 'translate(' + date_padding_dict.left + ',' + date_padding_dict.top + ')')
                                                                            .attr('cursor', 'pointer')
                                                                            .on('click', function(d) {

                                                                                //set global schedule date
                                                                                let clicked_date_index = global_var_dict.games_for_day.findIndex(dict => dict.day_start_date === global_var_dict.schedule_date_str);
                                                                                let schedule_date_index = clicked_date_index > 0 ? clicked_date_index - 1 : 0;

                                                                                global_var_dict.schedule_date_str = global_var_dict.games_for_day[schedule_date_index].day_start_date;

                                                                                //Remove all currently displayed game g's
                                                                                d3.selectAll(".display_game_dates_g").remove();

                                                                                populateDateSelector();
                                                                                sendLoadGamesReq();

                                                                            });

    let left_arrow_select_bg = left_arrow_select_g.append('rect')
                                                                            .attr('cx', arrow_select_width)
                                                                            .attr('cy', game_date_select_height / 2)
                                                                            .attr('r', 18)
                                                                            .attr('fill', color_dict.dark_bg)
                                                                            .style('shape-rendering', 'CrispEdges');

    let left_arrow_select_chevron = left_arrow_select_g.append('text')
                                                                            .text(function() {return '\uf053'})
                                                                            .attr('class', 'font_awesome_text_icon')
                                                                            .attr('font-size', '18px')
                                                                            .style('font-weight', 300)
                                                                            .attr('fill', color_dict.dark_gray)
                                                                            .attr('x', arrow_select_width / 2)
                                                                            .attr('y', game_date_select_height / 2)
                                                                            .attr('text-anchor', 'middle')
                                                                            .attr('dominant-baseline', 'middle');
    
    let right_arrow_select_g =  game_filter_svg.append('g')
                                                                            .attr('id', 'game_date_right_arrow_select_g')
                                                                            .attr('transform', 'translate(' + (game_filter_width - date_padding_dict.right - arrow_select_width) + ',' + date_padding_dict.top + ')')
                                                                            .attr('cursor', 'pointer')
                                                                            .on('click', function() {

                                                                                 //set global schedule date
                                                                                 let clicked_date_index = global_var_dict.games_for_day.findIndex(dict => dict.day_start_date === global_var_dict.schedule_date_str);
                                                                                 let schedule_date_index = global_var_dict.games_for_day.length > 0 ? clicked_date_index + 1 : global_var_dict.games_for_day.length;
 
                                                                                 global_var_dict.schedule_date_str = global_var_dict.games_for_day[schedule_date_index].day_start_date;
 
                                                                                 //Remove all currently displayed game g's
                                                                                 d3.selectAll(".display_game_dates_g").remove();
 
                                                                                 populateDateSelector();
                                                                                 sendLoadGamesReq();

                                                                            })
    
    let right_arrow_select_bg = right_arrow_select_g.append('circle')
                                                                            .attr('cx', arrow_select_width)
                                                                            .attr('cy', game_date_select_height / 2)
                                                                            .attr('r', 18)
                                                                            .attr('fill', color_dict.dark_bg)
                                                                            .style('shape-rendering', 'CrispEdges');

    let right_arrow_select_chevron = right_arrow_select_g.append('text')
                                                                            .text(function() {return '\uf054'})
                                                                            .attr('class', 'font_awesome_text_icon')
                                                                            .attr('font-size', '18px')
                                                                            .style('font-weight', 300)
                                                                            .attr('fill', color_dict.dark_gray)
                                                                            .attr('x', arrow_select_width)
                                                                            .attr('y', game_date_select_height / 2)
                                                                            .attr('text-anchor', 'middle')
                                                                            .attr('dominant-baseline', 'middle');

    //Populate Game Dates
    //Create subset of game dates based on currently selected dates
    let selected_date_index = global_var_dict.games_for_day.findIndex(dict => dict.day_start_date === global_var_dict.schedule_date_str);

    let start_date_index = Math.max(0, selected_date_index - num_days_to_display);
    let end_date_index = Math.min(global_var_dict.games_for_day.length, selected_date_index + num_days_to_display);

    let display_games_dates_array = global_var_dict.games_for_day.slice(start_date_index, end_date_index + 1);

    if (display_games_dates_array.length === 0) {

        console.log("No Games for Selected Date");

        //If no games for selected date, display no games message
        let no_games_text = d3.select("#game_div").append('h3')
                                                    .text("No Games Today")
                                                    .attr('fill', color_dict.dark_gray)
                                                    .attr("width", "100%")
                                                    .style('font-size', '22px')
                                                    .style('font-weight', 500)
                                                    .style('font-family', 'Work Sans')
                                                    .style("text-align", "center")
                                                    .style("margin-top", "80px");

        return
    };

    //Add Game Rects
    let display_game_dates_g = game_filter_svg.selectAll(".display_game_dates_g")
                                                                            .data(display_games_dates_array)
                                                                            .enter()
                                                                            .append('g')
                                                                            .attr('id', function(d,i) {return 'display_game_dates_' + i})
                                                                            .attr('transform', function(d,i) {

                                                                                let x_value = date_padding_dict.left + arrow_select_width + (i * game_date_select_width);

                                                                                return 'translate(' + x_value + ',' + date_padding_dict.top + ')'

                                                                            })
                                                                            .attr('cursor', 'pointer')
                                                                            .on('click', function(d) {

                                                                                //Only if date not already selected
                                                                                if (d.day_start_date !== global_var_dict.schedule_date_str) {

                                                                                    //set global schedule date
                                                                                    let clicked_date_index = global_var_dict.games_for_day.findIndex(dict => dict.day_start_date === d.day_start_date);
                                                                                    global_var_dict.schedule_date_str = global_var_dict.games_for_day[clicked_date_index].day_start_date;
    
                                                                                    //Remove all currently displayed game g's
                                                                                    d3.selectAll(".display_game_dates_g").remove();
    
                                                                                    populateDateSelector();
                                                                                    sendLoadGamesReq();

                                                                                }
                                                                            });

    let display_game_dates_bg = display_game_dates_g.append('rect')
                                                                            .attr('x', 0)
                                                                            .attr('y', 0)
                                                                            .attr('width', game_date_select_width)
                                                                            .attr('height', game_date_select_height)
                                                                            .attr('fill', function(d) {

                                                                                if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                    return color_dict.black
                                                                                } else {
                                                                                    return color_dict.dark_bg
                                                                                }

                                                                            })
                                                                            .attr("rx", "15px")
                                                                            .attr("ry", "15px")
                                                                            .style('shape-rendering', 'CrispEdges')
                                                                            .style('box-sizing', 'border-box');
                                                                        
    let display_game_dates_date_text = display_game_dates_g.append('text')
                                                                                .text(function(d) {
                                                                                    
                                                                                    //format date m/d no leading 0s
                                                                                    let date_split = d.day_start_date.split('-');
                                                                                    let month = parseInt(date_split[1]);
                                                                                    let day = parseInt(date_split[2]);
                                                                                    let year = date_split[0];

                                                                                    return month + '/' + day + '/' + year.slice(2,4)
                                                                                
                                                                                })
                                                                                .attr('x', game_date_select_width / 2)
                                                                                .attr('y', 7)
                                                                                .attr('text-anchor', 'middle')
                                                                                .attr('dominant-baseline', 'hanging')
                                                                                .attr('font-size', function(d) {

                                                                                    if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                        return "14px"
                                                                                    } else {
                                                                                        return "12px"
                                                                                    }

                                                                                })
                                                                                .attr("fill", color_dict.dark_gray)
                                                                                .attr('font-weight', function(d) {

                                                                                    if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                        return 500
                                                                                    } else {
                                                                                        return 300
                                                                                    }

                                                                                })
                                                                                .style('font-family', 'Work Sans');

    let display_game_dates_weekday_text = display_game_dates_g.append('text')
                                                                                        .text(function(d) {return d.game_weekday})
                                                                                        .attr('x', game_date_select_width / 2)
                                                                                        .attr('y', game_date_select_height - 7)
                                                                                        .attr('text-anchor', 'middle')
                                                                                        .attr('dominant-baseline', 'baseline')
                                                                                        .attr('font-size', function(d) {

                                                                                            if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                                return "14px"
                                                                                            } else {
                                                                                                return "12px"
                                                                                            }

                                                                                        })
                                                                                        .attr("fill", color_dict.dark_gray)
                                                                                        .attr('font-weight', function(d) {

                                                                                            if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                                return 500
                                                                                            } else {
                                                                                                return 300
                                                                                            }

                                                                                        })
                                                                                        .style('font-family', 'Work Sans');

    let display_game_dates_game_count_text = display_game_dates_g.append('text')
                                                                                    .text(function(d) {
                                                                                        return d.game_count + " games"
                                                                                    })
                                                                                    .attr('x', game_date_select_width / 2)
                                                                                    .attr('y', game_date_select_height / 2)
                                                                                    .attr('text-anchor', 'middle')
                                                                                    .attr('dominant-baseline', 'middle')
                                                                                    .attr('font-size', function(d) {

                                                                                        if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                            return "14px"
                                                                                        } else {
                                                                                            return "12px"
                                                                                        }

                                                                                    })
                                                                                    .attr("fill", function(d) {

                                                                                        if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                            return color_dict.med_gray
                                                                                        } else {
                                                                                            return color_dict.dark_gray
                                                                                        }

                                                                                    })
                                                                                    .attr('font-weight', function(d) {

                                                                                        if (d.day_start_date === global_var_dict.schedule_date_str) {
                                                                                            return 500
                                                                                        } else {
                                                                                            return 300
                                                                                        }

                                                                                    })
                                                                                    .style('font-family', 'Work Sans');
                                                                            
}

function populateGameFilter() {

    //Append SVG
    let game_filter_div = d3.select("#game_filter_div");
    let game_filter_width = game_filter_div.node().getBoundingClientRect().width;
    let game_filter_height = game_filter_div.node().getBoundingClientRect().height;

    let game_filter_svg = game_filter_div.append('svg')
                                                                    .attr('id', 'game_filter_svg')
                                                                    .attr('width', game_filter_width)
                                                                    .attr('height', game_filter_height);

    //Populate Depending on Filter Type
    if (global_var_dict['game_filter_type'] == 'date') {
        populateDateSelector()
    }

}

function updateGameState(game_state_dict) {

    let game_url = game_state_dict['game_url'];

    //Replace "/" with "_" in game_url
    game_url = game_url.replace(/\//g, "_");

    let away_team_score_id = '#game_away_team_score' + game_url;
    let home_team_score_id = '#game_home_team_score' + game_url;
    let game_status_id = '#game_status' + game_url;

    let away_team_score = game_state_dict['away_team_score'];
    let home_team_score = game_state_dict['home_team_score'];

    if (away_team_score !== "null") {
        d3.select(away_team_score_id).text(away_team_score);
    }

    if (home_team_score !== "null") {
        d3.select(home_team_score_id).text(home_team_score);
    }

    let game_status = calcGameStatus(game_state_dict);

    if (game_status !== "null") {
        d3.select(game_status_id).text(game_status);
    }

}

function startWebSocket() {
    ws_conn = new WebSocket('wss://api.untouted.com');
    console.log("Websocket Connected.");

    ws_conn.onmessage = function incoming(event) {

        let resp_dict = JSON.parse(event.data);
        let resp_type = resp_dict['resp_type'];

        console.log(resp_dict)

        if (resp_type == "load_games") {

            global_var_dict['schedule_array'] = resp_dict['data'];
            populateSchedule(resp_dict['data']);

        }

        else if (resp_type == "games_for_day") {

            global_var_dict['games_for_day'] = resp_dict['data'];
            console.log("games_for_day =>", resp_dict);
            populateGameFilter()
        }

        else if (resp_type == "game_state_update") {

            console.log("game_state_update =>", resp_dict);
            updateGameState(resp_dict['data']);

        }

    }

    ws_conn.onclose = function() {
        ws_conn = null;
        console.log("Websocket Disconnected")
        setTimeout(startWebSocket, 500);
    }
}

// Handle browser resize
let APP = (function () {

    // Debounce is a private function
      function debounce(func, wait, immediate) {
          let timeout;
          return function() {
              let context = this, args = arguments;
              clearTimeout(timeout);
              timeout = setTimeout(function() {
                  timeout = null;
                  if (!immediate) func.apply(context, args);
              }, wait);
              if (immediate && !timeout) func.apply(context, args);
          };
      }
  
    // onResize function is made public
      let me = {onResize : function(callback) {
          callback(); // optionally execute callback func imediatly
      
      window.addEventListener('resize', debounce(function() {

        console.log("Resized browser");

        callback();
      }, 100), false);
      }};
  
    // returns the me object that has all the public functions in it
      return me;
  })();
  

startWebSocket();

setTimeout(function() {

    let init_game_req_dict = {
        user_email: logged_in_user.email,
        req_type: "load_games",
        params: {
            "schedule_date_str": global_var_dict['schedule_date_str'],
        }
    };

    let init_games_for_day_req_dict = {
        user_email: logged_in_user.email,
        req_type: "return_games_for_day",
        params: {
            "season": 2024,
        }
    };
    
    ws_conn.send(JSON.stringify(init_game_req_dict));
    ws_conn.send(JSON.stringify(init_games_for_day_req_dict));

    APP.onResize(function() {

        //Remove all elements from game_filter_div and game_div
        d3.select("#game_filter_div").selectAll("*").remove();
        d3.select("#game_div").selectAll("*").remove();

        if (global_var_dict['schedule_array'].length > 0) {
            populateGameFilter();
            populateSchedule(global_var_dict['schedule_array']);
        }
    })
}, 2000);
