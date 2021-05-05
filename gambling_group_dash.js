//Create globlal vars
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

var ws_conn, team_stats_domain_data, team_stat_data, game_details_data;

let color_dict = {black: '#000', 'white': '#fff', 'gray_bg': '#ebebeb', red: '#f55e5e',
                 med_gray: '#c0c0c0', dark_gray: '#777', transparent: 'rgba(0,0,0,0)',
                 transparent_white: 'rgba(255,255,255,.85)',
                 away_team_color: '#fff', home_team_color: '#fff',
                 away_points_diff: '#ffabab', home_points_diff: '#ad4444',
                 away_num_drives_diff: '#73eaf5', home_num_drives_diff: '#469ea6',
                 away_num_plays_diff: '#99de5b', home_num_plays_diff: '#589621',
                 away_rush_epa_diff: '#cab2d6', home_rush_epa_diff: '#805d91',
                 away_pass_epa_diff: '#fcd8b3', home_pass_epa_diff: '#de7c1b',
                 away_epa_diff: '#c7c7c7', home_epa_diff: '#757575',
                 away_rush_yards_diff: '#c9ae9f', home_rush_yards_diff: '#7d5d4c',
                 away_pass_yards_diff: '#cc9ffc', home_pass_yards_diff: '#9636ff',
                 away_total_yards_diff: '#fc9feb', home_total_yards_diff: '#b35791',
                 away_rush_att_diff: '#0ee395', home_rush_att_diff: '#096644',
                 away_pass_att_diff: '#c284b4', home_pass_att_diff: '#4f0a40',
                 away_pass_comp_diff: '#4080ff', home_pass_comp_diff: '#003294',
                 away_sacks_diff: '#d99c9c', home_sacks_diff: '#872a2a',
                 away_turnover_diff: '#ff5ca2', home_turnover_diff: '#940040',
                 away_total_penalties_diff: '#d6f06c', home_total_penalties_diff: '#768f11',
                 away_total_penalty_yards_diff: '#dbd57d', home_total_penalty_yards_diff: '#9e9400',
                 away_plays_10_yards_plus_diff: '#94ffe6', home_plays_10_yards_plus_diff: '#00e6b0',
                 away_plays_20_yards_plus_diff: '#faa134', home_plays_20_yards_plus_diff: '#994000',
                 away_plays_40_yards_plus_diff: '#ff9c9c', home_plays_40_yards_plus_diff: '#ff0000',
                 away_first_downs_diff: '#9c9868', home_first_downs_diff: '#4f4a0a',
                 away_red_zone_count_diff: '#8f8578', home_red_zone_count_diff: '#544128'
                };

//Button clicked switches game chart loads first
let game_chart_selected = 1;
let team_stats_selected = 0;
let schedule_season = 2020;
let schedule_week = 'P';


//Initial Chart Parameters
let chart_margin = {left: 40, top: 0, right: 40, bottom: 120};
let chart_title_margin = {left: 0, top: 40, right: 0, bottom: 10};
let chart_title_height = 40;
let chart_title_button_data = [];
let chart_title_button_spacing = 0
let chart_title_button_width = 170;
let chart_title_button_height = 25;
let chart_sidebar_width = 100;
let chart_sidebar_button_height = 35;
let chart_sidebar_highlight_height = 14;
let chart_sidebar_highlight_width = 5;
let chart_sidebar_padding = 40;
let chart_sidebar_button_top_padding = 5;
let chart_title_button_text_font_size = '16px';
let chart_sidebar_button_font_size = '14px';


//Init dict to handle sidebar clicks on/off
let team_stat_order_dict = {};
let chart_display_dict = {team_stats: 1}    
let dummy_chart_sidebar_data = {};
let team_stats_display_dict = {
                        team_score: 'Points',
                        points_quarter_1: 'Points Q1', 
                        points_quarter_2: 'Points Q2', 
                        points_quarter_3: 'Points Q3', 
                        points_quarter_4: 'Points Q4', 
                        sacks: 'Sacks', 
                        sack_yards: 'Sack Yards', 
                        fumbles: 'Fumbles',
                        fumbles_lost: 'Fumbles Lost',
                        third_down_conv: '3rd Down Conv', 
                        rush_att: 'Rush Att', 
                        rush_yards: 'Rush Yards', 
                        rush_td: 'Rush TDs', 
                        pass_att: 'Pass Att', 
                        pass_comp: 'Pass Comp', 
                        pass_yards: 'Pass Yds', 
                        pass_td: 'Pass TDs',
                        ints: 'Ints', 
                        punts: 'Punts', 
                        punt_avg_yards: 'Avg Punt Yards', 
                        punt_longest: 'Longest Punt', 
                        penalties: 'Penalties', 
                        penalty_yards: 'Penalty Yards', 
                        total_td: 'Total TD', 
                        time_of_poss: 'Time of Poss', 
                        first_downs: 'First Downs', 
                        passer_rating: 'Passer Rating', 
                        fourth_down_conv: '4th Down Conv', 
                        fg_made: 'FG Made', 
                        fg_att: 'FG Att', 
                        fg_percent: 'FG Made %', 
                        rz_conv_percent: 'RZ Conv %', 
                        def_tds: 'Def Tds', 
                        safeties: 'Safeties', 
                        turnovers: 'Turnovers',
                        total_yards: 'Total Yards'
}

//create alphabetical list of team stats
let alpha_team_stats_array = [];
let team_stats_display_keys = Object.keys(team_stats_display_dict);
for (var i = 0; i < team_stats_display_keys.length; i++) {

    alpha_team_stats_array.push(team_stats_display_dict[team_stats_display_keys[i]]);
}

alpha_team_stats_array.sort();

let final_team_stats_alpha_array = []

for (var i = 0; i < alpha_team_stats_array.length; i++ ){

    let display_name = alpha_team_stats_array[i];

    for (var z = 0; z < team_stats_display_keys.length; z++) {
        
        let temp_display_name = team_stats_display_dict[team_stats_display_keys[z]]
        let temp_team_stat_name = team_stats_display_keys[z];

        if (display_name === temp_display_name) {

            final_team_stats_alpha_array.push({display_name: display_name, team_stat_name: temp_team_stat_name})
        }

    }   
}   

console.log(final_team_stats_alpha_array);
//List categories that load clicked
let preclicked_team_stats = ['team_score', 'rush_att', 'rush_yards', 'pass_att', 'pass_comp', 'pass_yards',
                            'total_yards', 'passer_rating', 'points_quarter_1', 'points_quarter_2', 'points_quarter_3',
                            'points_quarter_4'];

for (var i = 0; i < preclicked_team_stats.length; i++ ) {

    let preclicked_team_stat = preclicked_team_stats[i];

    team_stat_order_dict[i] = preclicked_team_stat;

}


let domain_dict = {
    away_points_diff: 40, home_points_diff: 40,
    away_num_drives_diff: 5, home_num_drives_diff: 5,
    away_num_plays_diff: 30, home_num_plays_diff: 30,
    away_rush_epa_diff: 25, home_rush_epa_diff: 25,
    away_pass_epa_diff: 25, home_pass_epa_diff: 25,
    away_epa_diff: 35, home_epa_diff: 35,
    away_rush_yards_diff: 200, home_rush_yards_diff: 200,
    away_pass_yards_diff: 300, home_pass_yards_diff: 300,
    away_total_yards_diff: 400, home_total_yards_diff: 400,
    away_rush_att_diff: 20, home_rush_att_diff: 20,
    away_pass_att_diff: 25, home_pass_att_diff: 25,
    away_pass_comp_diff: 20, home_pass_comp_diff: 20,
    away_sacks_diff: 6, home_sacks_diff: 6,
    away_turnover_diff: 4, home_turnover_diff: 4,
    away_total_penalties_diff: 5, home_total_penalties_diff: 5,
    away_total_penalty_yards_diff: 50, home_total_penalty_yards_diff: 50,
    away_plays_10_yards_plus_diff: 15, home_plays_10_yards_plus_diff: 15,
    away_plays_20_yards_plus_diff: 10, home_plays_20_yards_plus_diff: 10,
    away_plays_40_yards_plus_diff: 4, home_plays_40_yards_plus_diff: 4,
    away_first_downs_diff: 20, home_first_downs_diff: 20,
    away_red_zone_count_diff: 10, home_red_zone_count_diff: 10
}


function repositionVizElements() {
    

}

function closeGameSelectorDiv() {
    
    let open_button_chevron = d3.select('#game_selector_open_button_chevron');
    let game_selector_div = d3.select('#game_selector_div');
    let game_selector_svg = d3.select('#game_selector_svg');
    let game_details_height = d3.select('#game_details_contents').node().getBoundingClientRect().height;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let game_selector_svg_height = 22;
                                            
                                            
    if (open_button_chevron.attr('closed') == 1) {
        game_selector_div.transition().duration(300)
            .style('height', height + 'px');

        game_selector_svg.transition().duration(300)
            .attr('height', height - game_details_height);

        open_button_chevron.text('\uf00d')
            .attr('fill', color_dict.red)
            .attr('font-size', '16px');


        open_button_chevron.attr('closed', 0);

        d3.selectAll('#game_selector_season_g, #game_selector_week_g, #game_selector_results_g')
            .attr('visibility', 'visible');

    } else {


        game_selector_div.transition().duration(300)
            .style('height', '167px');

        game_selector_svg.transition().duration(300)
            .attr('height', game_selector_svg_height);

        open_button_chevron.text('\uf078')
            .attr('fill', color_dict.black)
            .attr('font-size', '12px');

        open_button_chevron.attr('closed', 1);  

        d3.selectAll('#game_selector_season_g, #game_selector_week_g, #game_selector_results_g')
            .attr('visibility', 'hidden');


    }
}

