//Create globlal vars
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

let color_dict = {black: '#000', 'white': '#fff', 'gray_bg': '#ebebeb', red: '#f55e5e',
                 med_gray: '#c0c0c0', dark_gray: '#777', transparent: 'rgba(0,0,0,0)',
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
let chart_title_button_data = ['Game Chart', 'Team Stats'];
let chart_title_button_spacing = 0
let chart_title_button_width = 120;
let chart_title_button_height = 25;
let chart_sidebar_width = 100;
let chart_sidebar_button_height = 22;
let chart_sidebar_highlight_height = 14;
let chart_sidebar_highlight_width = 5;
let chart_sidebar_padding = 40;
let chart_sidebar_button_top_padding = 5;
let chart_title_button_text_font_size = '16px';
let chart_sidebar_button_font_size = '14px';
let diff_data = {}
let dummy_chart_sidebar_data = {
    game_logos: ['/images/bears_logo.png', 'images/raiders_logo.png'],
    chart_categories: [{display_name: 'Points', col_name: '_points_diff'} , {display_name: 'Plays', col_name: '_num_plays_diff'},
                       {display_name: 'Turnovers', col_name: '_turnover_diff'}, 
                       {display_name: 'Drives', col_name: '_num_drives_diff'},
                       {display_name: 'First Downs', col_name: '_first_downs_diff'},
                       {display_name: 'Redzones', col_name: '_red_zone_count_diff'},
                       {display_name: 'Rush EPA', col_name: '_rush_epa_diff'},
                       {display_name: 'Pass EPA', col_name: '_pass_epa_diff'}, {display_name: 'Total EPA', col_name: '_epa_diff'},
                       {display_name: 'Rush ATT', col_name: '_rush_att_diff'}, {display_name: 'Pass ATT', col_name: '_pass_att_diff'},
                       {display_name: 'Pass Comp', col_name: '_pass_comp_diff'}, {display_name: 'Rush Yds', col_name: '_rush_yards_diff'},
                       {display_name: 'Pass Yds', col_name: '_pass_yards_diff'}, {display_name: 'Total Yds', col_name:'_total_yards_diff'},
                       {display_name: 'Sacks For', col_name: '_sacks_diff'}, {display_name: 'Penalties', col_name: '_total_penalties_diff'}, 
                       {display_name: 'Penalty Yds', col_name: '_total_penalty_yards_diff'}, 
                       {display_name: 'Plays 10+', col_name: '_plays_10_yards_plus_diff'}, 
                       {display_name: 'Plays 20+', col_name: '_plays_20_yards_plus_diff'}, 
                       {display_name: 'Plays 40+', col_name: '_plays_40_yards_plus_diff'}, 
                       ]
}

//Init dict to handle sidebar clicks on/off
let sidebar_click_dict = {};
    
//List categories that load clicked
let preclicked_categories = ['away_points_diff', 'home_points_diff'];

for (var i = 0; i < dummy_chart_sidebar_data.chart_categories.length; i++) {
    
    let category_name = dummy_chart_sidebar_data.chart_categories[i]['col_name'];
    let away_category_name = 'away' + category_name;
    let home_category_name = 'home' + category_name;
    let category_array = [away_category_name, home_category_name];
    
    for (z = 0; z < category_array.length; z++) {
        
            if (preclicked_categories.includes(category_array[z])) {
                sidebar_click_dict[category_array[z]] = 1
            } else {
                sidebar_click_dict[category_array[z]] = 0
            }
    
        }
    
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
            .style('height', '157px');

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
function drawGameDetails(game_details_data) {
    game_details_data = game_details_data;
    
    let game_details_width = d3.select('#game_details_contents').node().getBoundingClientRect().width;
    let game_details_height = d3.select('#game_details_contents').node().getBoundingClientRect().height;
    let game_status_padding = 5;
    let navbar_height = d3.select('#navbar').node().getBoundingClientRect().height;

    let game_details_svg = d3.select('#game_details_contents')
                                .append('svg')
                                    .attr('id', 'game_details_svg')
                                    .attr('width', '100%')
                                    .attr('height', '100%');
    
    let game_status_font_size = '16px';


    let game_status_text = game_details_svg.append('text')
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
    
    let game_date_text = game_details_svg.append('text')
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
    
    let game_ou_text = game_details_svg.append('text')
                                    .text('o/u ' + game_details_data.game_ou)
                                    .attr('id', 'game_ou_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2)
                                    .attr('y', game_details_height - 5)
                                    .attr('text-anchor', 'middle')
                                    .attr('font-size', game_betting_font_size)
                                    .attr('fill', color_dict.dark_gray);
    
    let game_spread_text = game_details_svg.selectAll('.game_spread_text')
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
                                    .attr('y', game_details_height - 5)
                                    .attr('font-size', game_betting_font_size)
                                    .attr('text-anchor', 'middle')
                                    .attr('fill', color_dict.dark_gray)
                                    .attr('font-weight', 100);
    
    let game_pregame_line_text = game_details_svg.append('text')
                                    .text('Closing Lines')
                                    .attr('id', 'game_pregame_line_text')
                                    .attr('class', 'game_details_font')
                                    .attr('x', game_details_width / 2 - game_score_offset - 30)
                                    .attr('y', game_details_height - 5)
                                    .attr('text-anchor', 'end')
                                    .attr('font-size', '10px')
                                    .attr('font-weight', 100)
                                    .attr('fill', color_dict.med_gray);
    
    
    
    
    let game_scores_font_size = '48px';
    let game_score_text = game_details_svg.selectAll('.game_status_score_text')
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

    
    let game_logo_offset = 350;
    let game_logo_height = 70;
    let game_logo_logos = game_details_svg.selectAll('.game_details_logos')
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
    
    let team_name_padding = 10;
    let away_team_bbox = d3.select('#game_away_logo').node().getBBox()
    let home_team_bbox = d3.select('#game_home_logo').node().getBBox()
    
    let away_team_name_x = away_team_bbox.x + away_team_bbox.width + team_name_padding;
    let home_team_name_x = home_team_bbox.x - team_name_padding;
    let team_loc_font_size = '18px';
    let team_name_font_size = '14px';
    let team_name_spacing = 8;

    let game_team_locs = game_details_svg.selectAll('.game_details_team_names')
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
    
    let game_team_names = game_details_svg.selectAll('.game_details_team_names')
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
    
    let game_selector_g_x = game_details_width - 100;
    
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
                                        
    
    let game_selector_season_array = ['2020','2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012'];
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

function drawChartElements() {
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
    
    let chart_x_axis = chart_contents_g.append('line')
                                    .attr('id','chart_x_axis')
                                    .attr('x1', 0)
                                    .attr('y1', (chart_contents_height + chart_contents_top) / 2)
                                    .attr('x2', chart_contents_width)
                                    .attr('y2', (chart_contents_height + chart_contents_top) / 2)
                                    .attr('stroke', color_dict.black)
                                    .attr('stroke-width', .25)
                                    .style('shape-rendering', 'CrispEdges');
                            
    
    //Draw chartbars   
    
    let chart_sidebar_total_height = (dummy_chart_sidebar_data.chart_categories.length + 1) * chart_sidebar_button_height;
    let chart_sidebar_padding_top = (chart_contents_height - chart_sidebar_total_height) / 2 + chart_contents_top;
    
    let away_sidebar_g = chart_g.append('g')
                                .attr('id', 'away_sidebar_g')
                                .attr('transform', 'translate(0,' + chart_sidebar_padding_top + ')');
    
    let away_sidebar_bg = away_sidebar_g.append('rect')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_sidebar_total_height)
                                .attr('fill', color_dict.transparent)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', .5)
                                .style('shape-rendering', 'CrispEdges');
    
    let away_sidebar_title_bg = away_sidebar_g.append('rect')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_sidebar_button_height)
                                .attr('fill', color_dict.gray_bg)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', 1)
                                .style('shape-rendering', 'CrispEdges');
    
    let away_sidebar_title_text = away_sidebar_g.append('text')
                                .text('Away')
                                .attr('class', 'chart_title_button_text')
                                .attr('font-size', '14px')
                                .attr('fill', color_dict.black)
                                .style('font-weight', 500)
                                .attr('x', chart_sidebar_width / 2)
                                .attr('y', chart_sidebar_button_height / 2)
                                .attr('text-anchor', 'middle')
                                .attr('dominant-baseline', 'middle')
                                .style('shape-rendering', 'CrispEdges');
                                
    
        
    let away_sidebar_button_g = away_sidebar_g.selectAll('.away_sidebar_button_g')
                                        .data(dummy_chart_sidebar_data.chart_categories)
                                        .enter()
                                        .append('g')
                                        .attr('id', function(d,i) {
                                            return 'away_sidebar_button_g_' + i;
                                        })
                                        .attr('class', 'away_sidebar_button_g')
                                        .attr('transform', function(d,i) {
                                            return  'translate(0,' + ((i + 1) * chart_sidebar_button_height) + ')'
                                        })
                                        .style('cursor', 'pointer')
                                        .on('click', function(d,i) {
                                            
                                            let category_name = 'away' + d.col_name;
                                            
                                            let category_clicked = sidebar_click_dict[category_name];
                                            
                                            if (category_clicked == 0) {
                                            
                                                d3.select(this).select('.chart_sidebar_button_highlight')
                                                    .attr('fill', color_dict[category_name]);

                                                d3.select(this).select('.chart_sidebar_button_text')
                                                    .style('font-weight', 500);
                                                
                                                sidebar_click_dict[category_name] = 1 

                                                drawDiffLine(category_name, diff_data)
                                                
                                            } else {
                                                
                                                d3.select(this).select('.chart_sidebar_button_highlight')
                                                    .attr('fill', color_dict.transparent);

                                                d3.select(this).select('.chart_sidebar_button_text')
                                                    .style('font-weight', 300);
                                                
                                                sidebar_click_dict[category_name] = 0

                                                removeDiffLine(category_name);
                                                
                                            }
                                        });
                                            
                                            
                                            
    
    let away_sidebar_button_bg = away_sidebar_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'away_sidebar_button_bg_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_bg')
                                        .attr('width', chart_sidebar_width)
                                        .attr('fill', color_dict.transparent)
                                        .attr('height', chart_sidebar_button_height);
    
    let away_sidebar_button_text = away_sidebar_button_g.append('text')
                                        .text(function(d) {return d.display_name})
                                        .attr('id', function(d, i) {
                                            return 'away_sidebar_button_text_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_text')
                                        .attr('font-size', chart_sidebar_button_font_size)
                                        .attr('fill', color_dict.black)
                                        .style('font-weight', 300)
                                        .attr('x', 5)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .attr('dominant-baseline', 'middle')
                                        .style('shape-rendering', 'CrispEdges');
    
    let away_sidebar_highlight = away_sidebar_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'away_sidebar_button_highlight_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_highlight')
                                        .attr('x', chart_sidebar_width - chart_sidebar_highlight_width)
                                        .attr('y', 2)
                                        .attr('width', chart_sidebar_highlight_width)
                                        .attr('height', chart_sidebar_highlight_height)
                                        .attr('fill', color_dict.transparent);
    
    
    let home_sidebar_g = chart_g.append('g')
                                .attr('id', 'home_sidebar_g')
                                .attr('transform', 'translate(' + (chart_bg_width - chart_sidebar_width) + ',' + chart_sidebar_padding_top + ')');
    
    let home_sidebar_bg = home_sidebar_g.append('rect')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_sidebar_total_height)
                                .attr('fill', color_dict.transparent)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', .5)
                                .style('shape-rendering', 'CrispEdges');
    
    let home_sidebar_title_bg = home_sidebar_g.append('rect')
                                .attr('width', chart_sidebar_width)
                                .attr('height', chart_sidebar_button_height)
                                .attr('fill', color_dict.gray_bg)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', 1)
                                .style('shape-rendering', 'CrispEdges');
    
    let home_sidebar_title_text = home_sidebar_g.append('text')
                                .text('Home')
                                .attr('class', 'chart_title_button_text')
                                .attr('font-size', '14px')
                                .attr('fill', color_dict.black)
                                .style('font-weight', 500)
                                .attr('x', chart_sidebar_width / 2)
                                .attr('y', chart_sidebar_button_height / 2)
                                .attr('text-anchor', 'middle')
                                .attr('dominant-baseline', 'middle')
                                .style('shape-rendering', 'CrispEdges');
                                
    
        
    let home_sidebar_button_g = home_sidebar_g.selectAll('.home_sidebar_button_g')
                                        .data(dummy_chart_sidebar_data.chart_categories)
                                        .enter()
                                        .append('g')
                                        .attr('id', function(d,i) {
                                            return 'home_sidebar_button_g_' + i;
                                        })
                                        .attr('class', 'home_sidebar_button_g')
                                        .attr('transform', function(d,i) {
                                            return  'translate(0,' + ((i + 1) * chart_sidebar_button_height) + ')'
                                        })
                                        .style('cursor', 'pointer')
                                        .on('click', function(d,i) {
                                            
                                            let category_name = 'home' + d.col_name;
                                            
                                            let category_clicked = sidebar_click_dict[category_name];
                                            
                                            if (category_clicked == 0) {
                                            
                                                d3.select(this).select('.chart_sidebar_button_highlight')
                                                    .attr('fill', color_dict[category_name]);

                                                d3.select(this).select('.chart_sidebar_button_text')
                                                    .style('font-weight', 500);
                                                
                                                sidebar_click_dict[category_name] = 1 

                                                drawDiffLine(category_name, diff_data)
                                                
                                            } else {
                                                
                                                d3.select(this).select('.chart_sidebar_button_highlight')
                                                    .attr('fill', color_dict.transparent);

                                                d3.select(this).select('.chart_sidebar_button_text')
                                                    .style('font-weight', 300);
                                                
                                                sidebar_click_dict[category_name] = 0

                                                removeDiffLine(category_name);
                                                
                                            }
                                            
                                    
                                            
                                        });
                                            
                                            
                                            
    
    let home_sidebar_button_bg = home_sidebar_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'home_sidebar_button_bg_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_bg')
                                        .attr('width', chart_sidebar_width)
                                        .attr('fill', color_dict.transparent)
                                        .attr('height', chart_sidebar_button_height);
    
    let home_sidebar_button_text = home_sidebar_button_g.append('text')
                                        .text(function(d) {return d.display_name})
                                        .attr('id', function(d, i) {
                                            return 'home_sidebar_button_text_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_text')
                                        .attr('font-size', chart_sidebar_button_font_size)
                                        .attr('fill', color_dict.black)
                                        .style('font-weight', 300)
                                        .attr('x', 5)
                                        .attr('y', chart_sidebar_button_height / 2)
                                        .attr('dominant-baseline', 'middle')
                                        .style('shape-rendering', 'CrispEdges');
    
    let home_sidebar_highlight = home_sidebar_button_g.append('rect')
                                        .attr('id', function(d, i) {
                                            return 'home_sidebar_button_highlight_' + i;
                                        })
                                        .attr('class', 'chart_sidebar_button_highlight')
                                        .attr('x', chart_sidebar_width - chart_sidebar_highlight_width)
                                        .attr('y', 2)
                                        .attr('width', chart_sidebar_highlight_width)
                                        .attr('height', chart_sidebar_highlight_height)
                                        .attr('fill', color_dict.transparent);                    
    
}

