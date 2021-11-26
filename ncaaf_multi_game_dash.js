
//Create globlal vars
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


var ws_conn, teams_array, team_sched_data, curr_team_id, chart_to_display;
var time_series_data = [], time_series_domain_data = [];
var time_series_color_dict = {};

var stat_select_dict = {stat_category: 'none', stat_selected: 'none', stat_for_against: 'none', ratio_num_games: 'none',
                        prev_ratio_game_ids: []};

let sidebar_stat_for_against_selected = 0;

let color_dict = {black: '#000', 'white': '#fff', 'gray_bg': '#ebebeb', red: '#f55e5e', light_green: '#87f069',
                 orange: '#fe502d', med_gray: '#c0c0c0', dark_gray: '#777', transparent: 'rgba(0,0,0,0)'
                };

let line_color_array = [
                '#ef476f',
                '#dddf00',
                '#06d6a0',
                '#118ab2',
                '#073b4c',
                '#ff0000',
                '#9636ff',
                '#ff6d00',
                '#096644'
                ];


let conference_array = [
    {name: 'American', conf_id: 94},
    {name: 'ACC', conf_id: 3},
    {name: 'Big 12', conf_id: 4},
    {name: 'Big Ten', conf_id: 6},
    {name: 'Conference USA', conf_id: 7},
    {name: 'Independents', conf_id: 8},
    {name: 'Mid-American', conf_id: 9},
    {name: 'Mountain West', conf_id: 10},
    {name: 'Pac-12', conf_id: 11},
    {name: 'SEC', conf_id: 12},
    {name: 'Sun Belt', conf_id: 13}
]

let stat_array = {totals: [
    {stat_name: 'num_drives', display_name: 'Drives'},
    {stat_name: 'num_plays', display_name: 'Plays'},
    {stat_name: 'first_downs', display_name: 'First Downs'},
    {stat_name: 'off_points', display_name: 'Off Points'},
    {stat_name: 'def_points', display_name: 'Def Points'},
    {stat_name: 'points', display_name: 'Total Points'},
    {stat_name: 'rush_att', display_name: 'Rush Att'},
    {stat_name: 'rush_yards', display_name: 'Rush Yards'},
    {stat_name: 'pass_att', display_name: 'Pass Att'},
    {stat_name: 'pass_comp', display_name: 'Pass Comp'},
    {stat_name: 'pass_yards', display_name: 'Pass Yards'},
    {stat_name: 'total_yards', display_name: 'Total Yards'},
    {stat_name: 'punts', display_name: 'Punts'},
    {stat_name: 'punt_yards', display_name: 'Punt Yards'},
    {stat_name: 'off_penalties', display_name: 'Off Penalties'},
    {stat_name: 'off_penalty_yards', display_name: 'Off Penalty Yards'},
    {stat_name: 'def_penalties', display_name: 'Def Penalties'},
    {stat_name: 'def_penalty_yards', display_name: 'Def Penalty Yards'},
    {stat_name: 'total_penalties', display_name: 'Total Penalties'},
    {stat_name: 'total_penalty_yards', display_name: 'Total Penalty Yards'},
    {stat_name: 'fumbles', display_name: 'Fumbles'},
    {stat_name: 'fumbles_lost', display_name: 'Fumbles Lost'},
    {stat_name: 'int', display_name: 'Interceptions'},
    {stat_name: 'turnover', display_name: 'Turnovers'},
    {stat_name: 'tackle_for_loss', display_name: 'Tackles for Loss'},
    {stat_name: 'sacks', display_name: 'Sacks'},
    {stat_name: 'sack_yards', display_name: 'Sack Yards'},
    {stat_name: 'plays_10_yards_plus', display_name: 'Plays 10 Yards+'},
    {stat_name: 'plays_20_yards_plus', display_name: 'Plays 20 Yards+'},
    {stat_name: 'plays_40_yards_plus', display_name: 'Plays 40 Yards+'},
    {stat_name: 'plays_70_yards_plus', display_name: 'Plays 70 Yards+'},
    {stat_name: 'epa', display_name: 'Total EPA'},
    {stat_name: 'rush_epa', display_name: 'Rush EPA'},
    {stat_name: 'pass_epa', display_name: 'Pass EPA'},
    {stat_name: 'first_down_epa', display_name: 'First Down EPA'},
    {stat_name: 'second_down_epa', display_name: 'Second Down EPA'},
    {stat_name: 'third_down_epa', display_name: 'Third Down EPA'},
    {stat_name: 'first_down_count', display_name: 'First Down Count'},
    {stat_name: 'second_down_count', display_name: 'Second Down Count'},
    {stat_name: 'third_down_count', display_name: 'Third Down Count'},
    {stat_name: 'fourth_down_count', display_name: 'Fourth Down Count'},
    {stat_name: 'first_down_yards', display_name: 'First Down Yards'},
    {stat_name: 'second_down_yards', display_name: 'Second Down Yards'},
    {stat_name: 'third_down_yards', display_name: 'Third Down Yards'},
    {stat_name: 'third_down_conv', display_name: 'Third Down Conversion'},
    {stat_name: 'red_zone_count', display_name: 'Num Red Zones'},
    {stat_name: 'red_zone_td', display_name: 'Num Red Zone TDs'},
    {stat_name: 'red_zone_fg', display_name: 'Num Red Zone FGs'},
    {stat_name: 'tackle_for_loss', display_name: 'Tackles For Loss'},
    {stat_name: 'success_play', display_name: 'Success Plays'},
    {stat_name: 'first_down_success', display_name: 'First Down Success Plays'},
    {stat_name: 'second_down_success', display_name: 'Second Down Success Plays'},
    {stat_name: 'third_down_success', display_name: 'Third Down Success Plays'},
    {stat_name: 'fourth_down_success', display_name: 'Fourth Down Success Plays'},
    {stat_name: 'fourth_down_att', display_name: 'Fourth Down Attempts'},
    ],
    ratios: [
        {stat_name: 'plays_per_drive', display_name: 'Plays Per Drive'},
        {stat_name: 'first_downs_per_drive', display_name: 'First Downs Per Drive'},
        {stat_name: 'off_points_per_drive', display_name: 'Off Points Per Drive'},
        {stat_name: 'total_epa_per_drive', display_name: 'EPA Per Drive'},
        {stat_name: 'rush_epa_per_drive', display_name: 'Rush EPA Per Drive'},
        {stat_name: 'pass_epa_per_drive', display_name: 'Pass EPA Per Drive'},
        {stat_name: 'rush_att_per_drive', display_name: 'Rush Att Per Drive'},
        {stat_name: 'pass_att_per_drive', display_name: 'Pass Att Per Drive'},
        {stat_name: 'pass_comp_per_drive', display_name: 'Pass Comp Per Drive'},
        {stat_name: 'rush_yards_per_drive', display_name: 'Rush Yards Per Drive'},
        {stat_name: 'pass_yards_per_drive', display_name: 'Pass Yards Per Drive'},
        {stat_name: 'total_yards_per_drive', display_name: 'Total Yards Per Drive'},
        {stat_name: 'rush_att_percent', display_name: 'Rush Att Percent'},
        {stat_name: 'rush_yards_per_att', display_name: 'Rush Yards Per Att'},
        {stat_name: 'rush_epa_per_att', display_name: 'Rush EPA Per Att'},
        {stat_name: 'pass_att_percent', display_name: 'Pass Att Percent'},
        {stat_name: 'pass_yards_per_att', display_name: 'Pass Yards Per Attempt'},
        {stat_name: 'pass_epa_per_att', display_name: 'Pass EPA Per Attempt'},
        {stat_name: 'pass_yards_per_comp', display_name: 'Pass Yards Per Comp'},
        {stat_name: 'pass_epa_per_comp', display_name: 'Pass EPA Per Comp'},
        {stat_name: 'total_yards_per_play', display_name: 'Total Yards Per Play'},
        {stat_name: 'total_epa_per_play', display_name: 'Total EPA Per Play'},
        {stat_name: 'success_rate', display_name: 'Success Rate'},
        {stat_name: 'punts_per_drive', display_name: 'Punts Per Drive'},
        {stat_name: 'yards_per_punt', display_name: 'Yards Per Punt'},
        {stat_name: 'off_penalties_per_drive', display_name: 'Off Penalties Per Drive'},
        {stat_name: 'def_penalties_per_opp_drive', display_name: 'Def Penalties Per Opp Drive'},
        {stat_name: 'yards_per_penalty', display_name: 'Yards Per Penalty'},
        {stat_name: 'fumbles_per_drive', display_name: 'Fumbles Per Drive'},
        {stat_name: 'fumbles_lost_per_drive', display_name: 'Fumbles Lost Per Drive'},
        {stat_name: 'fumbles_lost_percent', display_name: 'Fumbles Lost Percent'},
        {stat_name: 'int_per_drive', display_name: 'Interception Per Drive'},
        {stat_name: 'turnovers_per_drive', display_name: 'Turnovers Per Drive'},
        {stat_name: 'sacks_per_opp_drive', display_name: 'Sacks Per Opp Drive'},
        {stat_name: 'sacks_allowed_per_drive', display_name: 'Sacks Allowed Per Drive'},
        {stat_name: 'tackles_for_loss_per_opp_drive', display_name: 'Tackle For Loss Per Opp Drive'},
        {stat_name: 'plays_10_yards_plus_per_drive', display_name: 'Plays 10 Yards+ Per Drive'},
        {stat_name: 'plays_20_yards_plus_per_drive', display_name: 'Plays 20 Yards+ Per Drive'},
        {stat_name: 'plays_40_yards_plus_per_drive', display_name: 'Plays 40 Yards+ Per Drive'},
        {stat_name: 'plays_70_yards_plus_per_drive', display_name: 'Plays 70 Yards+ Per Drive'},
        {stat_name: 'epa_per_first_down', display_name: 'First Down EPA'},
        {stat_name: 'epa_per_second_down', display_name: 'Second Down EPA'},
        {stat_name: 'epa_per_third_down', display_name: 'Third Down EPA'},
        {stat_name: 'yards_per_first_down', display_name: 'Yards Per First Down'},
        {stat_name: 'yards_per_second_down', display_name: 'Yards Per Second Down'},
        {stat_name: 'yards_per_third_down', display_name: 'Yards Per Third Down'},
        {stat_name: 'success_rate_first_down', display_name: 'First Down Success Rate'},
        {stat_name: 'success_rate_second_down', display_name: 'Second Success Rate'},
        {stat_name: 'success_rate_third_down', display_name: 'Third Down Success Rate'},
        {stat_name: 'third_down_conv_percent', display_name: 'Third Down Conversion Percent'},
        {stat_name: 'red_zone_points_conv', display_name: 'Points per Red Zone'},
        {stat_name: 'red_zone_td_conv', display_name: 'TD per Red Zone'},
        {stat_name: 'red_zone_fg_conv', display_name: 'FG per Red Zone'}

    ]
}

let sidebar_width = 220;
let slider_num_games = 13;
let ratio_num_games = 5;