///Game Details Functions
function drawGameDetails(game_details_data, game_details) {
    game_details_data = game_details_data;
    
    let game_details_width = d3.select('#game_details_contents').node().getBoundingClientRect().width;
    let game_details_height = d3.select('#game_details_contents').node().getBoundingClientRect().height
    let game_status_padding = 5;
    let navbar_height = game_details == 1 ? d3.select('#navbar').node().getBoundingClientRect().height: -100;

    var game_details_svg;

    if (game_details === 1) {

        game_details_svg = d3.select('#game_details_contents')
                                    .append('svg')
                                        .attr('id', 'game_details_svg')
                                        .attr('width', '100%')
                                        .attr('height', '100%');
    } else {

        game_details_svg = d3.select('#chart_svg');
                           
    }
    
    let game_status_font_size = '16px';

    let game_details_content_g = game_details_svg.append('g')
                                    .attr('id', 'game_details_content_g')

    let game_status_text = game_details_content_g.append('text')
                                    .text(game_details_data.game_status)
                                    .attr('id', 'game_status_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2)
                                    .attr('y', (game_details_height - navbar_height) / 2 + navbar_height + 15)
                                    .style('dominant-baseline', 'hanging')
                                    .style('text-anchor', 'middle')
                                    .style('font-size', game_status_font_size)
                                    .style('font-weight', 500)
                                    .style('fill', color_dict.black);
    
    
    let game_details_font_size = '14px';
    
    let game_date_text = game_details_content_g.append('text')
                                    .text(game_details_data.game_date)
                                    .attr('id', 'game_date_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2)
                                    .attr('y', navbar_height + 10)
                                    .style('text-anchor', 'middle')
                                    .style('dominant-baseline', 'hanging')
                                    .style('font-size', game_details_font_size)
                                    .style('fill', color_dict.dark_gray);
    
    let game_betting_font_size = '14px';
    let game_score_offset = 100;
    
    let game_ou_text = game_details_content_g.append('text')
                                    .text('o/u ' + game_details_data.game_ou)
                                    .attr('id', 'game_ou_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2)
                                    .attr('y', game_details_height - 13)
                                    .attr('text-anchor', 'middle')
                                    .style('dominant-baseline', 'hanging')
                                    .attr('font-size', game_betting_font_size)
                                    .attr('fill', color_dict.dark_gray);
    
    let game_spread_text = game_details_content_g.selectAll('.game_spread_text')
                                    .data(game_details_data.spreads)
                                    .enter()
                                    .append('text')
                                    .text(function(d) {return d})
                                    .attr('id', function(d,i) {
                                        if (i == 0) {
                                            return 'game_away_spread_text'
                                        } else {
                                            return 'game_home_spread_text'
                                            }
                                        })
                                    .attr('x', function(d, i) {
                                        if (i == 0) {
                                            return (game_details_width / 2) - game_score_offset
                                        } else {
                                            return (game_details_width / 2) + game_score_offset
                                            }
                                        })
                                    .attr('class', 'game_spread_text')
                                    .attr('y', game_details_height - 13)
                                    .attr('font-size', game_betting_font_size)
                                    .attr('text-anchor', 'middle')
                                    .style('dominant-baseline', 'hanging')
                                    .attr('fill', color_dict.dark_gray)
                                    .attr('font-weight', 100);
    
    let game_pregame_line_text = game_details_content_g.append('text')
                                    .text('Closing Lines')
                                    .attr('id', 'game_pregame_line_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2 - game_score_offset - 30)
                                    .attr('y', game_details_height - 10)
                                    .attr('text-anchor', 'end')
                                    .style('dominant-baseline', 'hanging')
                                    .attr('font-size', '10px')
                                    .attr('font-weight', 100)
                                    .attr('fill', color_dict.med_gray);
    
    
    
    
    let game_scores_font_size = '48px';
    let game_score_text = game_details_content_g.selectAll('.game_status_score_text')
                                    .data(game_details_data.team_scores)
                                    .enter()
                                    .append('text')
                                    .text(function(d) {return d})
                                    .attr('id', function(d,i) {
                                        if (i == 0) {
                                            return 'game_away_score_text'
                                        } else {
                                            return 'game_home_score_text'
                                        }
                                            })
                                    .attr('class', 'game_status_score_text')
                                    .attr('x', function(d, i) {
                                        if (i == 0) {
                                            return (game_details_width / 2) - game_score_offset
                                        } else {
                                            return (game_details_width / 2) + game_score_offset
                                            }
                                        })
                                    .attr('y', (game_details_height - navbar_height) / 2 + navbar_height)
                                    .attr('font-size', game_scores_font_size)
                                    .style('font-weight', 100)
                                    .style('dominant-baseline', 'middle')
                                    .style('text-anchor', 'middle');
    
    if (game_details == 1) {
            let game_logo_offset = 350;
            let game_logo_height = 70;
            let game_logo_logos = game_details_content_g.selectAll('.game_details_logos')
                                            .data(game_details_data.team_logos)
                                            .enter()
                                            .append('svg:image')
                                            .attr('id', function(d, i) {
                                                if (i == 0) {
                                                    return 'game_away_logo'
                                                } else {
                                                    return 'game_home_logo'
                                                }
                                                
                                            })
                                            .attr('x', function(d, i) {
                                                if (i == 0) {
                                                    return (game_details_width / 2) - game_logo_offset 
                                                } else {
                                                    return (game_details_width / 2) + game_logo_offset
                                                    }
                                                })
                                            .attr('y', (game_details_height - navbar_height) / 2 + navbar_height - (game_logo_height / 2))
                                            .attr('height', game_logo_height)
                                            .attr('width', game_logo_height)
                                            .attr('xlink:href', function(d) {return d});
            

            
            
            
            //Calc width of logos to transform to center for spacing
            let away_logo_width = d3.select('#game_away_logo').node().getBoundingClientRect().width;
            let home_logo_width = d3.select('#game_home_logo').node().getBoundingClientRect().width;
            
            d3.select('#game_away_logo')
                .attr('transform', 'translate(' + (-1 * (away_logo_width / 2)) + ',0)')
            
            d3.select('#game_home_logo')
                .attr('transform', 'translate(' + (-1 * (home_logo_width / 2)) + ',0)')
    }


    let team_name_padding = 10;
    let away_team_bbox = d3.select('#game_away_logo').node().getBBox()
    let home_team_bbox = d3.select('#game_home_logo').node().getBBox()

    let away_logo_width = d3.select('#game_away_logo').node().getBoundingClientRect().width;
    let home_logo_width = d3.select('#game_home_logo').node().getBoundingClientRect().width;

    let away_team_name_x = away_team_bbox.x + away_team_bbox.width + team_name_padding;
    let home_team_name_x = home_team_bbox.x - team_name_padding;
    let team_loc_font_size = '18px';
    let team_name_font_size = '14px';
    let team_name_spacing = 8;

    let game_team_locs = game_details_content_g.selectAll('.game_details_team_names')
                                    .data(game_details_data.team_locs)
                                    .enter()
                                    .append('text')
                                    .text(function(d) {return d})
                                    .attr('id', function(d,i) {
                                        if (i == 0) {
                                            return 'game_away_team_loc'
                                        } else {
                                            return 'game_home_team_loc'
                                        }
                                    })
                                    .attr('x', function(d,i) {
                                        if (i == 0) {
                                            return away_team_name_x
                                        } else {
                                            return home_team_name_x
                                        }
                                    })
                                    .attr('transform', function(d,i) {
                                        if (i == 0) {
                                            return 'translate(' + (-1 * (away_logo_width / 2)) + ',0)'
                                        } else {
                                            return 'translate(' + (-1 * (home_logo_width / 2)) + ',0)'
                                        }
                                    })
                                    .attr('class', 'game_team_locs')
                                    .attr('y', (game_details_height - navbar_height) / 2 + navbar_height - (team_name_spacing / 2))
                                    .attr('font-size', team_loc_font_size)
                                    .style('font-weight', 700)
                                    .style('dominant-baseline', 'auto')
                                    .style('text-anchor', function(d,i) {
                                        if (i == 0) {
                                            return 'start'
                                        } else {
                                            return 'end'
                                        }
                                    });
    
    let game_team_names = game_details_content_g.selectAll('.game_details_team_names')
                                    .data(game_details_data.team_names)
                                    .enter()
                                    .append('text')
                                    .text(function(d) {return d})
                                    .attr('id', function(d,i) {
                                        

                                        if (i == 0) {
                                            return 'game_away_team_name'
                                        } else {
                                            return 'game_home_team_name'
                                        }
                                        })
                                    .attr('x', function(d, i) {
                                        if (i == 0) {
                                            return away_team_name_x
                                        } else {
                                            return home_team_name_x
                                            }
                                        })
                                    .attr('transform', function(d,i) {
                                        if (i == 0) {
                                            return 'translate(' + (-1 * (away_logo_width / 2)) + ',0)'
                                        } else {
                                            return 'translate(' + (-1 * (home_logo_width / 2)) + ',0)'
                                        }
                                    })
                                    .attr('class', 'game_team_names')
                                    .attr('y', (game_details_height - navbar_height) / 2 + navbar_height + (team_name_spacing / 2))
                                    .attr('font-size', team_name_font_size)
                                    .style('font-weight', 300)
                                    .style('dominant-baseline', 'hanging')
                                    .style('text-anchor', function(d, i) {
                                        if (i == 0) {
                                            return 'start'
                                        } else {
                                            return 'end'
                                        }
                                    })
    }

//Draw Game selector

function drawGameSelector() {
    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let game_details_width = d3.select('#game_details_contents').node().getBoundingClientRect().width;
    let game_details_height = d3.select('#game_details_contents').node().getBoundingClientRect().height;
    let game_details_left = d3.select('#game_details_contents').node().getBoundingClientRect().left;
    let game_selector_svg_height = 22;
    let game_selector_button_width = 100;
    let game_selector_button_height = 20;
    let game_selector_button_padding = 10;
    
    let game_selector_div = d3.select('#game_selector_div');
    
    let game_selector_svg = game_selector_div.append('svg')
                                    .attr('id', 'game_selector_svg')
                                    .attr('width', game_details_width)
                                    .attr('height', game_selector_svg_height)
                                    .style('position', 'absolute')
                                    .style('left', game_details_left)
                                    .style('top', game_details_height);
    
    let game_selector_g_x = game_details_width - 200;
    
    let game_selector_open_button_g = game_selector_svg.append('g')
                                        .attr('id', 'game_selector_open_button_g')
                                        .attr('transform', 'translate(' + game_selector_g_x + ',0)')
                                        .style('cursor', 'pointer')
                                        .on('click', function() { 
                                            closeGameSelectorDiv();
                                        });
    
    let game_selector_open_button_bg = game_selector_open_button_g.append('rect')
                                        .attr('id', 'game_selector_open_button_bg')
                                        .attr('width', game_selector_button_width)
                                        .attr('height', game_selector_button_height)
                                        .attr('fill', color_dict.white)
                                        .attr('y', 2)
                                        .style('shape-rendering', 'CrispEdges');
    
    let game_selector_open_button_text = game_selector_open_button_g.append('text')
                                        .text('Select Game')
                                        .attr('id', 'game_selector_open_button_text')
                                        .attr('class', 'game_selector_font')
                                        .attr('font-size', '12px')
                                        .attr('font-weight', 300)
                                        .attr('x', game_selector_button_width - 20)
                                        .attr('y', game_selector_button_height / 2 + 1)
                                        .attr('text-anchor', 'end')
                                        .attr('dominant-baseline', 'middle');
    
    let game_selector_open_button_chevron = game_selector_open_button_g.append('text')
                                        .text(function() {return '\uf078'})
                                        .attr('id', 'game_selector_open_button_chevron')
                                        .attr('class', 'font_awesome_text_icon')
                                        .attr('font-size', '12px')
                                        .style('font-weight', 300)
                                        .attr('fill', color_dict.black)
                                        .attr('x', game_selector_button_width - 5)
                                        .attr('y', game_selector_button_height / 2 + 1)
                                        .attr('dominant-baseline', 'middle')
                                        .attr('text-anchor', 'middle')
                                        .attr('closed', 1);
                                        
    
    let game_selector_season_array = ['2020','2019', '2018', '2017', '2016', '2015', '2014'];
    let game_selector_week_array = ['P', '16', '15', '14', '13', '12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
    let game_selector_season_margin_top = 80;
    let game_selector_season_spacing = 70;
    let game_selector_season_width = (game_selector_season_array.length - 1) * game_selector_season_spacing;
    let game_selector_season_margin_left = (game_details_width - game_selector_season_width) / 2;
    
    let game_selector_season_g = game_selector_svg.append('g')
                                        .attr('id', 'game_selector_season_g')
                                        .attr('transform', 'translate(' + game_selector_season_margin_left  + ',' + game_selector_season_margin_top + ')')
                                        .attr('visibility', 'hidden');
    
    let game_selector_season_font_size_selected = '20px'
    let game_selector_season_font_size_unselected = '16px'
                                        
    
    let game_selector_season = game_selector_season_g.selectAll('.game_selector_season')
                                        .data(game_selector_season_array)
                                        .enter()
                                        .append('text')
                                        .text(function(d) {return d})
                                        .attr('id', function(d,i) {
                                            return 'game_selector_season_' + d
                                        })
                                        .attr('class', 'game_selector_season')
                                        .attr('x', function(d,i) {
                                            return i * game_selector_season_spacing;
                                        })
                                        .attr('fill', function(d,i) {
                                            if (i == 0) {
                                                return color_dict.black;
                                            } else {
                                                return color_dict.med_gray;
                                            }
                                        })
                                        .attr('font-size', function(d,i) {
                                            if (i == 0) {
                                                return game_selector_season_font_size_selected
                                            } else {
                                                return game_selector_season_font_size_unselected
                                            }
                                        })
                                        .style('font-weight', 500)
                                        .attr('text-anchor', 'middle')
                                        .style('cursor', 'pointer')
                                        .attr('selected', function(d,i) {
                                            if (i == 0) {
                                                return 1
                                            } else {
                                                return 0
                                            }
                                        })
                                        .attr('value', function(d) {return d})
                                        .on('mouseover', function() {
                                            
                                            let season_element = d3.select(this)
                                                
                                            if (season_element.attr('selected') == 0) {
                                                
                                                season_element.transition().duration(100)
                                                    .attr('font-size', game_selector_season_font_size_selected)
                                                
                                                }
                                            })
                                        .on('mouseout', function() {
                                            
                                            let season_element = d3.select(this)
                                            
                                            if (season_element.attr('selected') == 0) {
                                                season_element.transition().duration(100)
                                                    .attr('font-size', game_selector_season_font_size_unselected)
                                            }
                                        })
                                        .on('click', function() {
                                            
                                            let season_element = d3.select(this);
                                            schedule_season = season_element.attr('value');
                                            
                                            let req_dict = {req_type: 'schedule_info', season: schedule_season, week: schedule_week}
                                            
                                            ws_conn.send(JSON.stringify(req_dict))
                                            
                                            if (season_element.attr('selected') == 0) {
                                                
                                                d3.selectAll('.game_selector_season')
                                                    .attr('font-size', game_selector_season_font_size_unselected)
                                                    .attr('fill', color_dict.med_gray)
                                                    .attr('selected', 0)
                                                
                                                season_element.attr('fill', color_dict.black)
                                                    .attr('font-size', game_selector_season_font_size_selected)
                                                    .attr('selected', 1)
                                            
                                            }
                                        });
    
    
    let game_selector_week_margin_top = 110;
    let game_selector_week_spacing = 35;
    let game_selector_week_width = (game_selector_week_array.length - 1) * game_selector_week_spacing;
    let game_selector_week_margin_left = (game_details_width - game_selector_week_width) / 2;
    
    
    let game_selector_week_g = game_selector_svg.append('g')
                                        .attr('id', 'game_selector_week_g')
                                        .attr('transform', 'translate(' + game_selector_week_margin_left  + ',' + game_selector_week_margin_top + ')')
                                        .attr('visibility', 'hidden');
    
    let game_selector_week_font_size_selected = '12px'
    let game_selector_week_font_size_unselected = '10px'
                                        
    
    let game_selector_week = game_selector_week_g.selectAll('.game_selector_week')
                                        .data(game_selector_week_array)
                                        .enter()
                                        .append('text')
                                        .text(function(d) {return d})
                                        .attr('id', function(d,i) {
                                            return 'game_selector_week_' + d
                                        })
                                        .attr('class', 'game_selector_week')
                                        .attr('x', function(d,i) {
                                            return i * game_selector_week_spacing;
                                        })
                                        .attr('fill', function(d,i) {
                                            if (i == 0) {
                                                return color_dict.black;
                                            } else {
                                                return color_dict.med_gray;
                                            }
                                        })
                                        .attr('font-size', function(d,i) {
                                            if (i == 0) {
                                                return game_selector_week_font_size_selected
                                            } else {
                                                return game_selector_week_font_size_unselected
                                            }
                                        })
                                        .style('font-weight', 500)
                                        .attr('text-anchor', 'middle')
                                        .style('cursor', 'pointer')
                                        .attr('selected', function(d,i) {
                                            if (i == 0) {
                                                return 1
                                            } else {
                                                return 0
                                            }
                                        })
                                        .attr('value', function(d,i){
                                            let season_map = {SB: 21, Conf: 20, Div: 19, WC: 18};
                                            let season_keys = Object.keys(season_map);
                                            
                                            if (season_keys.includes(d)) {
                                                return season_map[d]
                                            } else {
                                                return d;
                                            }
                                        })
                                        .on('mouseover', function() {
                                            
                                            let week_element = d3.select(this)
                                                
                                            if (week_element.attr('selected') == 0) {
                                                
                                                week_element.transition().duration(100)
                                                    .attr('font-size', game_selector_week_font_size_selected)
                                                
                                                }
                                            })
                                        .on('mouseout', function() {
                                            
                                            let week_element = d3.select(this)
                                            
                                            if (week_element.attr('selected') == 0) {
                                                week_element.transition().duration(100)
                                                    .attr('font-size', game_selector_week_font_size_unselected)
                                            }
                                        })
                                        .on('click', function() {
                                            
                                            let week_element = d3.select(this);
                                            schedule_week = week_element.attr('value');
                                            let req_dict = {req_type: 'schedule_info', season: schedule_season, week: schedule_week}
                          
                                            ws_conn.send(JSON.stringify(req_dict))
                                            
                                            if (week_element.attr('selected') == 0) {
                                                
                                                d3.selectAll('.game_selector_week')
                                                    .attr('font-size', game_selector_week_font_size_unselected)
                                                    .attr('fill', color_dict.med_gray)
                                                    .attr('selected', 0)
                                                
                                                week_element.attr('fill', color_dict.black)
                                                    .attr('font-size', game_selector_week_font_size_selected)
                                                    .attr('selected', 1)
                                            
                                            }
                                     });
    
    //Append g to pull on schedule info response to update
    let game_selector_results_g = game_selector_svg.append('g')
                                            .attr('id', 'game_selector_results_g')
                                            .attr('visibility', 'hidden');
    
}



function drawExportButton(chart_svg, chart_bg_width, chart_height) {

    let chart_export_button_g = chart_svg.append('g')
                                        .attr('id', 'chart_export_button_g')
                                        .attr('transform', 'translate(' + (chart_bg_width - 190) + ',' + (chart_height - 90) + ')')
                                        .style('cursor', 'pointer')
                                        .on('click', function() {

                                            openProcessingScreen('Exporting Chart');

                                            drawGameDetails(game_details_data, 0);
                                            

                                            chart_svg.select('#game_ou_text').style('opacity', 0);
                                            chart_svg.selectAll('.game_spread_text').style('opacity', 0);
                                            chart_svg.select('#game_pregame_line_text').style('opacity', 0);

                                            d3.select('#chart_export_button_g').style('opacity', 0)

                                            saveSvgAsPng(document.getElementById("chart_svg"), "plot.png", {scale: 1, backgroundColor: '#fff',
                                                        left: 150, top: 0, width: 900, height: 900}); 

                                            
                                            setTimeout(function() {
                                                
                                                d3.select('#chart_export_button_g').style('opacity', 1);
                                                chart_svg.select('#game_details_content_g').remove();

                                                closeProcessingScreen();
                                                
                                            }, 1000);
 
                                        })
    
    let export_button_width = 130;
    let export_button_height = 36;

    let chart_export_button_bg = chart_export_button_g.append('rect')
                                        .attr('id', 'chart_export_button_bg')
                                        .attr('width', export_button_width)
                                        .attr('height', export_button_height)
                                        .attr('fill', color_dict.gray_bg)
                                        .attr('stroke', color_dict.dark_gray)
                                        .attr('stroke-width', '1px')

    let chart_export_button_text = chart_export_button_g.append('text')
                                        .text('Export Chart')
                                        .attr('id', 'chart_export_button_text')
                                        .attr('x', export_button_width / 2)
                                        .attr('y', export_button_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('font-size', '14px')
                                        .style('font-weight', 500)
                                        .style('font-family', 'Inter');


}

function drawTeamStatElements() {
    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let orient = (width / height) > (4 / 3)   ? 'landscape' : 'portrait';
    let game_details_height = d3.select('#game_details_contents').node().getBoundingClientRect().height;
    let chart_height = height - game_details_height;
    
    let chart_svg = d3.select('#viz').append('svg')
                                        .attr('id', 'chart_svg')
                                        .attr('height', chart_height)
                                        .attr('width', width)
                                        .attr('transform', 'translate(0,' + game_details_height + ')');
    
        
    let chart_g = chart_svg.append('g')
                            .attr('id', 'chart_g')
                            .attr('transform', 'translate(' + chart_margin.left + ',' + chart_margin.top + ')');
    
    let chart_bg_height = chart_height - (chart_margin.top + chart_margin.bottom)
    let chart_bg_width = width - (chart_margin.left + chart_margin.right)
    
    let chart_bg = chart_g.append('rect')
                            .attr('id', 'chart_bg')
                            .attr('height', chart_bg_height)
                            .attr('width', chart_bg_width)
                            .attr('fill', color_dict.transparent)
                            .attr('rx', 5);
    
    
    let chart_title_width = chart_title_button_data.length * chart_title_button_width + (chart_title_button_data.length - 1) * chart_title_button_spacing
    let chart_title_margin_left = (chart_bg_width / 2) - (chart_title_width / 2);
    
    let chart_title_g = chart_g.append('g')
                            .attr('id', 'chart_title_g')
                            .attr('transform', 'translate(' + chart_title_margin_left + ',' + chart_title_margin.top +')')
    /*
    let chart_title_top_border = chart_g.append('line')
                                .attr('id', 'chart_title_top_border')
                                .attr('x1', chart_bg_width * .2)
                                .attr('y1', chart_title_margin.top / 2)
                                .attr('x2', chart_bg_width * .8)
                                .attr('y2', chart_title_margin.top / 2)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', 1)
                                .style('shape-rendering', 'CrispEdges');
    */
    ////Chart title buttons
    let chart_title_buttons = chart_title_g.selectAll('.chart_title_buttons')
                                        .data(chart_title_button_data)
                                        .enter()
                                        .append('g')
                                        .attr('id', function(d) {return d.replace(' ', '') + '_button'})
                                        .attr('class', '.chart_title_buttons')
                                        .attr('transform', function(d,i) {
                                            return 'translate(' + (i * (chart_title_button_spacing + chart_title_button_width)) + ',0)'
                                        })
                                        .style('cursor', 'pointer')
                                        .on('click', function(d,i) {
  
                                                let button_text_id = '#' + d.replace(' ','') + '_button_text';
                                                let button_bg_id = '#' + d.replace(' ', '') + '_button_bg';

                                                d3.selectAll('.chart_title_button_text')
                                                    .style('font-weight', 300);

                                                d3.selectAll('.chart_title_button_bg')
                                                    .attr('fill', color_dict.gray_bg)

                                                d3.select(button_text_id)
                                                    .style('font-weight', 500);

                                                d3.select(button_bg_id)
                                                    .attr('fill', color_dict.transparent); 
                                            
                                                
                                                if (i == 0) {
                                                    game_chart_selected = 1
                                                    team_stats_selected = 0
                                                } else if (i == 1) {
                                                    game_chart_selected = 0
                                                    team_stats_selected = 1
                                                }
                                                
                                        })
                                       
    
    
    let chart_title_bgs = chart_title_buttons.append('rect')  
                                        .attr('id', function(d) {return d.replace(' ', '') + '_button_bg'})
                                        .attr('class', 'chart_title_button_bg')
                                        .attr('width', chart_title_button_width)
                                        .attr('height', chart_title_button_height)
                                        .attr('fill', function(d,i) {
                                            if (i == 0) {
                                                return color_dict.transparent
                                            } else {
                                                return color_dict.gray_bg
                                            }
                                        })
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', 1)
                                        .style('shape-rendering', 'CrispEdges');
    
        
    let chart_title_button_text = chart_title_buttons.append('text')
                                        .text(function(d) {return d})
                                        .attr('id', function(d) {return d.replace(' ','') + '_button_text'})
                                        .attr('class', 'chart_title_button_text')
                                        .attr('font-size', chart_title_button_text_font_size)
                                        .attr('x', chart_title_button_width / 2)
                                        .attr('y', chart_title_button_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('fill', color_dict.black)
                                        .style('font-weight', function(d, i) {
                                            if (i == 0) {
                                                return 500
                                            } else {
                                                return 300
                                            }
                                        });
    
    
    let chart_contents_top = chart_title_margin.top + chart_title_button_height + chart_title_margin.bottom;
    let chart_contents_width = chart_bg_width - (2 * (chart_sidebar_width + chart_sidebar_padding));
    let chart_contents_height = chart_bg_height - chart_contents_top;
    
    let chart_contents_g = chart_g.append('g')
                                    .attr('id', 'chart_contents_g')
                                    .attr('transform', 'translate(' + (chart_sidebar_width + chart_sidebar_padding) + ',' + chart_contents_top + ')');
    
    //Draw chartbars   
    let num_team_stat_bars = 13
    let chart_team_stats_total_height = num_team_stat_bars * chart_sidebar_button_height;
    let team_stats_margin_left = (chart_bg_width / 2) - (chart_sidebar_width / 2);
    let chart_sidebar_padding_top = (chart_contents_height - chart_team_stats_total_height) / 2 + chart_contents_top;
    let team_stat_bar_height = chart_sidebar_button_height * .6;
    let team_stat_text_spacing = 3;
    //Create array to build team stat g's, 1 less than num_team_stat_bars to account for header
    let team_stat_array = []

    for (var i = 0; i < num_team_stat_bars - 1; i++) {
        team_stat_array.push(i);
    }


    let team_stat_g = chart_g.append('g')
                                .attr('id', 'team_stat_g')
                                .attr('transform', 'translate(' + team_stats_margin_left + ',' + chart_sidebar_padding_top + ')');


    let team_stat_bg = team_stat_g.append('rect')
                                .attr('id', 'team_stat_bg')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_team_stats_total_height)
                                .attr('fill', color_dict.transparent)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', .5)
                                .style('shape-rendering', 'CrispEdges');
    
    let team_stat_title_bg = team_stat_g.append('rect')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_sidebar_button_height)
                                .attr('fill', color_dict.transparent)
                                .style('shape-rendering', 'CrispEdges');
    
    let team_stat_title_text = team_stat_g.append('text')
                                .text('Team Stats')
                                .attr('class', 'chart_title_button_text')
                                .attr('font-size', '16px')
                                .attr('fill', color_dict.black)
                                .style('font-weight', 700)
                                .attr('x', chart_sidebar_width / 2)
                                .attr('y', chart_sidebar_button_height / 2)
                                .attr('text-anchor', 'middle')
                                .attr('dominant-baseline', 'middle')
                                .style('shape-rendering', 'CrispEdges');
                                
    
        
    let team_stat_button_g = team_stat_g.selectAll('.team_stat_button_g')
                                        .data(team_stat_array)
                                        .enter()
                                        .append('g')
                                        .attr('id', function(d,i) {
                                            return 'team_stat_button_g_' + i;
                                        })
                                        .attr('class', 'team_stat_button_g')
                                        .attr('transform', function(d,i) {
                                            return  'translate(0,' + ((i + 1) * chart_sidebar_button_height) + ')'
                                        })
                                        .attr('value', 'none')
                                        .style('cursor', 'pointer')
                                        .on('mouseover', function(d,i) {

                                            d3.select(this).select('.team_stat_button_text')
                                                .attr('font-weight', 700)
                                                .style('text-decoration', 'underline');

                                        })
                                        .on('mouseout', function(d,i) {

                                            d3.select(this).select('.team_stat_button_text')
                                                .attr('font-weight', 500)
                                                .style('text-decoration', 'none');

                                        })
                                        .on('click', function(d,i) {
                                            
                                            changeTeamStat(i);
                                        });
                                            
                                            
                                            
    
    let team_stat_button_bg = team_stat_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'team_stat_button_bg_' + i;
                                        })
                                        .attr('class', 'team_stat_button_bg')
                                        .attr('width', chart_sidebar_width)
                                        .attr('fill', color_dict.transparent)
                                        .attr('height', chart_sidebar_button_height);

    let team_stat_button_text = team_stat_button_g.append('text')
                                        .attr('id', function(d, i) {
                                            return 'team_stat_button_text_' + i;
                                        })
                                        .attr('class', 'team_stat_button_text')
                                        .attr('x', chart_sidebar_width / 2)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .text('+')
                                        .attr('font-size', '12px')
                                        .style('font-weight', 500)
                                        .style('font-family', 'Inter');

    let away_team_stat_bars = team_stat_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'away_team_stat_bar_' + i;
                                        })
                                        .attr('class', 'away_team_stat_bar')
                                        .attr('x', 0)
                                        .attr('y', (chart_sidebar_button_height - team_stat_bar_height) / 2)
                                        .attr('height', team_stat_bar_height)
                                        .attr('width', 0)
                                        .attr('fill', color_dict.transparent)

    let away_team_stat_bar_text = team_stat_button_g.append('text')
                                        .attr('x', -1 * team_stat_text_spacing)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .text(0)
                                        .attr('id', function(d, i) {
                                            return 'away_team_stat_bar_text_' + i
                                        })
                                        .attr('class', 'away_team_stat_bar_text')
                                        .attr('font-size', '12px')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('text-anchor', 'end')
                                        .style('opacity', 0);

    let home_team_stat_bars = team_stat_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'home_team_stat_bar_' + i;
                                        })
                                        .attr('class', 'home_team_stat_bar')
                                        .attr('x', chart_sidebar_width)
                                        .attr('y', (chart_sidebar_button_height - team_stat_bar_height) / 2)
                                        .attr('height', team_stat_bar_height)
                                        .attr('width', 0)
                                        .attr('fill', color_dict.transparent);

    let home_team_stat_bar_text = team_stat_button_g.append('text')
                                        .attr('x', chart_sidebar_width + team_stat_text_spacing)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .text(0)
                                        .attr('id', function(d, i) {
                                            return 'home_team_stat_bar_text_' + i
                                        })
                                        .attr('class', 'home_team_stat_bar_text')
                                        .attr('font-size', '12px')
                                        .attr('dominant-baseline', 'middle')
                                        .style('opacity', 0);
                                        
    
    drawExportButton(chart_svg, chart_bg_width, chart_height);

}