function drawDiffLine(diff_col, diff_data) {

    console.log('draw_diff_line', diff_col);

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

    let diff_x_scale = d3.scaleLinear()
                            .domain([0, 60])
                            .range([0, x_end_margin]);

    let diff_y_scale = d3.scaleLinear()
                            .domain([-30, 30])
                            .range([chart_contents_height, chart_contents_top]);

    chart_contents_g.append('path')
                    .datum(line_data)
                    .attr('fill', 'none')
                    .attr('stroke', color_dict[diff_col])
                    .attr('stroke-width', 2)
                    .attr('id', line_id_name)
                    .attr('class', 'removable_chart_elements')
                    .attr('d', d3.line()
                                    .curve(d3.curveBasis)
                                    .x(function(d) { return diff_x_scale(d.game_min)})
                                    .y(function(d) { return diff_y_scale(d.cum_sum)}))
                    .style('opacity', 0)
                    .transition()
                    .duration(300)
                    .style('opacity', 1);



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
                console.log(diff_col, i);
                drawDiffLine(diff_col, diff_data);
            }
        }
    }

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
var ws_conn = new WebSocket('wss://api.untouted.com');

ws_conn.onmessage = function incoming(event) {
    
    let resp_dict = JSON.parse(event.data)
    
    let resp_type = resp_dict['resp_type']
    
    console.log(resp_dict);
    
    if (resp_type == 'schedule_info') {
        
        schedule_data = resp_dict['data']
        updateScheduleInfo(schedule_data);
        
    } else if (resp_type == 'game_details') {
        d3.select('#game_details_svg').remove();
        
        var game_details_data = resp_dict['data']
        drawGameDetails(game_details_data);   
        
    } else if (resp_type == 'diff_chart') {
        
        let chart_contents_g = d3.select('#chart_contents_g');
    
        //Clear out previous chart elements Here 
        chart_contents_g.selectAll('.removable_chart_elements').remove();

        diff_data = resp_dict['data']
        drawDiffChart(diff_data, sidebar_click_dict)
        
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
        drawChartElements();
        
        //Send init requests
        let init_game_req = {
            req_type: 'game_details',
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
        
        ws_conn.send(JSON.stringify(init_game_req));
        ws_conn.send(JSON.stringify(init_schedule_req));  
        ws_conn.send(JSON.stringify(init_diff_chart_req));
    
        APP.onResize(function() {
            
                
            //Resize functions go here
            //ws_conn.send('Buenos Diaz')
            
            repositionVizElements();
            
            });

    
    }, 300);

// Call onResize like this