function openTeamSelect(teams_array, conference_id) {

    d3.selectAll('#sidebar_teams_g').remove()

    let conference_name = 'NULL';

    for (var i = 0; i < teams_array.length; i++) {

        team_data = teams_array[i]

        if (team_data['conference_id'] === conference_id) {

            conference_name = team_data['conference_name'];
            break;
        }

    }

    let filtered_teams_array = teams_array.filter(function(d) {return d.conference_id === conference_id});

    let sidebar_svg = d3.select('#sidebar_svg');
    let sidebar_contents = d3.select('#sidebar_contents');
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let division_row_height = 30;

    sidebar_contents.transition()
                .duration(300)
                .style('width', (sidebar_width * 2.7) + 'px');

    sidebar_svg.transition()
                .duration(300)
                .attr('width', sidebar_width * 2.7);

    let sidebar_teams_g = sidebar_svg.append('g')
                .attr('id', 'sidebar_teams_g');

    let sidebar_teams_border_line = sidebar_teams_g.append('line')
                        .attr('id', 'sidebar_teams_border_line')
                        .attr('x1', sidebar_width * 1.85)
                        .attr('x2', sidebar_width * 1.85)
                        .attr('y1', 40)
                        .attr('y2', height - 40)
                        .attr('stroke', color_dict.gray_bg)
                        .attr('stroke-width', 1)
                        .style('shape-rendering', 'CrispEdges');

    let sidebar_conference_title = sidebar_teams_g.append('text')
                        .text(conference_name)
                        .attr('class', 'sidebar_header_text')
                        .attr('id', 'sidebar_teams_title')
                        .attr('x', (sidebar_width * 1.85) + 20)
                        .attr('y', 40)
                        .style('dominant-baseline', 'hanging');

    let sidebar_team_title_g = sidebar_teams_g.selectAll('.sidebar_team_title_g')
                        .data(filtered_teams_array)
                        .enter()
                        .append('g')
                        .attr('class', 'sidebar_team_title_g')
                        .style('cursor', 'pointer')
                        .attr('transform', function(d, i) {
                            
                            let division_x = sidebar_width * 1.85 + 40;
                            let division_y = 60 + division_row_height + (i * division_row_height)

                            return 'translate(' + division_x + ',' + division_y + ')'
                        })
                        .on('mouseover', function() {

                            d3.select(this).select('.sidebar_team_title_highlight')
                                .style('opacity', 1);
                        })
                        .on('mouseout', function() {

                            d3.select(this).select('.sidebar_team_title_highlight')
                                .style('opacity', 0);
                        })
                        .on('click', function(d) {
                            //openTeamSelect(teams_array, d.conf_id)
                            let team_info_req = {
                                req_type: 'team_info_request',
                                team_id: d.team_id
                            }

                            //Send request to populate team info
                            ws_conn.send(JSON.stringify(team_info_req));

                            closeSidebarTeamSelector();

                        });

    let sidebar_team_title_text = sidebar_team_title_g.append('text')
                        .text(function(d) { return d.team_loc})
                        .attr('class', 'sidebar_team_title_text')
                        .attr('id', function(d,i) {
                            return 'sidebar_team_title_text_' + d.team_id;
                        })

    let sidebar_team_highlight  = sidebar_team_title_g.append('rect')
                        .attr('x', -10)
                        .attr('y', -10)
                        .attr('width', 3)
                        .attr('height', 10)
                        .attr('fill', color_dict.orange)
                        .style('opacity', 0)
                        .attr('id', function(d,i) {
                            return 'sidebar_team_title_highlight_' + d.team_id;
                        })
                        .attr('class', 'sidebar_team_title_highlight')

    

}

function openConferenceSelector(conference_array) {

    let sidebar_svg = d3.select('#sidebar_svg');
    let sidebar_contents = d3.select('#sidebar_contents');
    let select_team_chevron = d3.select('#select_team_chevron')
    let select_stat_chevron = d3.select('#sidebar_select_stat_chevron')
    let select_team_close_x = d3.select('#select_team_close_x')
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let conf_row_height = 30;


    if (select_stat_chevron.attr('closed') == 0) {

        d3.select('#sidebar_stat_g').remove();

        select_stat_chevron.transition()
                .duration(200)
                .style('opacity', 1);

        d3.select('#select_stat_close_x')
                .transition()
                .duration(200)
                .style('opacity', 0);

        select_stat_chevron.attr('closed', 1);
        

    }

    sidebar_contents.transition()
                .duration(300)
                .style('width', (sidebar_width * 1.85) + 'px');

    sidebar_svg.transition()
                .duration(300)
                .attr('width', sidebar_width * 1.85);

    select_team_chevron
        .transition()
        .duration(200)
        .style('opacity', 0);

    select_team_close_x
        .transition()
        .duration(200)
        .style('opacity', 1);

    let sidebar_conference_g = sidebar_svg.append('g')
                                            .attr('id', 'sidebar_conference_g');

    let sidebar_conference_border_line = sidebar_conference_g.append('line')
                                                    .attr('id', 'sidebar_conference_border_line')
                                                    .attr('x1', sidebar_width)
                                                    .attr('x2', 220)
                                                    .attr('y1', 40)
                                                    .attr('y2', height - 40)
                                                    .attr('stroke', color_dict.gray_bg)
                                                    .attr('stroke-width', 1)
                                                    .style('shape-rendering', 'CrispEdges');

    let sidebar_conference_title = sidebar_conference_g.append('text')
                                                    .text('Conferences')
                                                    .attr('class', 'sidebar_header_text')
                                                    .attr('id', 'sidebar_conference_title')
                                                    .attr('x', sidebar_width + 20)
                                                    .attr('y', 40)
                                                    .style('dominant-baseline', 'hanging');


    let sidebar_conf_title_g = sidebar_conference_g.selectAll('.sidebar_conf_title_g')
                                                    .data(conference_array)
                                                    .enter()
                                                    .append('g')
                                                    .attr('class', 'sidebar_conf_title_g')
                                                    .style('cursor', 'pointer')
                                                    .attr('transform', function(d, i) {
                                                        
                                                        let conf_x = sidebar_width + 40;
                                                        let conf_y = 60 + conf_row_height + (i * conf_row_height)

                                                        return 'translate(' + conf_x + ',' + conf_y + ')'
                                                    })
                                                    .on('mouseover', function() {

                                                        d3.select(this).select('.sidebar_conf_title_highlight')
                                                            .style('opacity', 1);
                                                    })
                                                    .on('mouseout', function() {

                                                        d3.select(this).select('.sidebar_conf_title_highlight')
                                                            .style('opacity', 0);
                                                    })
                                                    .on('click', function(d) {
                                                        openTeamSelect(teams_array, d.conf_id)
                                                    })

    let sidebar_conf_title_text = sidebar_conf_title_g.append('text')
                                                    .text(function(d) { return d.name})
                                                    .attr('class', 'sidebar_conf_title_text')
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_conf_title_text_' + d.conf_id;
                                                    })

    let sidebar_conf_highlight  = sidebar_conf_title_g.append('rect')
                                                    .attr('x', -10)
                                                    .attr('y', -10)
                                                    .attr('width', 3)
                                                    .attr('height', 10)
                                                    .attr('fill', color_dict.orange)
                                                    .style('opacity', 0)
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_conf_title_highlight_' + d.conf_id;
                                                    })
                                                    .attr('class', 'sidebar_conf_title_highlight')
}

function closeSidebarTeamSelector() {
    d3.select('#sidebar_conference_g').remove();
    d3.select('#sidebar_teams_g').remove();

    let sidebar_svg = d3.select('#sidebar_svg');
    let sidebar_contents = d3.select('#sidebar_contents');
    let select_team_chevron = d3.select('#select_team_chevron')
    let select_team_close_x = d3.select('#select_team_close_x')

    sidebar_contents.transition()
                    .duration(300)
                    .style('width', sidebar_width + 'px');

    sidebar_svg.transition()
                .duration(300)
                .attr('width', sidebar_width);

    select_team_chevron
        .transition()
        .duration(100)
        .style('opacity', 1);

    select_team_close_x
        .transition()
        .duration(100)
        .style('opacity', 0);

        
    select_team_chevron.attr('closed', 1);
}