function closeChangeTeamStat() {

    d3.selectAll('#change_team_close_x, #change_team_stats_content_g').attr('display', 'none');

    d3.select('#change_team_base_bg')
        .transition()
        .duration(300)
        .attr('width', 0);

    setTimeout(function() {d3.select('#change_team_stat_g').remove()}, 300);
}

function convertTeamStat(team_stat_value, change_team_stat_key_index) {
    console.log(team_stat_value);
    //change team_stat_order_dit
    team_stat_order_dict[change_team_stat_key_index] = team_stat_value

    let team_stat_button_g = d3.select('#team_stat_button_g_' + change_team_stat_key_index);
    let chart_bg_width = d3.select('#chart_bg').node().getBoundingClientRect().width;
    let team_stats_margin_left = (chart_bg_width / 2) - (chart_sidebar_width / 2);
    //let team_stat_value = team_stat_order_dict[change_team_stat_key_index];
    let stat_display_text = team_stats_display_dict[team_stat_value];

    //change value attribute of team_stat_button_g
    team_stat_button_g.attr('value', team_stat_value);


    let away_team_stat_value = parseFloat(team_stat_data['away_team_stats'][team_stat_value]);
    let home_team_stat_value = parseFloat(team_stat_data['home_team_stats'][team_stat_value]);
    let x_scale_min_domain = parseFloat(team_stats_domain_data[team_stat_value]['min_value']);
    let x_scale_max_domain = parseFloat(team_stats_domain_data[team_stat_value]['max_value']);

    team_stat_button_g.attr('value', team_stat_value);

    let team_stat_button_text = team_stat_button_g.select('.team_stat_button_text')
                                    .text(stat_display_text);
    
    let team_stat_x_scale = d3.scaleLinear()
                                .domain([x_scale_min_domain, x_scale_max_domain])
                                .range([0, team_stats_margin_left])

    let away_team_stat_bar = team_stat_button_g.select('.away_team_stat_bar')
                                .attr('fill', color_dict.away_team_color)
                                .transition()
                                .duration(200)
                                .attr('x', -1 * team_stat_x_scale(away_team_stat_value))
                                .attr('width', team_stat_x_scale(away_team_stat_value))

    let away_team_stat_text = team_stat_button_g.select('.away_team_stat_bar_text')
                                .text(away_team_stat_value)
                                .style('opacity', 1)
                                .transition()
                                .duration(200)
                                .attr('x', -1 * team_stat_x_scale(away_team_stat_value) - 3)

    let home_team_stat_bar_start = team_stats_margin_left + chart_sidebar_width;

    let home_team_stat_bar = team_stat_button_g.select('.home_team_stat_bar')
                                .attr('fill', color_dict.home_team_color)
                                .transition()
                                .duration(200)
                                .attr('x', chart_sidebar_width)
                                .attr('width', team_stat_x_scale(home_team_stat_value))

    let home_team_stat_text = team_stat_button_g.select('.home_team_stat_bar_text')
                                .text(home_team_stat_value)
                                .style('opacity', 1)
                                .transition()
                                .duration(200)
                                .attr('x', chart_sidebar_width + team_stat_x_scale(home_team_stat_value) + 3)
                                


}