function openStatSelector(stat_array) {

    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let sidebar_svg = d3.select('#sidebar_svg');
    let sidebar_contents = d3.select('#sidebar_contents');
    let select_stat_chevron = d3.select('#sidebar_select_stat_chevron')
    let select_team_chevron = d3.select('#select_team_chevron')
    let select_stat_close_x = d3.select('#select_stat_close_x')
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let stat_row_height = 20;
    let sidebar_stat_width = width;

    if (select_team_chevron.attr('closed') == 0) {

        d3.select('#sidebar_conference_g').remove();
        d3.select('#sidebar_teams_g').remove();

        select_team_chevron.transition()
                .duration(200)
                .style('opacity', 1);

        d3.select('#select_team_close_x')
                .transition()
                .duration(200)
                .style('opacity', 0);

        select_team_chevron.attr('closed', 1);

    }


    sidebar_contents.transition()
                .duration(300)
                .style('width', sidebar_stat_width + 'px');

    sidebar_svg.transition()
                .duration(300)
                .attr('width', sidebar_stat_width);

    select_stat_chevron
        .transition()
        .duration(200)
        .style('opacity', 0);

    select_stat_close_x
        .transition()
        .duration(200)
        .style('opacity', 1);

    let sidebar_stat_g = sidebar_svg.append('g')
                                    .attr('id', 'sidebar_stat_g');
  
    let sidebar_stat_border_line = sidebar_stat_g.append('line')
                                                    .attr('id', 'sidebar_stat_border_line')
                                                    .attr('x1', sidebar_width)
                                                    .attr('x2', sidebar_width)
                                                    .attr('y1', 40)
                                                    .attr('y2', height - 40)
                                                    .attr('stroke', color_dict.gray_bg)
                                                    .attr('stroke-width', 1)
                                                    .style('shape-rendering', 'CrispEdges');

    let sidebar_stat_title_padding = 20;

    let sidebar_stat_title = sidebar_stat_g.append('text')
                                                    .text('Time Series Stats')
                                                    .attr('class', 'sidebar_header_text')
                                                    .attr('id', 'sidebar_stat_title')
                                                    .attr('x', (sidebar_stat_width + sidebar_width) / 2)
                                                    .attr('y', sidebar_stat_title_padding)
                                                    .style('font-size', '30px')
                                                    .style('font-weight', 500)
                                                    .style('dominant-baseline', 'hanging')
                                                    .attr('text-anchor', 'middle');

    let sidebar_stat_for_against_padding_top = 60;
    let sidebar_stat_for_against_button_width = 80;
    let sidebar_stat_for_against_button_height = 30;

    let sidebar_stat_for_against_g = sidebar_stat_g.append('g')
                                                    .attr('id', 'sidebar_stat_for_against_g')
                                                    .attr('transform', 'translate(0,' + sidebar_stat_for_against_padding_top + ')')
                                                    .style('cursor', 'pointer');

    let sidebar_stat_for_against_sub_g = sidebar_stat_for_against_g.selectAll('.sidebar_stat_for_against_sub_g')
                                                    .data(['For', 'Against'])
                                                    .enter()
                                                    .append('g')
                                                    .attr('class', 'sidebar_stat_for_against_sub_g')
                                                    .attr('id', function(d, i) {
                                                        
                                                        return 'sidebar_stat_for_against_sub_g_' + i;

                                                    })
                                                    .attr('transform', function(d,i) {
                                                        let x_value = (sidebar_stat_width + sidebar_width) / 2;

                                                        if (i === 0) {
                                                             x_value = x_value - sidebar_stat_for_against_button_width 
                                                        } 
                                   
                                                        return 'translate(' + x_value + ',0)'

                                                    })
                                                    .on('click', function(d,i) {
                                                        
                                                        if (i === 0) {

                                                            if (sidebar_stat_for_against_selected === 1) {

                                                                sidebar_stat_for_against_selected = 0;

                                                                let other_sub_g = d3.select('#sidebar_stat_for_against_sub_g_1');

                                                                other_sub_g.select('.sidebar_stat_for_against_bg')
                                                                        .attr('fill', color_dict.gray_bg)

                                                                other_sub_g.select('.sidebar_stat_for_against_text')
                                                                        .style('font-weight', 500);

                                                                
                                                                let this_sub_g = d3.select(this);

                                                                this_sub_g.select('.sidebar_stat_for_against_bg')
                                                                        .attr('fill', color_dict.transparent)

                                                                this_sub_g.select('.sidebar_stat_for_against_text')
                                                                        .style('font-weight', 700);
                                                                
                                                                

                                                            }

                                                        } else {

                                                            if (sidebar_stat_for_against_selected === 0) {

                                                                sidebar_stat_for_against_selected = 1;

                                                                let other_sub_g = d3.select('#sidebar_stat_for_against_sub_g_0');

                                                                other_sub_g.select('.sidebar_stat_for_against_bg')
                                                                        .attr('fill', color_dict.gray_bg)

                                                                other_sub_g.select('.sidebar_stat_for_against_text')
                                                                        .style('font-weight', 500);

                                                                
                                                                let this_sub_g = d3.select(this);

                                                                this_sub_g.select('.sidebar_stat_for_against_bg')
                                                                        .attr('fill', color_dict.transparent)

                                                                this_sub_g.select('.sidebar_stat_for_against_text')
                                                                        .style('font-weight', 700);
                                                                

                                                                        }
                                                                    }
                                                                });


    let sidebar_stat_for_against_bg = sidebar_stat_for_against_sub_g
                                                    .append('rect')
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_stat_for_against_bg_' + d.toLowerCase()
                                                    })
                                                    .attr('class', 'sidebar_stat_for_against_bg')
                                                    .attr('x', 0)
                                                    .attr('y', 0)
                                                    .attr('width', sidebar_stat_for_against_button_width)
                                                    .attr('height', sidebar_stat_for_against_button_height)
                                                    .attr('fill', function(d, i) {
                                                        if (i === 0) {

                                                            if (sidebar_stat_for_against_selected == 0) {

                                                                return color_dict.transparent;

                                                            } else {

                                                                return color_dict.gray_bg;
                                                            }
                                                            
                                                        } else {

                                                            if (sidebar_stat_for_against_selected == 1) {

                                                                return color_dict.transparent;

                                                            } else {

                                                                return color_dict.gray_bg;
                                                            }
                                                        }
                                                    })
                                                    .attr('stroke', color_dict.med_gray)
                                                    .attr('stroke-width', '1px')
                                                    .style('shape-rendering', 'CrispEdges');

        let sidebar_stat_for_against_text = sidebar_stat_for_against_sub_g
                                                    .append('text')
                                                    .text(function(d) { return d})
                                                    .attr('class', 'sidebar_stat_for_against_text')
                                                    .attr('id', function(d, i) {
                                                        return 'sidebar_stat_for_against_text_' + d.toLowerCase();
                                                    })
                                                    .attr('x', sidebar_stat_for_against_button_width / 2)
                                                    .attr('y', sidebar_stat_for_against_button_height / 2)
                                                    .attr('font-size', '14px')
                                                    .style('font-weight', function(d,i) {
                                                        
                                                        if (i == 0) {

                                                            if (sidebar_stat_for_against_selected == 0) {

                                                                return 700

                                                            } else {

                                                                return 500;
                                                            }

                                                        } else {

                                                            if (sidebar_stat_for_against_selected == 1) {

                                                                return 700

                                                            } else {

                                                                return 500;
                                                            }
                                                        }
                                                    })
                                                    .style('text-anchor', 'middle')
                                                    .style('dominant-baseline', 'middle')
                                                    .style('font-family', 'Work Sans');

    



    let sidebar_stat_subtitle_padding_top = 105;
    
    //Draw divider between cummulative and ratio stats
    let sidebar_stat_divider_line = sidebar_stat_g.append('line')
                                                .attr('id', 'sidebar_stat_divider_line')
                                                .attr('x1', (sidebar_stat_width + sidebar_width) / 2)
                                                .attr('x2', (sidebar_stat_width + sidebar_width) / 2)
                                                .attr('y1', sidebar_stat_subtitle_padding_top)
                                                .attr('y2', height - 40)
                                                .attr('stroke', color_dict.gray_bg)
                                                .attr('stroke-width', 1)
                                                .style('shape-rendering', 'CrispEdges');

    let sidebar_cum_stat_x = ((sidebar_stat_width + sidebar_width) / 2) - ((sidebar_stat_width - sidebar_width) / 4);
    let sidebar_ratio_stat_x = ((sidebar_stat_width + sidebar_width) / 2) + ((sidebar_stat_width - sidebar_width) / 4);
    let sidebar_eighth_width = (sidebar_stat_width - sidebar_width) / 8;
    let sidebar_stat_sub_titles = sidebar_stat_g.selectAll('.sidebar_stat_sub_titles')
                                                    .data(['Cummulative Stats', 'Ratio Stats'])
                                                    .enter()
                                                    .append('text')
                                                    .text(function (d) {
                                                        return d;
                                                    })
                                                    .attr('class', 'sidebar_stat_subtitles')
                                                    .attr('y', sidebar_stat_subtitle_padding_top)
                                                    .attr('x', function(d,i) {

                                                        if (i == 0) {

                                                            return sidebar_cum_stat_x;
                                                        } else {

                                                            return sidebar_ratio_stat_x;
                                                        }
                                                    })
                                                    .attr('text-anchor', 'middle')
                                                    .style('dominant-baseline', 'hanging')
                                                    .attr('font-weight', 500)
                                                    .attr('font-size', '18px')
                                                    .style('font-family', 'Work Sans');


    let sidebar_cum_stat_title_g = sidebar_stat_g.selectAll('.sidebar_cum_stat_title_g')
                                                    .data(stat_array.totals)
                                                    .enter()
                                                    .append('g')
                                                    .attr('class', 'sidebar_cum_stat_title_g')
                                                    .style('cursor', 'pointer')
                                                    .attr('transform', function(d, i) {
                                                        
                                                        let sidebar_stat_cum_stat_x, sidebar_stat_cum_stat_y;

                                                        if (i + 1 < stat_array.totals.length / 2) {

                                                            sidebar_stat_cum_stat_x = sidebar_cum_stat_x - 170
                                                            sidebar_stat_cum_stat_y = sidebar_stat_subtitle_padding_top + 35 + stat_row_height + (i * stat_row_height)

                                                        } else {

                                                            let z = i - parseInt(stat_array.totals.length / 2)

                                                            sidebar_stat_cum_stat_x = sidebar_cum_stat_x + 30
                                                            sidebar_stat_cum_stat_y = sidebar_stat_subtitle_padding_top + 35 + stat_row_height + (z * stat_row_height)
                                                        }

                                                        return 'translate(' + sidebar_stat_cum_stat_x + ',' + sidebar_stat_cum_stat_y + ')'
                                                    })
                                                    .on('mouseover', function() {
                                                        
                                                        d3.select(this).select('.sidebar_cum_stat_highlight')
                                                            .style('opacity', 1)
                                                    })
                                                    .on('mouseout', function() {

                                                        d3.select(this).select('.sidebar_cum_stat_highlight')
                                                            .style('opacity', 0);
                                                    })
                                                    .on('click', function(d) {
                                                        
                                                        let for_against_text = sidebar_stat_for_against_selected == 0 ? 'For ' : 'Against ';

                                                        stat_select_dict = {stat_category: 'total', stat_selected: d.stat_name, stat_for_against: sidebar_stat_for_against_selected,
                                                                           ratio_num_games: 0};
                                                        
                                                        d3.select('#sidebar_stat_type_text')
                                                            .text(for_against_text + d.display_name);
                            
                                                        closeSidebarStatSelector();

                                                    })

    let sidebar_cum_stat_title_text = sidebar_cum_stat_title_g.append('text')
                                                    .text(function(d) { return d.display_name})
                                                    .attr('class', 'sidebar_stat_title_text')
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_stat_title_text_' + i;
                                                    })
                                                    .attr('text-anchor', 'start')
                                                    .style('font-family', 'Work Sans')
                                                    .style('font-weight', 500)
                                                    .style('font-size', '14px')

    let sidebar_cum_stat_highlight  = sidebar_cum_stat_title_g.append('rect')
                                                    .attr('transform', function(d, i) {

                                                        return 'translate(-6,' + (-1 * stat_row_height + 5) + ')'

                                                    })
                                                    .attr('width', 3)
                                                    .attr('height', stat_row_height)
                                                    .attr('fill', color_dict.orange)
                                                    .style('opacity', 0)
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_cum_stat_highlight_' + d.conf_id;
                                                    })
                                                    .attr('class', 'sidebar_cum_stat_highlight')
                                            
    let sidebar_ratio_stat_title_g = sidebar_stat_g.selectAll('.sidebar_ratio_stat_title_g')
                                                    .data(stat_array.ratios)
                                                    .enter()
                                                    .append('g')
                                                    .attr('class', 'sidebar_ratio_stat_title_g')
                                                    .style('cursor', 'pointer')
                                                    .attr('transform', function(d, i) {
                                                        
                                                        let sidebar_stat_ratio_stat_x, sidebar_stat_ratio_stat_y;

                                                        if (i < stat_array.ratios.length / 2) {

                                                            sidebar_stat_ratio_stat_x = sidebar_ratio_stat_x - 180
                                                            sidebar_stat_ratio_stat_y = sidebar_stat_subtitle_padding_top + 35 + stat_row_height + (i * stat_row_height)

                                                        } else {

                                                            let z = i - parseInt(stat_array.ratios.length / 2)

                                                            sidebar_stat_ratio_stat_x = sidebar_ratio_stat_x + 25
                                                            sidebar_stat_ratio_stat_y = sidebar_stat_subtitle_padding_top + 35 + stat_row_height + (z * stat_row_height)
                                                        }

                                                        return 'translate(' + sidebar_stat_ratio_stat_x + ',' + sidebar_stat_ratio_stat_y + ')'
                                                    })
                                                    .on('mouseover', function() {
                                                        
                                                        d3.select(this).select('.sidebar_ratio_stat_highlight')
                                                            .style('opacity', 1)
                                                    })
                                                    .on('mouseout', function() {

                                                        d3.select(this).select('.sidebar_ratio_stat_highlight')
                                                            .style('opacity', 0);
                                                    })
                                                    .on('click', function(d) {

                                                        let for_against_text = sidebar_stat_for_against_selected == 0 ? 'For ' : 'Against ';

                                                        stat_select_dict = {stat_category: 'ratio', stat_selected: d.stat_name, stat_for_against: sidebar_stat_for_against_selected,
                                                                            ratio_num_games: ratio_num_games}
                                                        
                                                        d3.select('#sidebar_stat_type_text')
                                                            .text(for_against_text + d.display_name);
                            
                                                        closeSidebarStatSelector();
                                                        
                                                    })

    let sidebar_ratio_stat_title_text = sidebar_ratio_stat_title_g.append('text')
                                                    .text(function(d) { return d.display_name})
                                                    .attr('class', 'sidebar_ratio_title_text')
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_ratio_title_text_' + i;
                                                    })
                                                    .attr('text-anchor', 'start')
                                                    .style('font-family', 'Work Sans')
                                                    .style('font-weight', 500)
                                                    .style('font-size', '14px')


    let sidebar_ratio_stat_highlight  = sidebar_ratio_stat_title_g.append('rect')
                                                    .attr('transform', function(d, i) {

                                                        return 'translate(-6,' + (-1 * stat_row_height + 5) + ')'

                                                    })
                                                    .attr('width', 3)
                                                    .attr('height', stat_row_height)
                                                    .attr('fill', color_dict.orange)
                                                    .style('opacity', 0)
                                                    .attr('id', function(d,i) {
                                                        return 'sidebar_ratio_stat_highlight_' + d.conf_id;
                                                    })
                                                    .attr('class', 'sidebar_ratio_stat_highlight')

    //Draw Ratio Game Smoothing slider
    let ratio_game_max_games = 20;
    let ratio_game_slider_top = sidebar_stat_subtitle_padding_top + 4;
    let ratio_game_slider_x = sidebar_ratio_stat_x + 90;
    let ratio_game_slider_width = 100;
    let ratio_game_slider_x_scale = d3.scaleLinear()
                                    .domain([1, ratio_game_max_games])
                                    .range([0, ratio_game_slider_width])
                                    .clamp(true);

    let ratio_game_slider_g = sidebar_stat_g.append('g')
                                    .attr('id', 'sidebar_ratio_game_slider_g')
                                    .attr('transform', 'translate(' + ratio_game_slider_x + ',' + ratio_game_slider_top + ')');

    
    function adjustRatioGameNum(num_games) {

        ratio_game_slider_handle.attr('cx', ratio_game_slider_x_scale(num_games));
        ratio_num_games_text.text(parseInt(num_games));

        ratio_num_games = parseInt(num_games);
        
    }

    let ratio_game_slider_track = ratio_game_slider_g.append('line')
                                        .attr('id', 'ratio_game_slider_track')
                                        .attr('x1', ratio_game_slider_x_scale.range()[0])
                                        .attr('x2', ratio_game_slider_x_scale.range()[1])
                                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                                        .attr("id", "ratio_game_slider_track_inset")
                                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                                        .attr("id", "ratio_game_slider_track_overlay")
                                        .attr('class', 'ratio_game_slider_track_overlays')
                                        .call(d3.drag()
                                                .on("start.interrupt", function() { ratio_game_slider_g.interrupt(); })
                                                .on("start drag", function() { adjustRatioGameNum(ratio_game_slider_x_scale.invert(d3.event.x)); }));

    
    let ratio_game_slider_ticks = ratio_game_slider_g.insert('g', '.ratio_game_slider_track_overlays')
                                    .attr('class', 'ratio_game_slider_ticks')
                                    .attr('transform', 'translate(0,' + 20 + ')')
                                    .selectAll('text')
                                    .data([1,5,10,15,20])
                                    .enter()
                                    .append('text')
                                    .attr('x', ratio_game_slider_x_scale)
                                    .attr('text-anchor', 'middle')
                                    .style('font-weight', 500)
                                    .attr('font-size', '12px')
                                    .text(function(d) {return d;});


    let ratio_game_slider_handle = ratio_game_slider_g.insert('circle', '.ratio_game_slider_track_overlays')
                                    .attr('id', 'ratio_game_slider_handle')
                                    .attr('r', 5)
                                    .attr('cx', ratio_game_slider_x_scale(ratio_num_games));

    let ratio_num_games_text = ratio_game_slider_g.append('text')
                                    .text(ratio_num_games)
                                    .attr('id', 'ratio_num_games_text')
                                    .attr('x', ratio_game_slider_width / 2)
                                    .attr('y', -24)
                                    .attr('text-anchor', 'middle')
                                    .style('dominant-baseline', 'auto')
                                    .style('font-weight', 500)
                                    .attr('font-size', '22px')

    let ratio_num_games_title_text = ratio_game_slider_g.append('text')
                                    .text('Game Moving Average')
                                    .attr('id', 'ratio_num_games_title_text')
                                    .attr('x', ratio_game_slider_width / 2)
                                    .attr('y', -8)
                                    .attr('text-anchor', 'middle')
                                    .attr('font-weight', 500)
                                    .attr('font-size', '10px')
                                    .style('font-family', 'Work Sans');


}