function changeTeamStat(change_team_stat_key_index) {

    console.log(change_team_stat_key_index);

    let chart_svg = d3.select('#chart_svg');
    let chart_width = chart_svg.node().getBoundingClientRect().width;
    let chart_height = chart_svg.node().getBoundingClientRect().height;
    let chart_bg_height = d3.select('#chart_bg').node().getBoundingClientRect().height;
    let chart_bg_width = d3.select('#chart_bg').node().getBoundingClientRect().width;
    
    let chart_contents_top = chart_title_margin.top + chart_title_button_height + chart_title_margin.bottom;
    let chart_contents_height = chart_bg_height - chart_contents_top;
    let chart_team_stats_total_height = d3.select('#team_stat_g').node().getBoundingClientRect().height;
    let team_stats_margin_left = (chart_bg_width / 2) - (chart_sidebar_width / 2) + chart_margin.left;
    let chart_sidebar_padding_top = (chart_contents_height - chart_team_stats_total_height) / 2 + chart_contents_top;

    let team_stat_top = d3.select('#team_stat_bg').node().getBoundingClientRect().y;
    let team_stat_height = d3.select('#team_stat_g').node().getBoundingClientRect().height;
    let team_stat_button_g = d3.select('#team_stat_button_g_' + change_team_stat_key_index)
    let team_stat_button_position = team_stat_button_g.select('.team_stat_button_bg').node().getBoundingClientRect();
    let team_stat_button_type = team_stat_button_g.select('.team_stat_button_text').text();

    let change_team_stat_g = chart_svg.append('g')
                                        .attr('id', 'change_team_stat_g');

    let change_team_stat_modal_bg = change_team_stat_g.append('rect')
                                            .attr('id', 'change_team_stat_modal_bg')
                                            .attr('width', chart_width)
                                            .attr('height', chart_height)
                                            .attr('fill', color_dict.transparent_white);

    let change_team_base_g = change_team_stat_g.append('g')
                            .attr('transform', 'translate(' + (team_stats_margin_left + chart_sidebar_width) + ',' + chart_sidebar_padding_top + ')');     
                            
    let change_team_base_bg = change_team_base_g.append('rect')
                                        .attr('id', 'change_team_base_bg')
                                        .attr('x', 0)
                                        .attr('y', 0)
                                        .attr('width', 0)
                                        .attr('height', team_stat_height)
                                        .attr('fill', color_dict.white)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', .5)
                                        .transition()
                                        .duration(200)
                                        .attr('width', team_stats_margin_left);

    let change_team_close_x = change_team_base_g.append('text')
                                        .attr('id', 'change_team_close_x')
                                        .attr('class', 'font_awesome_text_icon')
                                        .attr('x', team_stats_margin_left - 20)
                                        .attr('y', 20)
                                        .text(function() {return '\uf00d'})
                                        .attr('fill', color_dict.red)
                                        .attr('font-size', '18px')
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .style('opacity', 0)
                                        .style('cursor', 'pointer')
                                        .on('click', function() {
                                            
                                                closeChangeTeamStat();
                                        })
                                        .transition()
                                        .delay(300)
                                        .style('opacity', 1);
    
    let change_team_stat_button_top = team_stat_button_position.y - chart_sidebar_padding_top - chart_sidebar_button_height - 4;

    let change_team_stat_button_g = change_team_stat_g.append('g')
                                        .attr('transform', 'translate(' + team_stats_margin_left + ',' + change_team_stat_button_top + ')')
                                        .style('cursor', 'pointer')
                                        .on('click', function() {
                                            
                                            closeChangeTeamStat();
                                            })
                                        

    let change_team_stat_button_bg = change_team_stat_button_g.append('rect')
                                        .attr('id', 'change_team_button_bg')
                                        .attr('width', chart_sidebar_width)
                                        .attr('height', chart_sidebar_button_height)
                                        .attr('fill', color_dict.white)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '.5px');
                                    
    let change_team_stat_button_text = change_team_stat_button_g.append('text')
                                        .text(team_stat_button_type)
                                        .attr('id', 'change_team_stat_button_text')
                                        .attr('x', chart_sidebar_width / 2)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .style('dominant-baseline', 'middle')
                                        .attr('class', 'sidebar_text')
                                        .attr('font-size', '12px')
                                        .style('font-weight', 500)
                                        .style('font-family', 'Inter')
                                        .style('opacity', 0)
                                        .transition()
                                        .duration(50)
                                        .style('opacity', 1);

    let change_team_stat_button_chevron = change_team_stat_button_g.append('text')
                                        .text(function() {return '\uf054'})
                                        .attr('id', 'change_team_stat_button_chevron')
                                        .attr('class', 'font_awesome_text_icon')
                                        .attr('x', chart_sidebar_width - 3)
                                        .attr('y', chart_sidebar_button_height / 2 + 1)
                                        .attr('font-size', '10px')
                                        .attr('text-anchor', 'end')
                                        .style('dominant-baseline', 'middle')
                                        .style('opacity', 0)
                                        .transition()
                                        .duration(50)
                                        .style('opacity', 1);

    let change_team_stat_contents_g = change_team_base_g.append('g')
                                        .attr('id', 'change_team_stats_content_g')

    let change_team_stat_contents_title = change_team_stat_contents_g.append('text')
                                        .text('Select Stat')
                                        .attr('x', team_stats_margin_left / 2)
                                        .attr('y', 30)
                                        .style('text-anchor', 'middle')
                                        .style('dominant-baseline', 'middle')
                                        .attr('font-size', '18px')
                                        .attr('font-weight', 700)
                                        .style('text-decoration', 'underline')
                                        .style('opacity', 0)
                                        .transition()
                                        .duration(400)
                                        .style('opacity', 1);
                                        
    let change_team_stat_buttons = change_team_stat_contents_g.selectAll('.change_team_stat_buttons')
                                        .data(final_team_stats_alpha_array)
                                        .enter()
                                        .append('g')
                                        .attr('id', function(d) {

                                            return 'change_team_stat_button_' + d.team_stat_name
                                        })
                                        .attr('transform', function(d,i) {

                                            let change_team_stat_contents_middle = team_stats_margin_left / 2;
                                            let change_team_stat_col_num = i % 3;
                                            let change_team_stat_row_num = Math.floor( i / 3);
                                            let change_team_stat_row_height = 30;
                                            let change_team_stat_first_col_x = change_team_stat_contents_middle - 125;
                                            let change_team_stat_third_col_x = change_team_stat_contents_middle + 125;

                                            if (change_team_stat_col_num === 0) {
                                                   
                                                var change_team_stat_button_x = change_team_stat_first_col_x;

                                            } else if (change_team_stat_col_num === 1) {

                                                var change_team_stat_button_x = change_team_stat_contents_middle;

                                            } else {

                                                var change_team_stat_button_x = change_team_stat_third_col_x;

                                            }

                                            let change_team_stat_button_y = change_team_stat_row_num * change_team_stat_row_height + 80;

                                            return 'translate(' + change_team_stat_button_x + ',' + change_team_stat_button_y + ')'


                                        })
                                        .style('cursor', 'pointer')
                                        .on('mouseover', function() {

                                            d3.select(this).select('.change_team_stat_buttons_text')
                                                .style('text-decoration', 'underline')
                                        })
                                        .on('mouseout', function() {

                                            d3.select(this).select('.change_team_stat_buttons_text')
                                                .style('text-decoration', 'none')
                                        })


        let change_team_stat_buttons_text = change_team_stat_buttons.append('text')
                                                    .text(function(d) {
                                                        return d.display_name;
                                                    })
                                                    .attr('id', function(d,i) {
                                                        return 
                                                    })
                                                    .attr('class', 'change_team_stat_buttons_text')
                                                    .attr('text-anchor', 'middle')
                                                    .style('dominant-baseline', 'middle')
                                                    .style('font-size', '12px')
                                                    .style('font-family', 'Inter')
                                                    .style('font-weight', 500)
                                                    .style('opacity', 0)
                                                    .on('click', function(d) {

                                                        convertTeamStat(d.team_stat_name, change_team_stat_key_index, team_stat_data);
                                                        closeChangeTeamStat();
                                                    })
                                                    .transition()
                                                    .duration(300)
                                                    .style('opacity', 1)
                                                    

    
                                        
                                        
}