function closeSidebarStatSelector() {

    d3.select('#sidebar_stat_g').remove();

    let sidebar_svg = d3.select('#sidebar_svg');
    let sidebar_contents = d3.select('#sidebar_contents');
    let select_stat_chevron = d3.select('#sidebar_select_stat_chevron')
    let select_stat_close_x = d3.select('#select_stat_close_x')

    sidebar_contents.transition()
                    .duration(300)
                    .style('width', sidebar_width + 'px');

    sidebar_svg.transition()
                .duration(300)
                .attr('width', sidebar_width);

    select_stat_chevron
        .transition()
        .duration(100)
        .style('opacity', 1);

    select_stat_close_x
        .transition()
        .duration(100)
        .style('opacity', 0);

        
    select_stat_chevron.attr('closed', 1);
}

function drawSidebarContents() {
    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let navbar_height = d3.select('#navbar').node().getBoundingClientRect().height;
    let sidebar_width = d3.select('#sidebar_contents').node().getBoundingClientRect().width;
    let sidebar_height = d3.select('#sidebar_contents').node().getBoundingClientRect().height;
    let sidebar_margin_dict = {top: 20, bottom: 0, left: 10, right: 8};

    let sidebar_svg = d3.select('#sidebar_contents')
                            .append('svg')
                            .attr('id', 'sidebar_svg')
                            .attr('width', sidebar_width)
                            .attr('height', height - navbar_height)
                            .style('position', 'fixed');

    
    let select_team_g = sidebar_svg.append('g')
                            .attr('id', 'select_team_g')
                            .attr('transform', 'translate(' + (sidebar_width - sidebar_margin_dict.right) + ',' + sidebar_margin_dict.top + ')')
                            .style('cursor', 'pointer')
                            .on('click', function() {

                                let select_team_chevron = d3.select('#select_team_chevron')

                                if (select_team_chevron.attr('closed') == 1) {

                                    openConferenceSelector(conference_array);

                                    select_team_chevron.attr('closed', 0);

                                } else {

                                    closeSidebarTeamSelector();

                                }

                                
                            });
    
    let select_team_text = select_team_g.append('text')
                            .text('Change Team')
                            .attr('id', 'team_select_text')
                            .attr('class', 'team_select_font')
                            .attr('font-size', '12px')
                            .attr('font-weight', 500)
                            .attr('text-anchor', 'end')
                            .attr('transform', 'translate(' + -15 + ',0)');

    let select_team_chevron = select_team_g.append('text')
                                .text(function() {return '\uf054'})
                                .attr('id', 'select_team_chevron')
                                .attr('class', 'font_awesome_text_icon')
                                .attr('font-size', '12px')
                                .style('font-weight', 500)
                                .attr('fill', color_dict.black)
                                .attr('transform', 'translate(' + -5 + ',0)')
                                .attr('dominant-baseline', 'auto')
                                .attr('text-anchor', 'middle')
                                .attr('closed', 1);
    
    let select_team_text_width = d3.select('#team_select_text').node().getBoundingClientRect().width
    let select_team_close_x_right = (select_team_text_width + sidebar_margin_dict.right + 23) * -1
    
    let select_team_close_x = select_team_g.append('text')
                                .text(function() {return '\uf00d'})
                                .attr('id', 'select_team_close_x')
                                .attr('class', 'font_awesome_text_icon')
                                .attr('font-size', '14px')
                                .style('font-weight', '300')
                                .attr('fill', color_dict.orange)
                                .attr('dominant-baseline', 'auto')
                                .attr('transform', 'translate(' + select_team_close_x_right + ',1)')
                                .style('opacity', 0);
    
    ///Team Info Contents
    let sidebar_team_info_top_margin = 40;
    let sidebar_team_info_left_margin = 20;
    let sidebar_team_logo_width = 100;
    let sidebar_team_info_g = sidebar_svg.append('g')
                                .attr('id', 'team_info_g')
                                .attr('transform', 'translate(0,' + sidebar_team_info_top_margin + ')');

    
    let sidebar_team_logo_image = sidebar_team_info_g.append('svg:image')
                                .attr('id', 'sidebar_team_logo_image')
                                .attr('x', (sidebar_width - sidebar_team_logo_width) / 2)
                                .attr('y', 0)
                                .attr('height', sidebar_team_logo_width)
                                .attr('width', sidebar_team_logo_width);

    let sidebar_team_loc_title = sidebar_team_info_g.append('text')
                                .attr('x', sidebar_team_info_left_margin)
                                .attr('y', sidebar_team_logo_width + 30)
                                .attr('id', 'sidebar_team_loc_title')
                                .attr('class', 'sidebar_title')
                                .attr('font-size', '20px')
                                .attr('font-weight', 700);

    let sidebar_team_loc_title_height = sidebar_team_loc_title.node().getBoundingClientRect().height;
    let sidebar_team_mascot_title_top = sidebar_team_logo_width + 30 + sidebar_team_loc_title_height + 20;

    let sidebar_team_mascot_title = sidebar_team_info_g.append('text')
                                .attr('x', sidebar_team_info_left_margin)
                                .attr('y', sidebar_team_mascot_title_top)
                                .attr('id', 'sidebar_team_mascot_title')
                                .attr('class', 'sidebar_titles')
                                .attr('font-size', '16px')
                                .attr('font-weight', 500);
    
    //Add slider
    let slider_top = navbar_height + sidebar_team_mascot_title_top + sidebar_team_mascot_title.node().getBoundingClientRect().height + 10;
    let sidebar_game_slider_x_scale = d3.scaleLinear()
                                        .domain([0, 64])
                                        .range([sidebar_team_info_left_margin, sidebar_width - sidebar_team_info_left_margin])
                                        .clamp(true);


    let sidebar_game_slider_g = sidebar_svg.append('g')
                                        .attr('id', 'sidebar_game_slider_g')
                                        .attr('transform', 'translate(' + 0 + ',' + slider_top + ')');
    
    function adjustGameNum(num_games) {

        sidebar_game_slider_handle.attr('cx', sidebar_game_slider_x_scale(num_games));
        sidebar_num_games_text.text(parseInt(num_games));

        //Update displayed games after slide
        ///LEFT HERE NEED TO FIX THE SHOWING OF GAMES AFTER ADJUSTING GAME SLIDER/////
        //slider_num_games = num_games;

        d3.selectAll('.game_selector_table_row')
            .style('display', function(d,i) {
                
                if (i < parseInt(num_games)) {

                    d3.select('#game_selector_table_row_' + d.game_id)
                        .style('display', 'true');

                } else {
                    return 'none'
                }
            })

        slider_num_games = parseInt(num_games);
    }


    let sidebar_game_slider_track = sidebar_game_slider_g.append('line')
                                        .attr('id', 'sidebar_game_slider_track')
                                        .attr('x1', sidebar_game_slider_x_scale.range()[0])
                                        .attr('x2', sidebar_game_slider_x_scale.range()[1])
                                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                                        .attr("id", "sidebar_game_slider_track_inset")
                                    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                                        .attr("id", "sidebar_game_slider_track_overlay")
                                        .attr('class', 'sidebar_game_slider_track_overlays')
                                        .call(d3.drag()
                                                .on("start.interrupt", function() { sidebar_game_slider_g.interrupt(); })
                                                .on("start drag", function() { adjustGameNum(sidebar_game_slider_x_scale.invert(d3.event.x)); }));

    let sidebar_game_slider_ticks = sidebar_game_slider_g.insert('g', '.sidebar_game_slider_track_overlays')
                                        .attr('class', 'sidebar_game_slider_ticks')
                                        .attr('transform', 'translate(0,' + 20 + ')')
                                        .selectAll('text')
                                        .data(sidebar_game_slider_x_scale.ticks(6))
                                        .enter()
                                        .append('text')
                                        .attr('x', sidebar_game_slider_x_scale)
                                        .attr('text-anchor', 'middle')
                                        .text(function(d) {return d;});

                                    
    var sidebar_game_slider_handle = sidebar_game_slider_g.insert('circle', '.sidebar_game_slider_track_overlays')
                                        .attr('id', 'sidebar_game_slider_handle')
                                        .attr('r', 7)
                                        .attr('cx', sidebar_game_slider_x_scale(slider_num_games));

    
    let sidebar_game_slider_height = sidebar_game_slider_g.node().getBoundingClientRect().height;

    let sidebar_num_games_top = slider_top + sidebar_game_slider_height + 20;

    let sidebar_num_games_g = sidebar_svg.append('g')
                                        .attr('id', 'sidebar_num_games_g')
                                        .attr('transform', 'translate(0,' + sidebar_num_games_top + ')');

    let sidebar_num_games_text = sidebar_num_games_g.append('text')
                                        .attr('id', 'sidebar_num_games_text')
                                        .attr('x', sidebar_width / 2)
                                        .attr('y', -3)
                                        .attr('text-anchor', 'middle')
                                        .attr('font-size', '20px')
                                        .style('dominant-baseline', 'auto')
                                        .text(slider_num_games);

    let sidebar_num_games_games_text = sidebar_num_games_g.append('text')
                                        .attr('id', 'sidebar_num_games_games_text')
                                        .attr('x', sidebar_width / 2)
                                        .attr('y', 3)
                                        .attr('text-anchor', 'middle')
                                        .attr('font-size', '14px')
                                        .style('dominant-baseline', 'hanging')
                                        .text('Recent Games')

    // Add bottom buttons first before game selector div
    let sidebar_bottom_margin = 30;
    let sidebar_button_height = 30;
    let sidebar_button_width = 150;
    let sidebar_button_left_margin = (sidebar_width - sidebar_button_width) / 2;
    let sidebar_clear_button_top = (height - navbar_height) - sidebar_bottom_margin - sidebar_button_height;
    
    let sidebar_clear_chart_button_g = sidebar_svg.append('g')
                                        .attr('id', 'sidebar_clear_chart_button_g')
                                        .attr('transform', 'translate(' + sidebar_button_left_margin + ',' + sidebar_clear_button_top + ')')
                                        .style('cursor', 'pointer')
                                        .on('click', function(){

                                            clearTimeSeriesChart();

                                        })

    

    let sidebar_clear_chart_text = sidebar_clear_chart_button_g.append('text')
                                            .text('Clear Chart')
                                            .attr('id', 'sidebar_clear_chart_text')
                                            .attr('x', sidebar_button_width / 2)
                                            .attr('y', sidebar_button_height / 2)
                                            .attr('text-anchor', 'middle')
                                            .style('dominant-baseline', 'middle')
                                            .style('font-size', '14px')
                                            .style('font-weight', 500)
                                            .style('font-family', 'Work Sans')
                                            .style('text-decoration', 'none')
                                            .on('mouseover', function() {

                                                d3.select(this).style('text-decoration', 'underline')
                                            })
                                            .on('mouseout', function() {

                                                d3.select(this).style('text-decoration', 'none');
                                            });
              
    let sidebar_submit_bottom_margin = 20;
    let sidebar_submit_button_top = height - navbar_height - sidebar_bottom_margin - (sidebar_button_height * 3) + sidebar_submit_bottom_margin;
                                            
    
    let sidebar_submit_button_g = sidebar_svg.append('g')
                                            .attr('id', 'sidebar_submit_button_g')
                                            .attr('transform', 'translate(' + sidebar_button_left_margin + ',' + sidebar_submit_button_top + ')')
                                            .style('cursor', 'pointer')
                                            .on('mouseover', function() {
                                                
                                                d3.select('#sidebar_submit_button_bg')
                                                    .attr('stroke', color_dict.orange);
                                            })
                                            .on('mouseout', function() {
                                                
                                                d3.select('#sidebar_submit_button_bg')
                                                    .attr('stroke', color_dict.transparent);
                                            })
                                            .on('click', function() {
                                                
                                                let [game_select_array, prev_ratio_game_ids] = createGameSelectArray();
                                                

                                                submitTimeSeriesRequest(game_select_array, prev_ratio_game_ids, stat_select_dict);

                                            });


    let sidebar_submit_button_bg = sidebar_submit_button_g.append('rect')
                                            .attr('id', 'sidebar_submit_button_bg')
                                            .attr('width', sidebar_button_width)
                                            .attr('height', sidebar_button_height)
                                            .attr('fill', color_dict.orange)
                                            .attr('stroke', color_dict.transparent)
                                            .attr('stroke-width', '3px');
    
    let sidebar_submit_button_text = sidebar_submit_button_g.append('text')
                                            .text('Add Time Series')
                                            .attr('id', 'sidebar_submit_button_text')
                                            .attr('x', sidebar_button_width / 2)
                                            .attr('y', sidebar_button_height / 2)
                                            .attr('fill', color_dict.white)
                                            .attr('font-size', '16px')
                                            .style('font-weight', 500)
                                            .style('text-anchor', 'middle')
                                            .style('dominant-baseline', 'middle')
                                            .style('font-family', 'Work Sans');
    
    let sidebar_stat_type_top_margin = 0;
    let stat_type_g_height = sidebar_button_height * 2.25;
    let sidebar_stat_type_top = sidebar_submit_button_top - sidebar_stat_type_top_margin - stat_type_g_height;

    let sidebar_stat_type_g = sidebar_svg.append('g')
                                            .attr('id', 'sidebar_stat_type_g')
                                            .attr('transform', 'translate(' + 0 + ',' + sidebar_stat_type_top + ')');
                                            
       
    let sidebar_stat_type_text = sidebar_stat_type_g.append('text')
                                            .text('Select Stat')
                                            .attr('x', sidebar_width / 2)
                                            .attr('y', stat_type_g_height / 2)
                                            .attr('id', 'sidebar_stat_type_text')
                                            .style('text-anchor', 'middle')
                                            .style('dominant-baseline', 'hanging')
                                            .attr('font-size', '14px')
                                            .style('font-weight', 500)
                                            .style('font-family', 'Work Sans')

    let sidebar_stat_select_width = 120;
    let sidebar_stat_select_height = 20;

    let sidebar_stat_select_g = sidebar_stat_type_g.append('g')
                                            .attr('id', 'sidebar_stat_select_g')
                                            .style('cursor', 'pointer')
                                            .on('click', function() {

                                                let sidebar_select_stat_chevron = d3.select('#sidebar_select_stat_chevron')
                
                                                if (sidebar_select_stat_chevron.attr('closed') == 1) {
                
                                                    //openConferenceSelector(conference_array);
                                                    openStatSelector(stat_array)
                
                                                    sidebar_select_stat_chevron.attr('closed', 0);
                
                                                } else {
                
                                                    closeSidebarStatSelector();
                
                                                }
                
                                                
                                            });
                                            
    let sidebar_stat_select_bg = sidebar_stat_select_g.append('rect')
                                            .attr('id', 'sidebar_stat_select_bg')
                                            .attr('x', sidebar_width - sidebar_stat_select_width)
                                            .attr('y', 0)
                                            .attr('width', sidebar_stat_select_width)
                                            .attr('height', sidebar_stat_select_height)
                                            .attr('fill', color_dict.transparent);
   
    let sidebar_stat_select_text = sidebar_stat_select_g.append('text')
                                            .text('Change Stat')
                                            .attr('id', 'sidebar_select_stat_text')
                                            .attr('font-size', '12px')
                                            .style('font-weight', 500)
                                            .style('font-family', 'Work Sans')
                                            .attr('fill', color_dict.black)
                                            .attr('x', sidebar_width - 20)
                                            .attr('y', sidebar_stat_select_height / 2)
                                            .attr('dominant-baseline', 'middle')
                                            .attr('text-anchor', 'end');

    let sidebar_stat_chevron = sidebar_stat_select_g.append('text')
                                            .text(function() {return '\uf054'})
                                            .attr('id', 'sidebar_select_stat_chevron')
                                            .attr('class', 'font_awesome_text_icon')
                                            .attr('font-size', '12px')
                                            .style('font-weight', 300)
                                            .attr('fill', color_dict.black)
                                            .attr('x', sidebar_width - 15)
                                            .attr('y', sidebar_stat_select_height / 2)
                                            .attr('dominant-baseline', 'middle')
                                            .attr('text-anchor', 'start')
                                            .attr('closed', 1);

    let select_stat_text_width = sidebar_stat_select_text.node().getBoundingClientRect().width
    let select_stat_close_x_right = sidebar_width - 15 - select_stat_text_width - 8;
    
    let select_stat_close_x = sidebar_stat_select_g.append('text')
                                .text(function() {return '\uf00d'})
                                .attr('id', 'select_stat_close_x')
                                .attr('class', 'font_awesome_text_icon')
                                .attr('font-size', '14px')
                                .style('font-weight', '300')
                                .attr('fill', color_dict.orange)
                                .attr('text-anchor', 'end')
                                .attr('dominant-baseline', 'middle')
                                .attr('x', select_stat_close_x_right)
                                .attr('y', sidebar_stat_select_height / 2)
                                .style('opacity', 0);
                                            
    ///Add game selector div

    let sidebar_game_selector_top = sidebar_num_games_games_text.node().getBoundingClientRect().y + 50;
    let sidebar_game_selector_width = sidebar_width - (sidebar_team_info_left_margin * 2);

    let sidebar_game_selector_div = d3.select('#sidebar_contents')
                                        .append('div')
                                        .attr('id', 'sidebar_game_selector_div')
                                        .style('position', 'sticky')
                                        .style('z-index', 3)
                                        .style('top', sidebar_game_selector_top + 'px')
                                        .style('left', sidebar_team_info_left_margin + 'px')
                                        .style('width', sidebar_game_selector_width + 'px')
                                        .style('height', 300 + 'px')
                                        .style('overflow-y', 'auto')
                                        .style('border', '1px ' + color_dict.med_gray + ' solid');

                            

}

function updateTeamInfoContents(team_dict) {

    let sidebar_team_logo_image = d3.select('#sidebar_team_logo_image');
    
    sidebar_team_logo_image.attr('xlink:href', team_dict.team_image);

    d3.select('#sidebar_team_loc_title').text(team_dict.team_loc);

    d3.select('#sidebar_team_mascot_title').text(team_dict.team_mascot);
}

function populateGameSelector(team_sched_data) {

    ///Remove existing data
    d3.select('#sidebar_game_selector_table').remove();

    let game_selector_div = d3.select('#sidebar_game_selector_div');                  

    let game_selector_table = game_selector_div.append('table')
                                .style('border-collapse', 'collapse')
                                .style('width', '100%')
                                .style('margin', 'auto')
                                .style('overflow', 'auto')
                                .style('text-align', 'center')
                                .attr('id', 'sidebar_game_selector_table')
                                .style('border-bottom', '1px ' + color_dict.gray_bg + ' solid');

    let game_selector_col_headers = ['Date', 'Away', '@', 'Home', 'Select'];

    let game_selector_table_head = game_selector_table.append('thead')
                                            .append('tr')
                                            .selectAll('th')
                                            .data(game_selector_col_headers)
                                            .enter()
                                            .append('th')
                                            .text(function(d) {return d;})
                                            .attr('class', 'game_selector_table_th');

    let game_selector_row_game_id = 0;

    let game_selector_table_body = game_selector_table.append('tbody')
                                            .selectAll('tr')
                                            .data(team_sched_data)
                                            .enter()
                                            .append('tr')
                                            .attr('height', '14px')
                                            .attr('id', function(d,i) {
                                                game_selector_row_game_id = d.game_id;
                                                return 'game_selector_table_row_' + d.game_id
                                            })
                                            .attr('class', 'game_selector_table_row')
                                            .style('display', function(d,i) {
                                                
                                                if (i < slider_num_games) {
                                                    return 'true'
                                                } else {
                                                    return 'none'
                                                }
                                            })
                                            .selectAll('td')
                                            .data(game_selector_col_headers)
                                            .enter()
                                            .append('td')
                                            .attr('class', function(d,i) {
                                                return 'game_selector_table_col_' + i
                                            })
                                            .style('font-size', function(d,i) {

                                                if (i == 0) {
                                                    return '8px'
                                                } else {
                                                    return '10px'
                                                }

                                            })
                                            .style('font-family', 'Work Sans')
                                            .style('font-weight', 500)

    
    ///ITERATE THROUGH TEAM SCHED DATA SELECT CELLS AND POPULATE INFO

    for (var i = 0; i < team_sched_data.length; i++) {

        let temp_data = team_sched_data[i];
        let table_row_id = '#game_selector_table_row_' + temp_data.game_id;
        let table_row = d3.select(table_row_id);
    
        //change date 
        table_row.select('.game_selector_table_col_0')
                    .text(temp_data.start_date);

        
        //change away team
        table_row.select('.game_selector_table_col_1')
                    .text(temp_data.away_team_abbrev)
                    .style('font-weight', function() {

                        if (temp_data.away_team_id === curr_team_id) {

                            return 700
                        } else {
                            
                            return 500
                        }

                    })

        
        //add at symbol
        table_row.select('.game_selector_table_col_2')
                    .text('@')
                    .style('font-weight', 500);

        
        //change home team
        table_row.select('.game_selector_table_col_3')
                    .text(temp_data.home_team_abbrev)
                    .style('font-weight', function() {

                        if (temp_data.home_team_id === curr_team_id) {

                            return 700
                        } else {

                            return 500
                        }

                    })

        //append_select
        table_row.select('.game_selector_table_col_4')
                    .append('input')
                    .attr('type', 'checkbox')
                    .attr('checked', 'true')
                    .style('width', '12px')
                    .style('height', '12px')
                    .style('cursor', 'pointer')
                    .attr('id', 'game_selector_table_checkbox_' + temp_data.game_id)
                    .attr('class', 'game_selector_select_box')
                    .on('click', function() {

                        let checkbox_element = d3.select(this);

                        if (checkbox_element.attr('checked') === 'true') {

                            checkbox_element.attr('checked', 'false')
                        } else {

                            checkbox_element.attr('checked', 'true')

                        }

                    });
        



    }

}

function createGameSelectArray() {

    let game_select_array = [];
    let all_game_id_array = [];

    d3.selectAll('.game_selector_table_row')
        .each(function(d,i) {

            all_game_id_array.push(d.game_id);

            let display_attr = d3.select('#game_selector_table_row_' + d.game_id).style('display');

            if (display_attr != 'none') {

                let game_selected = d3.select('#game_selector_table_checkbox_' + d.game_id).attr('checked');
                
                if (game_selected === 'true') {

                    game_select_array.push(d.game_id);

                }

            }

        })

    let first_game = game_select_array[game_select_array.length - 1];
    let first_game_index = all_game_id_array.findIndex(i => i === first_game);

    let prev_ratio_game_ids = all_game_id_array.slice(first_game_index + 1, first_game_index + 1 + ratio_num_games)

    return [game_select_array, prev_ratio_game_ids]

}