function populateTeamStatData(team_stat_order_dict, team_stat_data, team_stats_domain_data) {
    
    let team_stat_keys = Object.keys(team_stat_order_dict);
    let chart_bg_width = d3.select('#chart_bg').node().getBoundingClientRect().width;
    let team_stats_margin_left = (chart_bg_width / 2) - (chart_sidebar_width / 2);


    for (var i = 0; i < team_stat_keys.length; i++) {

        let team_stat_key = team_stat_keys[i];
        let team_stat_value = team_stat_order_dict[team_stat_key];
        let stat_display_text = team_stats_display_dict[team_stat_value];
        let team_stat_g_id = '#team_stat_button_g_' + i;

        let team_stat_button_g = d3.select(team_stat_g_id);
        let team_stat_button_value = team_stat_button_g.attr('value');

        let away_team_stat_value = parseFloat(team_stat_data['away_team_stats'][team_stat_value]);
        let home_team_stat_value = parseFloat(team_stat_data['home_team_stats'][team_stat_value]);
        let x_scale_min_domain = parseFloat(team_stats_domain_data[team_stat_value]['min_value']);
        let x_scale_max_domain = parseFloat(team_stats_domain_data[team_stat_value]['max_value']);

        team_stat_button_g.attr('value', team_stat_value);

        let team_stat_button_text = team_stat_button_g.select('.team_stat_button_text')
                                        .text(stat_display_text);
        
        let team_stat_x_scale = d3.scaleLinear()
                                    .domain([x_scale_min_domain, x_scale_max_domain])
                                    .range([0, team_stats_margin_left])

        let away_team_stat_bar = team_stat_button_g.select('.away_team_stat_bar')
                                    .attr('fill', color_dict.away_team_color)
                                    .transition()
                                    .duration(200)
                                    .attr('x', -1 * team_stat_x_scale(away_team_stat_value))
                                    .attr('width', team_stat_x_scale(away_team_stat_value))

        let away_team_stat_text = team_stat_button_g.select('.away_team_stat_bar_text')
                                    .text(away_team_stat_value)
                                    .style('opacity', 1)
                                    .transition()
                                    .duration(200)
                                    .attr('x', -1 * team_stat_x_scale(away_team_stat_value) - 3)

        let home_team_stat_bar_start = team_stats_margin_left + chart_sidebar_width;

        let home_team_stat_bar = team_stat_button_g.select('.home_team_stat_bar')
                                    .attr('fill', color_dict.home_team_color)
                                    .transition()
                                    .duration(200)
                                    .attr('x', chart_sidebar_width)
                                    .attr('width', team_stat_x_scale(home_team_stat_value))

        let home_team_stat_text = team_stat_button_g.select('.home_team_stat_bar_text')
                                    .text(home_team_stat_value)
                                    .style('opacity', 1)
                                    .transition()
                                    .duration(200)
                                    .attr('x', chart_sidebar_width + team_stat_x_scale(home_team_stat_value) + 3)
                                    

        

    }


};

function drawDiffTooltips(diff_data, sidebar_click_dict) {

    //remove any previous tooltips
    d3.select('#diff_tooltips_g').remove();
    
    let chart_contents_g = d3.select('#chart_contents_g'); 
    let chart_width = chart_contents_g.node().getBoundingClientRect().width;
    let chart_height = chart_contents_g.node().getBoundingClientRect().height;
    let chart_bg_height = d3.select('#chart_bg').node().getBoundingClientRect().height;
    let chart_bg_width = d3.select('#chart_bg').node().getBoundingClientRect().width;
    let chart_contents_top = chart_title_margin.top + chart_title_button_height + chart_title_margin.bottom;
    let chart_contents_width = chart_bg_width - (2 * (chart_sidebar_width + chart_sidebar_padding));
    let chart_contents_height = chart_bg_height - chart_contents_top;

    let diff_display_cols = Object.keys(sidebar_click_dict);
    let tooltip_data = [];

    for (var i = 0; i < diff_display_cols.length; i++) {
    
        let diff_col = diff_display_cols[i];
      
        if (sidebar_click_dict[diff_col] == 1) {
            
            let line_data = [];
            let cum_sum = 0;


            for (var z = 0; z < 61; z++) {

                if (z == 0) {
                    line_data.push({game_min: z, cum_sum: cum_sum})
                } else {
        
                    cum_sum = cum_sum + diff_data[diff_col][z - 1];
                    line_data.push({game_min: z, cum_sum: cum_sum});
                }
                
            }
            

            //BUILD TOOLTIP DATA
            tooltip_data.push({diff_col: diff_col, data: line_data})
        }
    }


    let diff_lines = document.getElementsByClassName('diff_lines');

    var diff_tooltips_g = chart_contents_g.append('g')
                                    .attr('id', 'diff_tooltips_g');

    diff_tooltips_g.append('path')
                .attr('class', 'diff_tooltip_game_min_line')
                .attr('stroke', color_dict.black)
                .attr('stroke-width', '1px')
                .style('opacity', 0);

    diff_tooltips_g.append('text')
                .text('0')
                .attr('class', 'diff_tooltip_game_min_text')
                .attr('stroke', color_dict.black)
                .attr('font-size', '12px')
                .style('font-weight', 300)
                .attr('text-anchor', 'middle');

    var tooltip_per_line = diff_tooltips_g.selectAll('.tooltip_per_line')
                                        .data(tooltip_data)
                                        .enter()
                                        .append('g')
                                        .attr('class', 'tooltip_per_line')
                                        .attr('id', function(d) {
                                            return d.diff_col + '_tooltip_g'
                                        });

    tooltip_per_line.append('circle')
                    .attr('r', 7)
                    .style('stroke', function(d) {
                        return color_dict[d.diff_col];
                    })
                    .style('fill', 'none')
                    .style('stroke-width', '1px')
                    .style('opacity', '0');

    tooltip_per_line.append('text')
                    .attr('transform', 'translate(8,-8)')

    diff_tooltips_g.append('svg:rect')
                    .attr('width', chart_contents_width)
                    .attr('height', chart_contents_height)
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .on('mouseout', function() {
                        d3.select('.diff_tooltip_game_min_line')
                            .style('opacity', 0)

                        d3.select('.diff_tooltip_game_min_text')
                            .style('opacity', 0)

                        d3.selectAll('.tooltip_per_line circle')
                            .style('opacity', 0)

                        d3.selectAll('.tooltip_per_line text')
                            .style('opacity', 0)
                    })
                    .on('mouseover', function() {
                        d3.select('.diff_tooltip_game_min_line')
                            .style('opacity', 1)

                        d3.select('.diff_tooltip_game_min_text')
                            .style('opacity', 1)

                        d3.selectAll('.tooltip_per_line circle')
                            .style('opacity', 1)

                        d3.selectAll('.tooltip_per_line text')
                            .style('opacity', 1)
                    })
                    .on('mousemove', function() {
                        
                        var mouse = d3.mouse(this);
                        let x_end_margin = chart_bg_width - (chart_sidebar_width + chart_sidebar_padding) * 2;

                        let diff_x_scale = d3.scaleLinear()
                                                .domain([0, 60])
                                                .range([0, x_end_margin]);
                        
                        var x_game_min = diff_x_scale.invert(mouse[0])

                        d3.select('.diff_tooltip_game_min_line')
                            .attr('d', function() {
                                var d = 'M' + mouse[0] + ',' + (chart_contents_height - 23);
                                d += ' ' + mouse[0] + ',' + (chart_contents_height - 15);
                                return d;
                            })

                        d3.select('.diff_tooltip_game_min_text')
                            .attr('x', mouse[0])
                            .attr('y', chart_contents_height - 30)
                            .text(function() {
                                return x_game_min.toFixed(0);
                            })

                        d3.selectAll('.tooltip_per_line')
                            .attr('transform', function(d, i) {
                                let diff_col = d.diff_col;

                                let x_end_margin = chart_bg_width - (chart_sidebar_width + chart_sidebar_padding) * 2;
                                let diff_begin_domain = domain_dict[diff_col] * -1
                                let diff_end_domain = domain_dict[diff_col]

                                let diff_x_scale = d3.scaleLinear()
                                                    .domain([0, 60])
                                                    .range([0, x_end_margin]);

                                let diff_y_scale = d3.scaleLinear()
                                                    .domain([diff_begin_domain, diff_end_domain])
                                                    .range([chart_contents_height, 0]);


                                var x_game_min = diff_x_scale.invert(mouse[0])
                                var bisect = d3.bisector(function(d) {return d.game_min;}).right;
                                var idx = bisect(d.data, x_game_min);

                                var beginning = 0
                                var end = diff_lines[i].getTotalLength();
                                var target = null;

                                while(true) {
                                    target = Math.floor((beginning + end) / 2);
                                    pos = diff_lines[i].getPointAtLength(target);

                                    if ((target === end || target == beginning) && pos.x !== mouse[0]) {
                                        break;
                                    }

                                    if (pos.x > mouse[0]) end = target;
                                    else if (pos.x < mouse[0]) beginning = target;
                                    else break;

                                }

                                d3.select(this).select('text')
                                    .text(diff_y_scale.invert(pos.y).toFixed(1));

                                return 'translate(' + mouse[0] + ',' + pos.y + ')';


                            })

                    });


}