function drawChartContents() {

    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let navbar_height = d3.select('#navbar').node().getBoundingClientRect().height;
    let sidebar_width = d3.select('#sidebar_contents').node().getBoundingClientRect().width;
    let chart_margin_dict = {left: sidebar_width + 30, top: navbar_height + 20, right: 30, bottom: 140};

    let chart_width = width - chart_margin_dict.left - chart_margin_dict.right;
    let chart_height = height - chart_margin_dict.top - chart_margin_dict.bottom;

    let chart_svg = d3.select('#viz')
                        .append('svg')
                        .attr('width', chart_width)
                        .attr('height', chart_height)
                        .attr('id', 'chart_svg')
                        .attr('transform', 'translate(' + chart_margin_dict.left + ',' + chart_margin_dict.top + ')');


    let chart_bg = chart_svg.append('rect')
                        .attr('width', chart_width)
                        .attr('height', chart_height)
                        .attr('fill', 'none');

    let chart_tabs_array = ['Time Series', 'Distributions', 'Average'];
    let chart_tab_width = 120;
    let chart_tab_height = 30;
    let chart_tab_selected = 0;

    
    let chart_tabs_g = chart_svg.append('g')
                        .attr('id', 'chart_tabs_g')
                        .attr('transform', 'translate(' + ((chart_width / 2) - (chart_tabs_array.length * chart_tab_width / 2) + ',0)'));


    let chart_tabs_sub_g = chart_tabs_g.selectAll('.chart_tabs_sub_g')
                                    .data(chart_tabs_array)
                                    .enter()
                                    .append('g')
                                    .attr('class', 'chart_tabs_sub_g')
                                    .attr('transform', function(d, i) {

                                        return 'translate(' + (i * chart_tab_width) + ',0)'

                                    })
                                    .style('cursor', 'pointer')

    let chart_tab_bg = chart_tabs_sub_g.append('rect')
                                    .attr('width', chart_tab_width)
                                    .attr('height', chart_tab_height)
                                    .attr('stroke', color_dict.med_gray)
                                    .attr('fill', function(d,i) {

                                        if (i == chart_tab_selected) {
                                            return color_dict.gray_bg
                                        } else {
                                            return color_dict.transparent
                                        }
                                    })
                                    .attr('stroke-width', '1px')
                                    .style('shape-rendering', 'crispEdges');

    let chart_tab_text = chart_tabs_sub_g.append('text')
                                    .text(function(d) {return d})
                                    .attr('x', chart_tab_width / 2)
                                    .attr('y', chart_tab_height / 2)
                                    .attr('text-anchor', 'middle')
                                    .style('dominant-baseline', 'middle')
                                    .style('font-size', '14px')
                                    .style('font-weight', function(d,i) {
                                        
                                        if (i == chart_tab_selected) {
                                            return 700
                                        } else {
                                            return 500
                                        }
                                    });

        
    let chart_contents_padding = chart_tab_height + 15;
    let chart_contents_height = chart_height - chart_contents_padding;

    let chart_contents_g = chart_svg.append('g')
                                        .attr('id', 'chart_contents_g')
                                        .attr('transform', 'translate(0,' + chart_contents_padding + ')');

    let chart_legend_width = 180;
    let chart_legend_x = chart_width - chart_legend_width;
    let chart_legend_g = chart_contents_g.append('g')
                                    .attr('id', 'chart_legend_g')
                                    .attr('transform', 'translate(' + (chart_legend_x - 1) + ',0)');

    let chart_legend_title_height = 22;
    let chart_legend_title_g = chart_legend_g.append('g')
                                    .attr('id', 'chart_legend_title_g');

    let chart_legend_title_bg = chart_legend_title_g.append('rect')
                                    .attr('id', 'chart_legend_title_bg')
                                    .attr('width', chart_legend_width)
                                    .attr('height', chart_legend_title_height)
                                    .attr('fill', color_dict.gray_bg)
                                    .attr('stroke', color_dict.med_gray)
                                    .attr('stroke-width', '1px')
                                    .style('shape-rendering', 'crispEdges');
    
    let chart_legend_title_text = chart_legend_title_g.append('text')
                                    .text('Legend')
                                    .attr('x', chart_legend_width / 2)
                                    .attr('y', chart_legend_title_height / 2)
                                    .attr('text-anchor', 'middle')
                                    .style('dominant-baseline', 'middle')
                                    .attr('font-size', '14px')
                                    .attr('font-weight', 500);

    let chart_legend_body_bg = chart_legend_title_g.append('rect')
                                    .attr('width', chart_legend_width)
                                    .attr('height', chart_contents_height - chart_legend_title_height - 2)
                                    .attr('id', 'chart_legend_body_bg')
                                    .attr('x', 0)
                                    .attr('y', chart_legend_title_height + 1)
                                    .attr('fill', color_dict.transparent)
                                    .attr('stroke', color_dict.med_gray)
                                    .attr('stroke-width', '1px')
                                    .style('shape-rendering', 'crispEdges');


    let chart_time_series_g = chart_contents_g.append('g')
                                    .attr('id', 'chart_time_series_g');
    
    let chart_time_series_padding = 20;
    let chart_time_series_width = chart_width - chart_legend_width - chart_time_series_padding;
    let time_series_height_ratio = .8
    let chart_time_series_top_height = chart_contents_height * time_series_height_ratio;
    let chart_time_series_bottom_height = chart_contents_height * (1 - time_series_height_ratio);

    let chart_time_series_top_g = chart_contents_g.append('g')
                                        .attr('id', 'chart_time_series_top_g')

    let chart_time_series_top_bg = chart_time_series_top_g.append('rect')
                                        .attr('id', 'chart_time_series_top_bg')
                                        .attr('width', chart_time_series_width - chart_time_series_padding)
                                        .attr('height', chart_time_series_top_height)
                                        .attr('x', chart_time_series_padding)
                                        .attr('fill', 'none');

    let chart_time_series_bottom_g = chart_contents_g.append('g')
                                        .attr('id', 'chart_time_series_bottom_g')
                                        .attr('transform', 'translate(' + chart_time_series_padding + ',' + chart_time_series_top_height + ')');
                                        
    let chart_time_series_bottom_bg = chart_time_series_bottom_g.append('rect')
                                        .attr('id', 'chart_time_series_bottom_bg')
                                        .attr('width', chart_time_series_width - chart_time_series_padding)
                                        .attr('height', chart_time_series_bottom_height)
                                        .attr('fill', 'none');

    let chart_contents_x_axis = chart_contents_g.append('line')
                                        .attr('id', 'chart_contents_x_axis')
                                        .attr('x1', 0)
                                        .attr('x2', chart_time_series_width)
                                        .attr('y1', chart_time_series_top_height / 2)
                                        .attr('y2', chart_time_series_top_height / 2)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '1px')
                                        .style('shape-rendering', 'crispEdges');

    let chart_contents_y_axis = chart_contents_g.append('line')
                                        .attr('id', 'chart_contents_y_axis')
                                        .attr('x1', chart_time_series_padding)
                                        .attr('x2', chart_time_series_padding)
                                        .attr('y1', 0)
                                        .attr('y2', chart_time_series_top_height)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '1px')
                                        .style('shape-rendering', 'crispEdges');
                            

}

function drawGameInfoDetails(game_id, game_info_dict) {

    let chart_time_series_bottom_g = d3.select('#chart_time_series_bottom_g');
    let chart_time_series_bottom_width = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().width;
    let chart_time_series_bottom_height = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().height;

    let game_info_details_padding_top = 20;
    let game_info_details_interior_padding = 30;
    let game_info_details_side_padding = 50;

    let game_info_details_g = chart_time_series_bottom_g.append('g')
                                                .attr('id', 'game_info_details_g')
                                                .attr('transform', 'translate(0,' + game_info_details_padding_top + ')');

    let game_info_details_bg = game_info_details_g.append('rect')
                                                .attr('x', 0)
                                                .attr('y', 0)
                                                .attr('width', chart_time_series_bottom_width)
                                                .attr('height', chart_time_series_bottom_height - game_info_details_padding_top)
                                                .attr('stroke', color_dict.med_gray)
                                                .attr('fill', color_dict.transparent);

    let game_info_details_at_symbol = game_info_details_g.append('text')
                                                .text('@')
                                                .attr('x', chart_time_series_bottom_width / 2)
                                                .attr('y', (chart_time_series_bottom_height - game_info_details_interior_padding) / 2)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', '22px')
                                                .attr('font-weight', 300)

    let game_info_details_date_str = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['date_str'])
                                                .attr('x', chart_time_series_bottom_width / 2)
                                                .attr('y', 10)
                                                .attr('text-anchor', 'middle')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('font-size', '14px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_info_details_away_team_loc = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['away_team_loc'])
                                                .attr('x', game_info_details_side_padding)
                                                .attr('y', game_info_details_interior_padding)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('font-size', '20px')
                                                .attr('font-weight', 500);

    let game_info_details_away_team_mascot = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['away_team_mascot'])
                                                .attr('x', game_info_details_side_padding)
                                                .attr('y', game_info_details_interior_padding + 20)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('font-size', '16px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_info_details_home_team_loc = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['home_team_loc'])
                                                .attr('x', chart_time_series_bottom_width - game_info_details_side_padding)
                                                .attr('y', game_info_details_interior_padding)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('font-size', '20px')
                                                .attr('font-weight', 500);

    let game_info_details_home_team_mascot = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['home_team_mascot'])
                                                .attr('x', chart_time_series_bottom_width - game_info_details_side_padding)
                                                .attr('y', game_info_details_interior_padding + 20)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'hanging')
                                                .attr('font-size', '16px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_info_details_score_padding = 45;

    let game_info_details_away_score = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['away_team_score'])
                                                .attr('x', chart_time_series_bottom_width / 2 - game_info_details_score_padding)
                                                .attr('y', (chart_time_series_bottom_height - game_info_details_interior_padding) / 2)
                                                .attr('text-anchor', 'end')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', '38px')
                                                .attr('font-weight', 500);

    let game_info_details_home_score = game_info_details_g.append('text')
                                                .text(game_info_dict[game_id]['home_team_score'])
                                                .attr('x', chart_time_series_bottom_width / 2 + game_info_details_score_padding)
                                                .attr('y', (chart_time_series_bottom_height - game_info_details_interior_padding) / 2)
                                                .attr('text-anchor', 'start')
                                                .attr('dominant-baseline', 'middle')
                                                .attr('font-size', '38px')
                                                .attr('font-weight', 500);

    let game_info_details_game_total = game_info_details_g.append('text')
                                                .text('O/U ' + game_info_dict[game_id]['game_total'])
                                                .attr('x', chart_time_series_bottom_width / 2)
                                                .attr('y', chart_time_series_bottom_height - game_info_details_padding_top - 5)
                                                .attr('text-anchor', 'middle')
                                                .attr('font-size', '14px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');


    let game_info_details_away_spread =  game_info_details_g.append('text')
                                                .text(function() {

                                                    let spread_value = game_info_dict[game_id]['home_team_spread'] * -1;

                                                    if (spread_value > 0) {

                                                        return '+' + spread_value;

                                                    } else {

                                                        return spread_value;

                                                    }

                                                })
                                                .attr('x', chart_time_series_bottom_width / 2 - game_info_details_score_padding)
                                                .attr('y', chart_time_series_bottom_height - game_info_details_padding_top - 5)
                                                .attr('text-anchor', 'end')
                                                .attr('font-size', '14px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_info_details_home_spread =  game_info_details_g.append('text')
                                                .text(function() {

                                                    let spread_value = game_info_dict[game_id]['home_team_spread'];

                                                    if (spread_value > 0) {

                                                        return '+' + spread_value;

                                                    } else {

                                                        return spread_value;

                                                    }

                                                })
                                                .attr('x', chart_time_series_bottom_width / 2 + game_info_details_score_padding)
                                                .attr('y', chart_time_series_bottom_height - game_info_details_padding_top - 5)
                                                .attr('text-anchor', 'start')
                                                .attr('font-size', '14px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');

    let game_info_details_closing_line_text = game_info_details_g.append('text')
                                                .text('Closing Lines')
                                                .attr('x', chart_time_series_bottom_width / 2 - (game_info_details_score_padding * 2))
                                                .attr('y', chart_time_series_bottom_height - game_info_details_padding_top - 5)
                                                .attr('text-anchor', 'end')
                                                .attr('font-size', '10px')
                                                .attr('font-weight', 500)
                                                .style('font-family', 'Work Sans');


}