function drawDiffLine(diff_col, diff_data) {

    let chart_contents_g = d3.select('#chart_contents_g'); 
    let chart_width = chart_contents_g.node().getBoundingClientRect().width;
    let chart_height = chart_contents_g.node().getBoundingClientRect().height;
    let chart_bg_height = d3.select('#chart_bg').node().getBoundingClientRect().height;
    let chart_bg_width = d3.select('#chart_bg').node().getBoundingClientRect().width;
    let chart_contents_top = chart_title_margin.top + chart_title_button_height + chart_title_margin.bottom;
    let chart_contents_width = chart_bg_width - (2 * (chart_sidebar_width + chart_sidebar_padding));
    let chart_contents_height = chart_bg_height - chart_contents_top;

    let line_id_name = 'diff_line_' + diff_col;
    let line_data = [];
    let cum_sum = 0;

    for (var i = 0; i < 61; i++) {

        if (i == 0) {
            line_data.push({game_min: i, cum_sum: cum_sum})
        } else {

            cum_sum = cum_sum + diff_data[diff_col][i - 1];
            line_data.push({game_min: i, cum_sum: cum_sum});
        }
        
    }

    let x_end_margin = chart_bg_width - (chart_sidebar_width + chart_sidebar_padding) * 2;
    let diff_begin_domain = domain_dict[diff_col] * -1
    let diff_end_domain = domain_dict[diff_col]

    let diff_x_scale = d3.scaleLinear()
                            .domain([0, 60])
                            .range([0, x_end_margin]);

    let diff_y_scale = d3.scaleLinear()
                            .domain([diff_begin_domain, diff_end_domain])
                            .range([chart_contents_height, 0]);

    chart_contents_g.append('path')
                    .datum(line_data)
                    .attr('fill', 'none')
                    .attr('stroke', color_dict[diff_col])
                    .attr('stroke-width', 2)
                    .attr('id', line_id_name)
                    .attr('class', 'diff_lines')
                    .attr('d', d3.line()
                                    .curve(d3.curveBasis)
                                    .x(function(d) { return diff_x_scale(d.game_min)})
                                    .y(function(d) { return diff_y_scale(d.cum_sum)}))
                    .style('opacity', 0)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);



}

function removeDiffTooltip(diff_col) {

    let tooltip_id_name = '#' + diff_col + '_tooltip_g';

    d3.selectAll(tooltip_id_name).remove();

}

function removeDiffLine(diff_col) {
    let line_id_name = '#diff_line_' + diff_col;

    d3.select(line_id_name)
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();

}


function drawDiffChart(diff_data, sidebar_click_dict) {

    let diff_display_cols = Object.keys(sidebar_click_dict)
    
    for (var i = 0; i < diff_display_cols.length; i++) {

        let diff_col = diff_display_cols[i];

        if (sidebar_click_dict[diff_col] == 1) {
            
            let line_id_name = '#diff_line_' + diff_col;
            let line_element = d3.select(line_id_name).node()

            if (typeof(line_element) != 'undefined' && line_element != null) {
                continue;
            } else {
                drawDiffLine(diff_col, diff_data);
            }
        }
    }

    drawDiffTooltips(diff_data, sidebar_click_dict);

}

function loader(config) {
    return function() {
      var radius = Math.min(config.width, config.height) / 2;
      var tau = 2 * Math.PI;
  
      var arc = d3.arc()
              .innerRadius(radius*0.6)
              .outerRadius(radius*0.7)
              .startAngle(0);
  
      var svg = d3.select(config.container).append("svg")
          .attr("id", config.id)
          .attr('class', 'loader')
          .attr("width", config.width)
          .attr("height", config.height)
          .style('margin', 'auto')
          .style('display', 'block')
        .append("g")
          .attr("transform", "translate(" + config.width / 2 + "," + config.height / 2 + ")")
  
      var background = svg.append("path")
              .datum({endAngle: 0.33*tau})
              .style("fill", color_dict.red)
              .attr("d", arc)
              .call(spin, 1000)

      var title = svg.append('text')
                    .text(config.title)
                    .attr('class', 'loader')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('text-anchor', 'middle')
                    .style('dominant-baseline', 'hanging')
                    .attr('font-size', '14px')
                    .style('font-family', 'Inter')
                    .style('font-weight', 500)
  
      function spin(selection, duration) {
          selection.transition()
              .ease(d3.easeLinear)
              .duration(duration)
              .attrTween("transform", function() {
                  return d3.interpolateString("rotate(0)", "rotate(360)");
              });
  
          setTimeout(function() { spin(selection, duration); }, duration);
      }
  
      function transitionFunction(path) {
          path.transition()
              .duration(7500)
              .attrTween("stroke-dasharray", tweenDash)
              .each("end", function() { d3.select(this).call(transition); });
      }
  
    };
  }
  
function openProcessingScreen(title) {

    var myLoader = loader({width: 200, height: 200, container: "#processing_screen", id: "processing_loader", title: title});
    myLoader();

    d3.select('#processing_screen').style('height', '100vh');

}


function closeProcessingScreen() {
    
    d3.selectAll('.loader').remove()
    d3.select('#processing_screen').style('height', 0);
}