function drawSeasonGameBackgrounds(time_series_dict) {

    let chart_time_series_top_g = d3.select('#chart_time_series_top_g');
    let chart_time_series_top_width = d3.select('#chart_time_series_top_g').node().getBoundingClientRect().width;
    let chart_time_series_top_height = d3.select('#chart_time_series_top_g').node().getBoundingClientRect().height;

    let chart_time_series_bottom_g = d3.select('#chart_time_series_bottom_g');
    let chart_time_series_bottom_width = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().width;
    let chart_time_series_bottom_height = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().height;

    let chart_time_series_padding = 20;

    let max_time_series_mins = 0;
    

    time_series_data.forEach(function(time_series_dict) {

        let num_game_mins = time_series_dict.data.length;

        if (num_game_mins > max_time_series_mins) {

            max_time_series_mins = num_game_mins;

        }


    });

    let season_array = [];
    let season_dict = {};

    //Push seasons to season array
    for (var i = 0; i < time_series_dict.game_order.length; i++) {

        let game_id = time_series_dict.game_order[i];
        let game_info_dict = time_series_dict.game_info[game_id];
        let game_season = game_info_dict['game_season'];
        let min_game_min = game_info_dict['min_game_min'];
        let max_game_min = game_info_dict['max_game_min'];

        if (!season_array.includes(game_season)) {

            season_array.push(game_season);

            season_dict[game_season] = {min_game_min: min_game_min, max_game_min: max_game_min};
        

        } else {

            if (min_game_min < season_dict[game_season]['min_game_min']) {

                season_dict[game_season]['min_game_min'] = min_game_min;

            }

            if (max_game_min > season_dict[game_season]['max_game_min']) {

                season_dict[game_season]['max_game_min'] = max_game_min;

            }

        }

    }

    season_array = season_array.sort(function(a, b) {return a - b});
    let final_season_dict = {}

    for (var i = 0; i < season_array.length; i++ ){

        let game_season = season_array[i];

        final_season_dict[game_season] = season_dict[game_season];

    }

    //draw season elements
    let season_title_height = 20;
    let season_x_scale = d3.scaleLinear()
                                    .domain([1, max_time_series_mins])
                                    .range([0, chart_time_series_top_width]);

    let time_series_mins_missing = max_time_series_mins - time_series_dict.data.length;
    let season_title_left = season_x_scale(time_series_mins_missing) + chart_time_series_padding;

    let season_title_g = chart_time_series_top_g.append('g')
                                        .attr('id', 'season_title_g')
                                        .attr('transform', 'translate(' + season_title_left + ',0)');
        
    let season_title_sub_g = season_title_g.selectAll('.season_title_sub_g')
                                        .data(season_array)
                                        .enter()
                                        .append('g')
                                        .attr('transform', function(d) {

                                            let season_min_game_min = final_season_dict[d]['min_game_min'];

                                            console.log(d, season_x_scale(season_min_game_min));

                                            return 'translate(' + season_x_scale(season_min_game_min) + ',0)'

                                        })
                                        .style('cursor', 'pointer')
                                        .on('mouseover', function(d) {

                                            let season_highlight_id = '#season_highlight_bg_' + d;

                                            d3.select(season_highlight_id)
                                                .transition()
                                                .duration(100)
                                                .attr('stroke', color_dict.med_gray)
                                                .attr('stroke-width', '3px');

                                        })
                                        .on('mouseout', function(d) {

                                            let season_highlight_id = '#season_highlight_bg_' + d;

                                            d3.select(season_highlight_id)
                                                .transition()
                                                .duration(100)
                                                .attr('stroke', color_dict.med_gray)
                                                .attr('stroke-width', '1px');

                                        });

    let season_title_bg = season_title_sub_g.append('rect')
                                        .attr('width', function(d) {
                                            let season_num_mins = final_season_dict[d]['max_game_min'] - final_season_dict[d]['min_game_min'];

                                            let season_bg_width = season_x_scale(season_num_mins)
                                            console.log('width', d, season_bg_width);
                                            return season_bg_width

                                        })
                                        .attr('x', 0)
                                        .attr('y', 0)
                                        .attr('height', season_title_height)
                                        .attr('fill', color_dict.transparent)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '1px')
                                        .style('shape-rendering', 'CrispEdges');

    let season_title_title = season_title_sub_g.append('text')
                                        .text(function(d) {return d})
                                        .attr('x', function(d) {

                                            let season_num_mins = final_season_dict[d]['max_game_min'] - final_season_dict[d]['min_game_min'];

                                            let season_title_x = season_x_scale(season_num_mins / 2)

                                            return season_title_x

                                        })
                                        .attr('y', season_title_height / 2)
                                        .attr('text-anchor', 'middle')
                                        .attr('dominant-baseline', 'middle')
                                        .attr('font-size', '12px')
                                        .attr('font-weight', 500)
                                        .style('font-family', 'Work Sans');

    let season_highlight_g = season_title_g.selectAll('.season_highlights')
                                        .data(season_array)
                                        .enter()
                                        .append('g')
                                        .attr('class', 'season_highlights')
                                        .attr('id', function(d) {
                                            return 'season_highlight_' + d
                                        })
                                        .attr('transform', function(d) {

                                            let season_min_game_min = final_season_dict[d]['min_game_min'];

                                            console.log(d, season_x_scale(season_min_game_min));

                                            return 'translate(' + season_x_scale(season_min_game_min) + ',' + season_title_height + ')'

                                        })
    
    let season_highlight_bg = season_highlight_g.append('rect')
                                        .attr('x', 0)
                                        .attr('y', 0)
                                        .attr('width', function(d) {
                                            let season_num_mins = final_season_dict[d]['max_game_min'] - final_season_dict[d]['min_game_min'];

                                            let season_bg_width = season_x_scale(season_num_mins)
                            
                                            return season_bg_width

                                        })
                                        .attr('height', chart_time_series_top_height - season_title_height)
                                        .attr('class', 'season_highlight_bg')
                                        .attr('id', function(d) {return 'season_highlight_bg_' + d})
                                        .attr('fill', color_dict.transparent)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '1px')
                                        .style('shape-rendering', 'CrispEdges');

    //Draw Game Info
    let game_info_dict = time_series_dict.game_info;


    let game_info_height = 20;

    let game_info_main_g = chart_time_series_bottom_g.append('g')
                                                .attr('id', 'game_info_g')
                                                .attr('class', 'game_info_g');

    let game_info_x_scale = d3.scaleLinear()
                                .domain([0, max_time_series_mins])
                                .range([0, chart_time_series_top_width]);
    
    let game_info_game_g = game_info_main_g.selectAll('.game_info_game_g')
                                .data(time_series_dict.game_order)
                                .enter()
                                .append('g')
                                .attr('id', function(d) {return 'game_info_game_g_' + d})
                                .attr('transform', function(d) {

                                    let x_translate = game_info_x_scale(game_info_dict[d]['min_game_min'] + time_series_mins_missing);

                                    return 'translate(' + x_translate + ',0)'

                                })
                                .style('cursor', 'pointer')
                                .on('mouseover', function(d) {

                                    drawGameInfoDetails(d, game_info_dict)

                                    //emphasize game highlight
                                    let game_highlight_id = '#game_info_game_highlight_' + d
                                    
                                    
                                    d3.select(game_highlight_id)
                                        .transition()
                                        .duration(100)
                                        .attr('stroke', color_dict.black)
                                        .attr('stroke-width', '2px')

                                })
                                .on('mouseout', function(d) {

                                    d3.select('#game_info_details_g').remove();

                                     //emphasize game highlight
                                     let game_highlight_id = '#game_info_game_highlight_' + d
                                    
                                    
                                     d3.select(game_highlight_id)
                                         .transition()
                                         .duration(100)
                                         .attr('stroke', color_dict.med_gray)
                                         .attr('stroke-width', '1px')

                                })

    let game_info_game_bg = game_info_game_g.append('rect')
                                .attr('x', 0)
                                .attr('y', 0)
                                .attr('height', game_info_height)
                                .attr('width', function(d) {

                                    let game_info_bg_width = game_info_x_scale(game_info_dict[d]['max_game_min'] - game_info_dict[d]['min_game_min'])

                                    return game_info_bg_width;

                                })
                                .attr('class', 'game_info_game_bg')
                                .attr('fill', color_dict.transparent)
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', '1px')
                                .style('shape-rendering', 'CrispEdges');     
                                
    let game_info_date_title = game_info_game_g.append('text')
                                .text(function(d) {

                                    return game_info_dict[d]['game_week'];

                                })
                                .attr('id', function(d, i) {
                                    return 'game_info_date_title_' + i;
                                })
                                .attr('class', 'game_info_date_titles')
                                .attr('x', function(d) {

                                    let game_info_bg_width = game_info_x_scale(game_info_dict[d]['max_game_min'] - game_info_dict[d]['min_game_min'])

                                    return game_info_bg_width / 2;

                                })
                                .attr('y', game_info_height / 2)
                                .attr('text-anchor', 'middle')
                                .attr('dominant-baseline', 'middle')
                                .attr('font-size', '10px')
                                .attr('font-weight', 500)
                                .style('font-family', 'Work Sans')

    let game_info_game_highlight_g = chart_time_series_top_g.append('g')
                                    .attr('id', 'game_info_game_highlight_g')
                                    .attr('transform', 'translate(' + chart_time_series_padding + ',0)');

    let game_info_game_highlight = game_info_game_highlight_g.selectAll('.game_info_game_highlights')
                                .data(time_series_dict.game_order)
                                .enter()
                                .append('rect')
                                .attr('id', function(d) {

                                    return 'game_info_game_highlight_' + d;

                                })
                                .attr('class', 'game_info_game_highlights')
                                .attr('x', function(d) {

                                    let x_pos = game_info_x_scale(game_info_dict[d]['min_game_min'] + time_series_mins_missing);

                                    return x_pos

                                })
                                .attr('y', season_title_height)
                                .attr('width', function(d) {

                                    let game_highlight_bg_width = game_info_x_scale(game_info_dict[d]['max_game_min'] - game_info_dict[d]['min_game_min'])

                                    return game_highlight_bg_width;

                                })
                                .attr('height', chart_time_series_top_height - season_title_height)
                                .attr('fill', 'none')
                                .attr('stroke', color_dict.med_gray)
                                .attr('stroke-width', '1px')
                                .style("stroke-dasharray", ("3, 3"))
                                .style('shape-rendering', 'CrispEdges');


}

function updateTimeSeriesChart(time_series_data) {

    //Remove any existing time series lines
    d3.selectAll('.time_series_lines').remove();
    d3.selectAll('.chart_legend_items').remove();
    d3.selectAll('.game_info_g').remove();
    d3.selectAll('#season_title_g').remove();
    d3.selectAll('#game_info_game_highlight_g').remove();

    //Draw Time Series Background
    if (time_series_data.length > 0) {
        drawSeasonGameBackgrounds(time_series_data[time_series_data.length - 1])
    }

    let chart_time_series_top_g = d3.select('#chart_time_series_top_g');
    let chart_time_series_top_width = d3.select('#chart_time_series_top_bg').node().getBoundingClientRect().width;
    let chart_time_series_top_height = d3.select('#chart_time_series_top_bg').node().getBoundingClientRect().height;

    let chart_time_series_bottom_g = d3.select('#chart_time_series_bottom_g');
    let chart_time_series_bottom_width = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().width;
    let chart_time_series_bottom_height = d3.select('#chart_time_series_bottom_g').node().getBoundingClientRect().height;

    let chart_time_series_padding = 20;

    //Iterate through time series and calc max_time_series_mins
    let max_time_series_mins = 0;
    

    time_series_data.forEach(function(time_series_dict) {

        let num_game_mins = time_series_dict.data.length;

        if (num_game_mins > max_time_series_mins) {

            max_time_series_mins = num_game_mins;

        }


    });

    
    //Iterate through time series and plot lines
    time_series_data.forEach(function(time_series_dict, t) {

        let game_info_dict = time_series_dict.game_info;
        let line_data = [];
        let cum_sum = 0;
        let time_series_length = time_series_dict.data.length
        let num_nulls = max_time_series_mins - time_series_length;

        console.log(time_series_dict);
        
        for (var i = 0; i < max_time_series_mins; i++) {

            if (i < num_nulls) {

                //line_data.push({game_min: i, cum_sum: null});

            } else if (i == num_nulls) {

                line_data.push({game_min: i, cum_sum: cum_sum})
 
            } else {

                let time_series_count = time_series_dict.data.length - time_series_length;

                if (time_series_dict['stat_category'] == 'ratio') {

                    line_data.push({game_min: i, cum_sum: time_series_dict['data'][time_series_count]['value']})

                } else {
                    cum_sum = cum_sum + time_series_dict['data'][time_series_count]['value']
                    line_data.push({game_min: i, cum_sum: cum_sum});
                }

                time_series_length = time_series_length - 1;

            }

        }

        
        let per_game_diff_value = line_data[line_data.length - 1]['cum_sum'] / time_series_dict.game_order.length

        console.log(time_series_dict.stat_selected, ': ', per_game_diff_value, 'per game.')

        ///Draw Time Series Line
        let time_series_y_min_domain_abs = Math.abs(time_series_dict['domain']['min_domain']);
        let time_series_y_max_domain_abs = Math.abs(time_series_dict['domain']['max_domain']);
        let time_series_y_min_domain = 0;
        let time_series_y_max_domain = 0;

        //Create symmetry for domains
        if (time_series_y_min_domain_abs > time_series_y_max_domain_abs) {

            time_series_y_min_domain = time_series_y_min_domain_abs * -1;
            time_series_y_max_domain = time_series_y_min_domain_abs

        } else {
            
            time_series_y_min_domain = time_series_y_max_domain_abs * -1;
            time_series_y_max_domain = time_series_y_max_domain_abs

        }

        console.log(time_series_y_min_domain, time_series_y_max_domain);

        let time_series_x_scale = d3.scaleLinear()
                                    .domain([0, max_time_series_mins])
                                    .range([0, chart_time_series_top_width]);

        let time_series_y_scale = d3.scaleLinear()
                                    .domain([time_series_y_min_domain, time_series_y_max_domain])
                                    .range([chart_time_series_top_height, 0]);


        let time_series_for_against = time_series_dict['stat_for_against'];
        let time_series_stat_name = time_series_dict['stat_selected'];
        let time_series_team_id = time_series_dict['team_id'];
        let time_series_line_id = 'time_series_line_' + time_series_team_id + '_' + time_series_stat_name + '_' + time_series_for_against + '_' + time_series_dict.data.length
        let time_series_color = 0;

        if (time_series_color_dict.hasOwnProperty(time_series_line_id)) {

                time_series_color = time_series_color_dict[time_series_line_id];

        } else {
        
                time_series_color = line_color_array[0];

                line_color_array.push(line_color_array.shift());

                time_series_color_dict[time_series_line_id] = time_series_color;
        }

        
        let time_series_line = chart_time_series_top_g.append('path')
                                    .datum(line_data)
                                    .attr('fill', 'none')
                                    .attr('stroke', time_series_color)
                                    .attr('stroke-width', 3)
                                    .attr('id', time_series_line_id)
                                    .attr('class', 'time_series_lines')
                                    .attr('d', d3.line()
                                                    .curve(d3.curveBasis)
                                                    .x(function(d) {return time_series_x_scale(d.game_min)})
                                                    .y(function(d) {return time_series_y_scale(d.cum_sum)})            
                                        )
                                    .attr('transform', 'translate(' + chart_time_series_padding + ',0)');

        //Add legend info
        let chart_legend_g = d3.select('#chart_legend_g');
        let chart_legend_width = d3.select('#chart_legend_body_bg').node().getBoundingClientRect().width;
        let chart_legend_height = d3.select('#chart_legend_body_bg').node().getBoundingClientRect().height;
        let chart_legend_title_height = 22;
        
        let chart_legend_item_height = 56;
        let chart_legend_color_rect_width = 8;
        let chart_legend_item_top = chart_legend_title_height + (t * chart_legend_item_height) + 1;
        let chart_legend_item_id = 'chart_legend_item_' + time_series_team_id + '_' + time_series_stat_name + '_' + time_series_for_against + '_' + max_time_series_mins

        let chart_legend_item_g = chart_legend_g.append('g')
                        .attr('id', chart_legend_item_id)
                        .attr('class', 'chart_legend_items')
                        .attr('transform', 'translate(0,' + chart_legend_item_top + ')')
                        .on('mouseover', function() {

                            d3.select('#' + time_series_line_id)
                                .transition()
                                .duration(200)
                                .attr('stroke-width', '5px')

                        })
                        .on('mouseout', function() {

                            d3.select('#' + time_series_line_id)
                                .transition()
                                .duration(200)
                                .attr('stroke-width', '3px')

                        })

        
        let chart_legend_item_bg = chart_legend_item_g.append('rect')
                                        .attr('class', 'chart_legend_item_bg')
                                        .attr('width', chart_legend_width)
                                        .attr('height', chart_legend_item_height)
                                        .attr('stroke', color_dict.med_gray)
                                        .attr('stroke-width', '1px')
                                        .style('shape-rendering', 'CrispEdges')
                                        .attr('fill', color_dict.gray_bg);

        let chart_legend_item_color_rect = chart_legend_item_g.append('rect')
                                                .attr('class', 'chart_legend_item_color_rect')
                                                .attr('width', chart_legend_color_rect_width)
                                                .attr('height', chart_legend_item_height)
                                                .attr('fill', time_series_color_dict[time_series_line_id]);

        
        let chart_legend_item_team_title = chart_legend_item_g.append('text')
                                            .text(function() {

                                                let legend_team_name = ''

                                                teams_array.forEach(function(team_dict) {

                                                    if (team_dict['team_id'] === time_series_team_id) {

                                                        legend_team_name = team_dict['team_loc']

                                                    }

                                                })

                                                return legend_team_name;

                                            })
                                            .attr('class', 'chart_legend_item_team_title')
                                            .attr('x', chart_legend_width / 2)
                                            .attr('y', 3)
                                            .attr('text-anchor', 'middle')
                                            .style('dominant-baseline', 'hanging')
                                            .style('font-weight', 700)
                                            .attr('font-size', '12px');

        let chart_legend_item_for_against_title = chart_legend_item_g.append('text')
                                            .text(function() {

                                                let for_against_text = time_series_for_against == 0 ? 'For' : 'Against';

                                                return for_against_text;
                                            })
                                            .attr('class', 'chart_legend_item_for_against_title')
                                            .attr('x', chart_legend_width / 2)
                                            .attr('y', chart_legend_item_height / 2 - 1)
                                            .attr('text-anchor', 'middle')
                                            .style('dominant-baseline', 'auto')
                                            .style('font-family', 'Work Sans')
                                            .attr('font-weight', 500)
                                            .attr('font-size', '12px');

        let chart_legend_item_stat_title = chart_legend_item_g.append('text')
                                            .text(function() {

                                                let stat_title = time_series_stat_name;
                                                
                                                stat_array['totals'].forEach(function(stat_dict) {

                                                    if (stat_dict['stat_name'] === time_series_stat_name){

                                                        stat_title = stat_dict['display_name'];
                                                    }
                                                })

                                                return stat_title;

                                            })
                                            .attr('class', 'chart_legend_item_stat_title')
                                            .attr('x', chart_legend_width / 2)
                                            .attr('y', chart_legend_item_height / 2 + 2)
                                            .attr('text-anchor', 'middle')
                                            .style('dominant-baseline', 'hanging')
                                            .style('font-family', 'Work Sans')
                                            .attr('font-weight', 500)
                                            .attr('font-size', '12px');
        
        let chart_legend_item_num_games_title = chart_legend_item_g.append('text')
                                            .text(function() {

                                                let num_games = parseInt(time_series_dict.data.length / 60);

                                                if (num_games === 1) {
                                                    return num_games + ' game'
                                                } else {
                                                    return num_games + ' games'
                                                }

                                            })
                                            .attr('class', 'chart_legend_item_num_games_title')
                                            .attr('x', chart_legend_width / 2)
                                            .attr('y', chart_legend_item_height - 5)
                                            .attr('text-anchor', 'middle')
                                            .style('dominant-baseline', 'auto')
                                            .style('font-family', 'Work Sans')
                                            .attr('font-weight', 500)
                                            .attr('font-size', '10px');

        let chart_legend_item_close_x = chart_legend_item_g.append('text')
                                            .text(function() {return '\uf00d'})
                                            .attr('id', 'chart_legend_item_close_x')
                                            .attr('class', 'font_awesome_text_icon')
                                            .attr('x', chart_legend_width - 3)
                                            .attr('y', 10)
                                            .attr('text-anchor', 'end')
                                            .style('dominant-baseline', 'middle')
                                            .attr('fill', color_dict.med_gray)
                                            .attr('font-size', '14px')
                                            .style('font-weight', 300)
                                            .style('cursor', 'pointer')
                                            .on('mouseover', function() {

                                                d3.select(this).transition()
                                                    .duration(200)
                                                    .attr('fill', color_dict.orange);

                                            })
                                            .on('mouseout', function() {

                                                d3.select(this).transition()
                                                    .duration(200)
                                                    .attr('fill', color_dict.med_gray)

                                            })
                                            .on('click', function() {

                                                let time_series_base_id = time_series_team_id + '_' + time_series_stat_name + '_' + time_series_for_against + '_' + max_time_series_mins;
                                                
                                                d3.select('#time_series_line_' + time_series_base_id).remove();
                                                d3.select('#chart_legend_item_' + time_series_base_id).remove();

                                                time_series_data.splice(t, 1);

                                                updateTimeSeriesChart(time_series_data);

                                            })

            let chart_legend_item_show_games_g = chart_legend_item_g.append('g')
                                                .attr('class', 'chart_legend_item_show_games_g')
                                                .attr('transform', function() {

                                                    return 'translate(' + (chart_legend_width - 7) + ',' + (chart_legend_item_height - 7) + ')'

                                                })
                                                .style('cursor', 'pointer')
                                                .on('click', function() {

                                                    d3.selectAll('.chart_legend_item_show_game_fore_circle')
                                                        .transition()
                                                        .duration(100)
                                                        .style('opacity', 0);

                                                    d3.select(this)
                                                        .select('.chart_legend_item_show_game_fore_circle')
                                                        .transition()
                                                        .duration(200)
                                                        .style('opacity', 1);


                                                    d3.selectAll('#season_title_g').remove();
                                                    d3.selectAll('.game_info_g').remove();
                                                    d3.selectAll('#game_info_game_highlight_g').remove();

                                                    drawSeasonGameBackgrounds(time_series_dict);

                                                })
                                                

            let chart_legend_item_show_games_bg_circle = chart_legend_item_show_games_g.append('circle')
                                                            .attr('r', 5)
                                                            .attr('fill', color_dict.med_gray);

            let chart_legend_item_show_game_fore_circle = chart_legend_item_show_games_g.append('circle')
                                                            .attr('r', 4)
                                                            .attr('class', 'chart_legend_item_show_game_fore_circle')
                                                            .attr('fill', color_dict.light_green)
                                                            .attr('cx', .5)
                                                            .attr('cy', .5)
                                                            .style('opacity', function() {

                                                                if (t === time_series_data.length - 1) {
                                                                    return 1
                                                                } else {
                                                                    return 0
                                                                }

                                                            })

            let chart_legend_item_show_game_text = chart_legend_item_show_games_g.append('text')
                                                            .text('display')
                                                            .attr('x', -5)
                                                            .attr('y', 3)
                                                            .attr('text-anchor', 'end')
                                                            .attr('font-size', '10px')
                                                            .attr('font-weight', 500)
                                                            .style('font-family', 'Work Sans');
                                                            


            

    })
    


}

function clearTimeSeriesChart() {

    d3.selectAll('.time_series_lines').remove();
    d3.selectAll('.chart_legend_items').remove();
    d3.selectAll('.game_info_g').remove();
    d3.selectAll('#season_title_g').remove();
    d3.selectAll('#game_info_game_highlight_g').remove();

    time_series_data = [];

}


function submitTimeSeriesRequest(game_select_array, prev_ratio_game_ids, stat_select_dict) {
    
    if  (stat_select_dict['stat_selected'] != 'none') {

        let game_request_array = []
        let ratio_request_array = []

        console.log(stat_select_dict);

        for (var i = team_sched_data.length - 1; i >= 0 ; i--) {

            let temp_team_data = team_sched_data[i];

            if (game_select_array.includes(temp_team_data['game_id'])) {

                append_dict = {
                                        game_id: temp_team_data['game_id'],
                                        away_team_id: temp_team_data['away_team_id'],
                                        home_team_id: temp_team_data['home_team_id'],
                                        team_id: curr_team_id        
            
                                        }

                game_request_array.push(append_dict)

            }

            if (prev_ratio_game_ids.includes(temp_team_data['game_id'])) {

                append_dict = {
                    game_id: temp_team_data['game_id'],
                    away_team_id: temp_team_data['away_team_id'],
                    home_team_id: temp_team_data['home_team_id'],
                    team_id: curr_team_id        

                    }

                ratio_request_array.push(append_dict);

            }

        }

        let time_series_req = {
            req_type: 'time_series_request',
            game_select_array: game_request_array,
            ratio_select_array: ratio_request_array,
            stat_select_dict: stat_select_dict
        }

        let time_series_domain_req = {
            req_type: 'time_series_domain_request',
            stat_select_dict: stat_select_dict,
            domain_game_range: game_request_array.length
        }

        ws_conn.send(JSON.stringify(time_series_req));

    } else {

        window.alert('No Stat Selected.')

    }

}

//Connect to websocket
function startWebSocket() {
    ws_conn = new WebSocket('wss://ncaaf-multi-game-api.untouted.com/');
    console.log('Websocket Connected.')

    ws_conn.onmessage = function incoming(event) {
        
        let resp_dict = JSON.parse(event.data)
        
        let resp_type = resp_dict['resp_type']

        console.log(resp_dict);

        if (resp_type == 'team_info') {
            
            updateTeamInfoContents(resp_dict['data'][0]);

            curr_team_id = resp_dict['data'][0]['team_id']

            let team_sched_req = {
                req_type: 'team_sched_request',
                team_id: curr_team_id
            }

            ws_conn.send(JSON.stringify(team_sched_req));
            
        } else if (resp_type == 'teams_request') {
           
            teams_array = resp_dict['data']
            
        } else if (resp_type == 'team_sched') {

            team_sched_data = resp_dict['data']
            populateGameSelector(team_sched_data)
        
        } else if (resp_type == 'time_series_request') {

            time_series_data.push(resp_dict);
            updateTimeSeriesChart(time_series_data);

        }
        
    }

    ws_conn.onclose = function() {
        ws_conn = null;
        console.log('Websocket Disconnected.')
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
      callback();
    }, 50), false);
	}};

  // returns the me object that has all the public functions in it
	return me;
})();


//Start App
drawSidebarContents();
drawChartContents();
startWebSocket();
setTimeout(function() {
    
        //Initial draw functions go here
        width = d3.select('#viz').node().getBoundingClientRect().width;
        height = d3.select('#viz').node().getBoundingClientRect().height;
        orient = (width / height) > (4 / 3)   ? 'landscape' : 'portrait';

        //Send init requests
        let init_teams_req = {
            req_type: 'teams_request',
        }

        let init_team_info_req = {
            req_type: 'team_info_request',
            team_id: -1
        }

                   
        ws_conn.send(JSON.stringify(init_teams_req));
        ws_conn.send(JSON.stringify(init_team_info_req));
    
        APP.onResize(function() {
            
                
            //Resize functions go here
            //ws_conn.send('Buenos Diaz')
            
            //repositionVizElements();
            
            });

    
    }, 1200);

// Call onResize like this