function updateScheduleInfo(schedule_data) {

    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let game_selector_results_margin = {top: 150, bottom: 30};
    let game_selector_week_bottom = d3.select('#game_selector_week_g').node().getBoundingClientRect().bottom;
    let game_selector_results_height = height - game_selector_week_bottom - game_selector_results_margin.top - game_selector_results_margin.bottom;    
    let game_selector_game_height = schedule_data.length < 10 ? 18 : game_selector_results_height / schedule_data.length + 2;
    let game_details_width = d3.select('#game_details_contents').node().getBoundingClientRect().width;
    let game_selector_game_width = game_details_width < 600 ? game_details_widthwidth - 20 : 680;
    let game_selector_game_left = (game_details_width - game_selector_game_width) / 2;
    
    let game_selector_results_g = d3.select('#game_selector_results_g')
                                     .attr('transform', 'translate(' + game_selector_game_left + ',' + (game_selector_results_margin.top) + ')');
                                     
    
    //Remove games if exists
    game_selector_results_g.selectAll('*').remove();
    
    
    let game_selector_games_g = game_selector_results_g.selectAll('.game_selector_games_g')
                                                .data(schedule_data)
                                                .enter()
                                                .append('g')
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_games_g_' + i;
                                                })
                                                .attr('class', 'game_selector_games_g')
                                                .attr('transform', function(d, i) {
                                                    return 'translate(0,' + (i * game_selector_game_height + 1) + ')'
                                                })
                                                .style('cursor', 'pointer')
                                                .on('mouseover', function(){
                                                    let game_selector_game = d3.select(this);
                                                    
                                                    game_selector_game.selectAll('.game_selector_highlights')
                                                            .attr('fill', color_dict.red);
                                                    
                                                    game_selector_game.selectAll('.game_selector_at_sign')
                                                            .attr('fill', color_dict.black);  
                                             
                                                    
                                                })
                                                .on('mouseout', function(){
                                                    let game_selector_game = d3.select(this);
                                                    
                                                    game_selector_game.selectAll('.game_selector_highlights')
                                                            .attr('fill', color_dict.transparent);   
                                                    
                                                    game_selector_game.selectAll('.game_selector_at_sign')
                                                            .attr('fill', color_dict.med_gray);  
                                                        
                                                })
                                                .on('click', function(d){
                                                    
                                                    let game_req_dict = {
                                                                    req_type: 'game_details',
                                                                    game_id: d.game_id
                                                                    }
                                                    
                                                    //Send request for game selection
                                                    ws_conn.send(JSON.stringify(game_req_dict));  

                                                    let diff_req_dict = {
                                                                    req_type: 'diff_chart',
                                                                    game_id: d.game_id
                                                    }
                                                    
                                                    ws_conn.send(JSON.stringify(diff_req_dict));

                                                    let team_stat_req_dict = {
                                                                    req_type: 'team_stats',
                                                                    game_id: d.game_id
                                                    }

                                                    ws_conn.send(JSON.stringify(team_stat_req_dict));
                                                    
                                                    //Close Game Selector
                                                    closeGameSelectorDiv();
                                                })
    
    let game_selector_games_bg = game_selector_games_g.append('rect')
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_games_bg_' + i;
                                                })
                                                .attr('class', 'game_selctor_games_bg')
                                                .attr('width', game_selector_game_width)
                                                .attr('height', game_selector_game_height)
                                                .attr('fill', color_dict.transparent)
                                                .attr('stroke', color_dict.gray_bg)
                                                .style('shape-rendering', 'CrispEdges');
                                                
                                                    
    
    let game_selector_at_sign_font_size = schedule_data.length < 20 ? '16px' : '14px';
    let game_selector_team_text_offset = 120;
    let game_selector_team_text_font_size = schedule_data.length < 20 ? '12px' : '10px';
    
    
    let game_selector_at_sign = game_selector_games_g.append('text')
                                                .text('@')
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_at_sign_' + i
                                                })
                                                .attr('class', 'game_selector_at_sign')
                                                .attr('x', game_selector_game_width / 2)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('font-size', game_selector_at_sign_font_size)
                                                .style('font-weight', 300)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('fill', color_dict.med_gray);
                                                
    
    let game_selector_away_text = game_selector_games_g.append('text')
                                                .text(function(d) {return d.team_locs[0]})
                                                .attr('id', function(d,i) {
                                                    return  'game_selector_away_text_' + i
                                                })
                                                .attr('class', 'game_selector_team_text')
                                                .attr('x', game_selector_game_width / 2 - game_selector_team_text_offset)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_team_text_font_size)
                                                .style('font-weight', 700)
                                                .attr('fill', color_dict.black);
    
    let game_selector_home_text = game_selector_games_g.append('text')
                                                .text(function(d) {return d.team_locs[1]})
                                                .attr('id', function(d,i) {
                                                    return  'game_selector_home_text_' + i
                                                })
                                                .attr('class', 'game_selector_team_text')
                                                .attr('x', game_selector_game_width / 2 + game_selector_team_text_offset)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_team_text_font_size)
                                                .style('font-weight', 700)
                                                .attr('fill', color_dict.black);
    
    let game_selector_score_font_size = schedule_data.length < 20 ? '20px' : '14px';
    let game_selector_score_text_offset = 80;
    
    let game_selector_away_score_text = game_selector_games_g.append('text')
                                                .text(function(d) {return d.team_scores[0]})
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_away_score_text_' + i;
                                                })
                                                .attr('class', 'game_selector_score_text')
                                                .attr('x', game_selector_game_width / 2 - game_selector_score_text_offset)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_score_font_size)
                                                .style('font-weight', 500)
                                                .attr('fill', color_dict.black);
    
    let game_selector_home_score_text = game_selector_games_g.append('text')
                                                .text(function(d) {return d.team_scores[1]})
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_home_score_text_' + i;
                                                })
                                                .attr('class', 'game_selector_score_text')
                                                .attr('x', game_selector_game_width / 2 + game_selector_score_text_offset)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_score_font_size)
                                                .style('font-weight', 500)
                                                .attr('fill', color_dict.black);
    
    let game_selector_date_font_size = '10px';
    let game_selector_date_padding = 12;
    
    
    let game_selector_date_text = game_selector_games_g.append('text')
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_date_text_' + i
                                                })
                                                .attr('class', 'game_selector_date_text')
                                                .text(function(d) {return d.game_date_str})
                                                .attr('x', game_selector_date_padding)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_date_font_size)
                                                .style('font-weight', 300)
                                                .attr('fill', color_dict.black);
    
    let game_selector_status_text = game_selector_games_g.append('text')
                                                .attr('id', function(d,i) {
                                                    return 'game_selector_status_text_' + i
                                                })
                                                .attr('class', 'game_selector_status_text')
                                                .text(function(d) {return d.game_status})
                                                .attr('x', game_selector_game_width - game_selector_date_padding)
                                                .attr('y', game_selector_game_height / 2)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', game_selector_date_font_size)
                                                .style('font-weight', 300)
                                                .attr('fill', color_dict.black);
    
    let game_selector_highlight_width = 4;
    
    let game_selector_highlights = game_selector_games_g.selectAll('.game_selector_highlights')
                                                .data(function(d) {return d.team_colors})
                                                .enter()
                                                .append('rect')
                                                .attr('class', 'game_selector_highlights')
                                                .attr('x', function(d,i) {
                                                    if (i == 0) {
                                                        return 0
                                                    } else {
                                                        return game_selector_game_width - game_selector_highlight_width;
                                                    }
                                                })
                                                .attr('y', 0)
                                                .attr('width', game_selector_highlight_width)
                                                .attr('height', game_selector_game_height)
                                                .attr('fill', color_dict.transparent);
                                                
                                                
                                    
    
    
}


//Connect to websocket
function startWebSocket() {
    ws_conn = new WebSocket('wss://api.untouted.com');
    console.log('Websocket Connected.')

    setTimeout(function() {
        
        closeProcessingScreen();

    }, 3500)

    ws_conn.onmessage = function incoming(event) {
        
        let resp_dict = JSON.parse(event.data)
        
        let resp_type = resp_dict['resp_type']
        
        console.log(resp_dict);
        
        if (resp_type == 'schedule_info') {
            
            schedule_data = resp_dict['data']
            updateScheduleInfo(schedule_data);
            
        } else if (resp_type == 'game_details') {
            d3.select('#game_details_svg').remove();
            
            game_details_data = resp_dict['data']

            color_dict['away_team_color'] = game_details_data['team_colors'][0]
            color_dict['home_team_color'] = game_details_data['team_colors'][1]

            drawGameDetails(game_details_data, 1);   
            
        } else if (resp_type == 'diff_chart') {
                 
            
            
        } else if (resp_type == 'team_stats') {

            team_stat_data = resp_dict['data'];
            populateTeamStatData(team_stat_order_dict, team_stat_data, team_stats_domain_data);
            
        } else if (resp_type == 'team_stats_domain') {

            team_stats_domain_data = resp_dict['data'];
            console.log(team_stats_domain_data, 'loaded')

        }
        
    }

    ws_conn.onclose = function() {
        ws_conn = null;
        console.log('Websocket Disconnected.')
        setTimeout(startWebSocket, 500);
    }

}

openProcessingScreen('Connecting')
startWebSocket();

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
      callback();
    }, 50), false);
	}};

  // returns the me object that has all the public functions in it
	return me;
})();


setTimeout(function() {
    
        //Initial draw functions go here
        width = d3.select('#viz').node().getBoundingClientRect().width;
        height = d3.select('#viz').node().getBoundingClientRect().height;
        orient = (width / height) > (4 / 3)   ? 'landscape' : 'portrait';

        drawGameSelector();
        drawTeamStatElements();

        //Send init requests
        let init_game_req = {
            req_type: 'game_details',
            game_id: 82331
        }

        let init_team_stats_req = {
            req_type: 'team_stats',
            game_id: 82331
        }
                
        let init_schedule_req = {
            req_type: 'schedule_info',
            'season': 2020,
            'week': 16
        }
        
        let init_diff_chart_req = {
            req_type: 'diff_chart',
            game_id: 82331
        }

        let init_team_stats_domain_req = {
            req_type: 'team_stats_domain'
        }

        ws_conn.send(JSON.stringify(init_team_stats_domain_req));
        ws_conn.send(JSON.stringify(init_game_req));
        ws_conn.send(JSON.stringify(init_team_stats_req));
        ws_conn.send(JSON.stringify(init_schedule_req));  
        ws_conn.send(JSON.stringify(init_diff_chart_req));
        
        
        

        APP.onResize(function() {
            
                
            //Resize functions go here
            //ws_conn.send('Buenos Diaz')
            
            repositionVizElements();
            
            });

    
    }, 3500);


