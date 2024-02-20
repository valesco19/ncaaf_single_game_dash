
//Global Vars
let color_dict = {
    black: "#000",
    charcoal: "#333",
    white: "#fff",
    light_gray: "#f2f2f2",
    med_gray: "#cec1ae",
    dark_gray: '#cec1ae',
    orange: "#f57e42",
    dark_bg: "#1a1a1a",
    red: '#FA8072', 
    light_blue: '#ADD8E6',
    transparent: 'rgba(0,0,0,0)'
}

let feature_display_name_dict = {
    "home_starting_elo_diff": "ELO Diff",
    "home_starting_elo": "Home ELO",
    "away_starting_elo": "Away ELO",
    "home_for_points_q50_forecast": "For Home Points",
    "home_against_points_q50_forecast": "Ag Home Points",
    "home_for_fg_made_q50_forecast": "For Home FG Made",
    "home_against_fg_made_q50_forecast": "Ag Home FG Made",
    "home_for_fg_att_q50_forecast": "For Home FG Att",
    "home_against_fg_att_q50_forecast": "Ag Home FG Att",
    "home_for_three_pt_made_q50_forecast": "For Home 3PT Made",
    "home_against_three_pt_made_q50_forecast": "Ag Home 3PT Made",
    "home_for_three_pt_att_q50_forecast": "For Home 3PT Att",
    "home_against_three_pt_att_q50_forecast": "Ag Home 3PT Att",
    "home_for_ft_made_q50_forecast": "For Home FT Made",
    "home_against_ft_made_q50_forecast": "Ag Home FT Made",
    "home_for_ft_att_q50_forecast": "For Home FT Att",
    "home_against_ft_att_q50_forecast": "Ag Home FT Att",
    "home_for_total_rebs_q50_forecast": "For Home Total Reb",
    "home_against_total_rebs_q50_forecast": "Ag Home Total Reb",
    "home_for_off_rebs_q50_forecast": "For Home Off Reb",
    "home_against_off_rebs_q50_forecast": "Ag Home Off Reb",
    "home_for_assists_q50_forecast": "For Home Assists",
    "home_against_assists_q50_forecast": "Ag Home Assists",
    "home_for_turnovers_q50_forecast": "For Home Turnovers",
    "home_against_turnovers_q50_forecast": "Ag Home Turnovers",
    "home_for_steals_q50_forecast": "For Home Steals",
    "home_against_steals_q50_forecast": "Ag Home Steals",
    "home_for_blocks_q50_forecast": "For Home Blocks",
    "home_against_blocks_q50_forecast": "Ag Home Blocks",
    "away_for_points_q50_forecast": "For Away Points",
    "away_against_points_q50_forecast": "Ag Away Points",
    "away_for_fg_made_q50_forecast": "For Away FG Made",
    "away_against_fg_made_q50_forecast": "Ag Away FG Made",
    "away_for_fg_att_q50_forecast": "For Away FG Att",
    "away_against_fg_att_q50_forecast": "Ag Away FG Att",
    "away_for_three_pt_made_q50_forecast": "For Away 3PT Made",
    "away_against_three_pt_made_q50_forecast": "Ag Away 3PT Made",
    "away_for_three_pt_att_q50_forecast": "For Away 3PT Att",
    "away_against_three_pt_att_q50_forecast": "Ag Away 3PT Att",
    "away_for_ft_made_q50_forecast": "For Away FT Made",
    "away_against_ft_made_q50_forecast": "Ag Away FT Made",
    "away_for_ft_att_q50_forecast": "For Away FT Att",
    "away_against_ft_att_q50_forecast": "Ag Away FT Att",
    "away_for_total_rebs_q50_forecast": "For Away Total Reb",
    "away_against_total_rebs_q50_forecast": "Ag Away Total Reb",
    "away_for_off_rebs_q50_forecast": "For Away Off Reb",
    "away_against_off_rebs_q50_forecast": "Ag Away Off Reb",
    "away_for_assists_q50_forecast": "For Away Assists",
    "away_against_assists_q50_forecast": "Ag Away Assists",
    "away_for_turnovers_q50_forecast": "For Away Turnovers",
    "away_against_turnovers_q50_forecast": "Ag Away Turnovers",
    "away_for_steals_q50_forecast": "For Away Steals",
    "away_against_steals_q50_forecast": "Ag Away Steals",
    "away_for_blocks_q50_forecast": "For Away Blocks",
    "away_against_blocks_q50_forecast": "Ag Away Blocks",
}

let matchup_info_dict = {};
let projections_dict = {};
let predictions_dict = {};
let projection_range_dict = {};
let projection_col_array = [];
let time_series_y_scale;
let model_input_dict;

let global_vars_dict = {
    'matchup_prediction_display_id': 0,
    'model_stat_group_is_for': true,
};

let formatDecimal1Place = d3.format(".1f");
let formatDecimal2Places = d3.format(".2f");       
let formatDecimal3Places = d3.format(".3f");

//Helper Functions
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

function findStatGroupRank(stat_group_array, team_abbrev) {

    let matched_dict = stat_group_array.find(dict => dict["ncaa_team_seo_name"] === team_abbrev);

    if (matched_dict) {
        return matched_dict['stat_group_rank'];
    } else {
        return null;
    }
}

function getEntriesAroundRank(stat_group_array, target_rank, num_entries) {

    let target_index = stat_group_array.findIndex(entry => entry.stat_group_rank === target_rank);

    if (target_index === -1) {
        //Rank  Not found
        return {"teams_above": [], "teams_below": []};
    }

    let start_index_above = Math.max(0, target_index - num_entries);
    let end_index_below = Math.min(stat_group_array.length - 1, target_index + num_entries);

    let teams_above = stat_group_array.slice(start_index_above, target_index);
    let teams_below = stat_group_array.slice(target_index + 1, end_index_below + 1);

    return {"teams_above": teams_above, "teams_below": teams_below}
}

function returnCurrentStatGroupName() {

    //Match Global Var Dict Stat group id to stat group name in projection col array
    let matched_dict = projection_col_array.find(dict => dict["stat_id"] === global_vars_dict['modal_stat_id']);
    let away_home = global_vars_dict['model_stat_group_is_home'] ? 'home' : 'away';
    let against_for = global_vars_dict['model_stat_group_is_for'] ? 'for' : 'against';

    if (matched_dict) {

        console.log('Matched Dict', matched_dict);  
        
        let stat_group_name = matched_dict['stat_group'];

        if (global_vars_dict['modal_stat_id'] === 0) {

            return away_home + '_starting_elo';

        } else {

            return away_home + '_' + against_for + '_' + stat_group_name + '_q50';

        }

    } else {
        return null;
    }
}

// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function(V) {
      return X.map(function(x) {
        return [x, d3.mean(V, function(v) { return kernel(x - v); })];
      });
    };
  }

function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
  }

  function calcTeamTotal(spread, game_total) {

    let team_total = (game_total / 2) + (spread / 2);

    return team_total

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

function createArrayWithIndices(length) {
    let resultArray = [];

    for (let i = 0; i < length; i++) {
        resultArray.push(i);
    }

    return resultArray;
}

//Main Populate Functions
function populateTeamCompareStatRanks(stat_group_array, model_input_rank, num_teams_to_display, is_first_populate, is_elo) {

    console.log("stat_group_array ->>", stat_group_array);
    console.log("model_input_rank ->>", model_input_rank);

    let team_compare_dict = getEntriesAroundRank(stat_group_array, model_input_rank, num_teams_to_display);
    let teams_above_array = team_compare_dict['teams_above'];
    let teams_below_array = team_compare_dict['teams_below'];

    //Update table with teams above, iterate from back to front
    for (let [i, above_team_dict] of teams_above_array.slice().reverse().entries()) {

        let above_row_number = num_teams_to_display - (1 + i);

        let team_above_row_g = d3.select("#team_compare_above_row_" + above_row_number);

        //Set text values
        //team abbrev text
        team_above_row_g.select('#team_compare_above_row_text_0').text(above_team_dict['team_abbrev']);
        //conference text
        team_above_row_g.select("#team_compare_above_row_text_1").text(above_team_dict['conference_abbrev']);
        //stat group value
        if (is_elo) {
            team_above_row_g.select("#team_compare_above_row_text_2").text(parseInt(above_team_dict["stat_group_median"]));
        } else {
            team_above_row_g.select("#team_compare_above_row_text_2").text(formatDecimal1Place(above_team_dict["stat_group_median"]));
        }
        //stat group rank
        team_above_row_g.select("#team_compare_above_row_text_3").text(above_team_dict['stat_group_rank']);

    }

    for (let [i, below_team_dict] of teams_below_array.entries()) {

        let team_below_row_g = d3.select("#team_compare_below_row_" + i);

         //Set text values
        //team abbrev text
        team_below_row_g.select('#team_compare_below_row_text_0').text(below_team_dict['team_abbrev']);
        //conference text
        team_below_row_g.select("#team_compare_below_row_text_1").text(below_team_dict['conference_abbrev']);
        //stat group value
        if (is_elo) {
            team_below_row_g.select("#team_compare_below_row_text_2").text(parseInt(below_team_dict["stat_group_median"]));
        } else {
            team_below_row_g.select("#team_compare_below_row_text_2").text(formatDecimal1Place(below_team_dict["stat_group_median"]));
        }
        //stat group rank
        team_below_row_g.select("#team_compare_below_row_text_3").text(below_team_dict['stat_group_rank']);

        //If not first populate, add one to the rank of all teams below the current team
        if (is_first_populate) {
            team_below_row_g.select("#team_compare_below_row_text_3").text(below_team_dict['stat_group_rank']);
        } else {
            team_below_row_g.select("#team_compare_below_row_text_3").text(below_team_dict['stat_group_rank']);
        }

    }
}

function populateModelInputsELODistPlot(stat_group_array) {

    let model_input_svg = d3.select("#model_input_distribution_svg");

    let model_input_svg_width = model_input_svg.node().getBoundingClientRect().width;
    let model_input_svg_height = model_input_svg.node().getBoundingClientRect().height;

    let model_input_padding_dict = {
        left: 70,
        right: 70,
        top: 15,
        bottom: 10,
    };

    let dist_panel_width_ratio = 0.65;

    let dist_panel_width = model_input_svg_width * dist_panel_width_ratio - model_input_padding_dict.left;
    let dist_panel_height = model_input_svg_height - model_input_padding_dict.top - model_input_padding_dict.bottom;

    let dist_bg = model_input_svg.append('rect')
                                                .attr('x', model_input_padding_dict.left)
                                                .attr('y', model_input_padding_dict.top)
                                                .attr('width', dist_panel_width)
                                                .attr('height', dist_panel_height)
                                                .attr('fill', color_dict.dark_bg)
                                                // .attr('stroke', color_dict.dark_gray)
                                                // .attr('stroke-width', '1px')
                                                .style('shape-rendering', 'CrispEdges');

    //Plot Density Plot
    let stat_group_extent = d3.extent(stat_group_array, function(d) {return d.stat_group_median});
    let stat_group_min = stat_group_extent[0] * .97;
    let stat_group_max = stat_group_extent[1] * 1.03;

    let stat_group_medians = stat_group_array.map(function(d) {
        return d.stat_group_median;
    });

    let density_x_scale = d3.scaleLinear()
                                                .domain([stat_group_min, stat_group_max])
                                                .range([model_input_padding_dict.left, model_input_padding_dict.left + dist_panel_width]);

    let density_y_scale = d3.scaleLinear()
                                                .domain([0.0, 0.003])
                                                .range([dist_panel_height, model_input_padding_dict.top]);

    // Create a kernel density estimate function
    let kde = kernelDensityEstimator(kernelEpanechnikov(12), density_x_scale.ticks(10))
    let density = kde(stat_group_medians);

    //Add Zero values to begin and end of array to guarantee the plots end on the X axis
    density.unshift([stat_group_min, 0]);
    density.push([stat_group_max, 0]);

    //Create Density Gradient
    let density_gradient = model_input_svg.append("defs")
                                                                .append("linearGradient")
                                                                .attr("id", "density_gradient")
                                                                .attr("x1", "0%")
                                                                .attr("y1", "0%")
                                                                .attr("x2", "0%")
                                                                .attr("y2", "100%");

    density_gradient.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", color_dict.orange); 

    density_gradient.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", color_dict.transparent);


    let density_line = model_input_svg.append('path')
                                                                        .attr('id', 'kde_path')
                                                                        .datum(density)
                                                                        .attr('fill', 'url(#density_gradient)')
                                                                        .attr('opacity', '0.7')
                                                                        .attr('stroke', color_dict.orange)
                                                                        .attr("stroke-width", '1px')
                                                                        .attr("stroke-linejoin", "round")
                                                                        .attr('d', d3.line().curve(d3.curveBasis)
                                                                                                        .x(function(d) {return density_x_scale(d[0])})
                                                                                                        .y(function(d) {return density_y_scale(d[1])})
                                                                        );

    let density_x_axis = model_input_svg.append('g')
                                    .attr('transform', 'translate(0,' + dist_panel_height + ')')
                                    .call(d3.axisBottom(density_x_scale))
                                    .attr('stroke', 'none') 

    density_x_axis.selectAll('text')
                                        .attr('fill', color_dict.med_gray)
                                        .style('shape-rendering', 'CrispEdges')
                                        .style('font-family', 'Work Sans')
                                        .style('font-size', '12px');
                                   
    density_x_axis.selectAll('.domain') // Select all path elements on the x-axis
                                    .attr('stroke', color_dict.transparent)
                                    .attr('fill', color_dict.transparent)

    density_x_axis.selectAll('line')
                                    .attr('stroke', 'none');

    //Retrieve Team values
    let stat_group_name = returnCurrentStatGroupName();
    let model_input_value = projections_dict[stat_group_name];
    let selected_team_is_home = global_vars_dict['model_stat_group_is_home'];
    let selected_team_seo_name = selected_team_is_home ? matchup_info_dict['home_team_seo_name'] : matchup_info_dict['away_team_seo_name'];
    let selected_team_abbrev = selected_team_is_home ? matchup_info_dict['home_team_abbrev'] : matchup_info_dict['away_team_abbrev'];
    let selected_conf_abbrev = selected_team_is_home ? matchup_info_dict['home_team_conference_abbrev']: matchup_info_dict['away_team_conference_abbrev'];
    let model_input_rank = findStatGroupRank(stat_group_array, selected_team_seo_name);

     //Plot Starting  Value for baseline    
    let team_starting_value_text = model_input_svg.append('text')
                                                                                        .text(model_input_value)
                                                    
                                                                                        .attr('id', 'team_starting_value_text')
                                                                                        .style('opacity', 0)
                                                                                        .attr('x', density_x_scale(model_input_value))
                                                                                        .attr('y', dist_panel_height)
                                                                                        .attr("text-anchor", 'middle')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('fill', color_dict.med_gray)
                                                                                        .attr('font-size', '12px')
                                                                                        .attr('font-weight', 500);

    function team_value_dragged(event) {

        let dragged_x = d3.pointer(event)[0] - model_input_padding_dict.left;

        if (dragged_x <= model_input_padding_dict.left) {
            dragged_x = model_input_padding_dict.left;
        }

        if (dragged_x >= dist_panel_width + model_input_padding_dict.left  - 1) {
            dragged_x = dist_panel_width + model_input_padding_dict.left - 1;
        }

        //Update the elements positions
        d3.select("#team_value_bg").attr('x', dragged_x - team_value_rect_width / 2);
        d3.select("#team_value_circle").attr('cx', dragged_x)
        d3.select("#team_value_line").attr('x1', dragged_x).attr('x2', dragged_x);
        
        let dragged_elo_value = parseInt(density_x_scale.invert(dragged_x));

        d3.select("#team_value_text").attr('x', dragged_x).text(dragged_elo_value);

        //Update Team Compares
        //Find nearest value to determine rank
        let closest_lower_index = 0;

        for (i = 0; i < stat_group_array.length; i ++) {

            let team_dict = stat_group_array[i];

            if (team_dict['stat_group_median'] < dragged_elo_value) {
                closest_lower_index = i;
                break
            }
        }

        //Update Team Compare List
        let current_team_rank = stat_group_array[closest_lower_index]['stat_group_rank'] + 1;
        // Use current_team_rank as needed
        populateTeamCompareStatRanks(stat_group_array, current_team_rank, num_teams_to_display_above, false, true)

        //Update Team Value and Rank
        d3.select("#team_compare_team_row_text_2").text(dragged_elo_value);
        d3.select("#team_compare_team_row_text_3").text(current_team_rank);

        //Update Time series model input
        d3.select("#model_input_stat_group_median_circle")
                .attr('cy', time_series_y_scale(dragged_elo_value));

        d3.select("#model_input_stat_group_median_text")
                .text(dragged_elo_value)
                .attr('y', time_series_y_scale(dragged_elo_value) - 10);


    }

    let team_value_g = model_input_svg.append('g')
                                                .attr('id', 'model_input_team_value_g')
                                                .style('cursor', 'pointer')
                                                .call(d3.drag()
                                                                .on('start', function(event) {
                                                                    d3.select("#team_starting_value_text").style("opacity", 1);
                                                                })
                                                                .on('drag', team_value_dragged)
                                                )   

    let team_value_rect_width = 30;

    let team_value_bg = team_value_g.append('rect')
                                                        .attr('id', 'team_value_bg')
                                                        .attr('x', density_x_scale(model_input_value) - team_value_rect_width / 2)
                                                        .attr('y',model_input_padding_dict.top)
                                                        .attr('width', team_value_rect_width)
                                                        .attr('height', dist_panel_height)
                                                        .attr('fill', color_dict.transparent);

    let team_value_circle =  team_value_g.append('circle')
                                                        .attr('id', 'team_value_circle')
                                                        .attr('cx', density_x_scale(model_input_value))
                                                        .attr("cy", dist_panel_height)
                                                        .attr('r', 4)
                                                        .attr('fill', color_dict.orange);

    let team_value_line = team_value_g.append('line')
                                                        .attr('id', 'team_value_line')
                                                        .attr('class', 'dragable_team_value_elements')
                                                        .attr("x1", density_x_scale(model_input_value))
                                                        .attr("x2", density_x_scale(model_input_value))
                                                        .attr('y1', dist_panel_height)
                                                        .attr('y2', model_input_padding_dict.top)
                                                        .attr('stroke', color_dict.orange)
                                                        .attr('stroke-width', '1px');

    let team_value_text = team_value_g.append('text')
                                                        .text(model_input_value)
                                                        .attr('id', 'team_value_text')
                                                        .attr('class', 'dragable_team_value_elements')
                                                        .attr('x', density_x_scale(model_input_value))
                                                        .attr('y', model_input_padding_dict.top - 2)
                                                        .attr("text-anchor", 'middle')
                                                        .attr('dominant-baseline', 'baseline')
                                                        .attr('fill', color_dict.orange)
                                                        .attr('font-size', '16px')
                                                        .attr('font-weight', 500);

    //Draw Comparable teams Panel
    let team_compare_panel_width = model_input_svg_width * (1 - dist_panel_width_ratio) - model_input_padding_dict.right;
    let team_compare_panel_height = dist_panel_height;
    let team_compare_panel_left = dist_panel_width + model_input_padding_dict.left;

    let team_compare_g = model_input_svg.append('g')
                                                        .attr('id', 'team_compare_g')
                                                        .attr('transform', 'translate(' + team_compare_panel_left + ',' + model_input_padding_dict.top + ')');

    let team_compare_col_array = [
        {"display_name": "Team", "id": 1, "base_name": "team_abbrev"},
        {"display_name": "Conf", "id": 2, "base_name": "conf_abbrev"},
        {"display_name": "Elo", "id": 3, "base_name": "team_elo"},
        {"display_name": "Rank", "id": 4, "base_name": "team_rank"},
    ]

    let num_teams_to_display_above = 4;
    let num_teams_to_display = num_teams_to_display_above * 2 + 1;
    let team_index_array = createArrayWithIndices(num_teams_to_display_above);

    let team_compare_col_width = team_compare_panel_width / (team_compare_col_array.length + 1);
    let team_compare_row_height = team_compare_panel_height / (num_teams_to_display + 1);

    let team_compare_bg = team_compare_g.append('rect')
                                                        .attr('id', 'team_compare_bg')
                                                        .attr('x', 0)
                                                        .attr('y', 0)
                                                        .attr('width', team_compare_panel_width)
                                                        .attr('height', team_compare_panel_height)
                                                        .attr('fill', color_dict.dark_bg);

    let team_compare_column_headers_text = team_compare_g.selectAll(".team_compare_column_headers_text")
                                                                                                    .data(team_compare_col_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {return d.display_name})
                                                                                                    .attr('x', function(d, i) {

                                                                                                        return team_compare_col_width * (i + 1);
                                                                                                    })
                                                                                                    .attr('y', 0)
                                                                                                    .attr("text-anchor", 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('fill', color_dict.dark_gray)
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500);

    let team_compare_team_row_g = team_compare_g.append('g')
                                                                                .attr('id', 'team_compare_team_row_g');

    
    let team_compare_team_row_text = team_compare_team_row_g.selectAll(".team_compare_team_row_text")
                                                                                                    .data(team_compare_col_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        if (i === 0) {
                                                                                                            return selected_team_abbrev;
                                                                                                        } else if (i === 1) {
                                                                                                            return selected_conf_abbrev;
                                                                                                        } else if (i == 2) {
                                                                                                            return parseInt(model_input_value);
                                                                                                        } else if (i == 3) {
                                                                                                            return model_input_rank;
                                                                                                        } else {
                                                                                                            console.log('Team Text out of range');
                                                                                                            return ''
                                                                                                        };

                                                                                                    })
                                                                                                    .attr('class', 'team_compare_team_row_text')
                                                                                                    .attr('id', function(d, i) {
                                                                                                        return "team_compare_team_row_text_" + i;
                                                                                                    })
                                                                                                    .attr('x', function(d, i) {

                                                                                                        return team_compare_col_width * (i + 1);
                                                                                                    })
                                                                                                    .attr('y', (num_teams_to_display_above + 1) * team_compare_row_height)
                                                                                                    .attr("text-anchor", 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .attr('font-size', '12px')
                                                                                                    .attr('font-weight', 500);

    let team_compare_above_rows = team_compare_g.selectAll(".team_compare_above_row")
                                                                                                    .data(team_index_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'team_compare_above_row')
                                                                                                    .attr("id", function(d, i) {
                                                                                                       return "team_compare_above_row_" + i
                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        return "translate(0," + (team_compare_row_height * (i + 1)) + ")"

                                                                                                    });

    let team_compare_above_rows_text = team_compare_above_rows.selectAll(".team_compare_above_rows_text")
                                                                                            .data(team_compare_col_array)
                                                                                            .enter()
                                                                                            .append('text')
                                                                                            .text("-")
                                                                                            .attr("class", "team_compare_above_rows_text")
                                                                                            .attr('id', function(d,i) {
                                                                                                return 'team_compare_above_row_text_' + i;
                                                                                            })
                                                                                            .attr('x', function(d, i) {

                                                                                                return team_compare_col_width * (i + 1);
                                                                                            })
                                                                                            .attr('y', 0)
                                                                                            .attr("text-anchor", 'middle')
                                                                                            .attr('dominant-baseline', 'baseline')
                                                                                            .attr('fill', color_dict.dark_gray)
                                                                                            .attr('font-size', '12px')
                                                                                            .attr('font-weight', 500);

let team_compare_below_rows = team_compare_g.selectAll(".team_compare_below_row")
                                                                                            .data(team_index_array)
                                                                                            .enter()
                                                                                            .append('g')
                                                                                            .attr('class', 'team_compare_below_row')
                                                                                            .attr("id", function(d, i) {
                                                                                                return "team_compare_below_row_" + i
                                                                                            })
                                                                                            .attr('transform', function(d, i) {

                                                                                                return "translate(0," + (team_compare_row_height * (i + 2 + num_teams_to_display_above)) + ")"

                                                                                            });

let team_compare_below_rows_text = team_compare_below_rows.selectAll(".team_compare_below_rows_text")
                                                                                    .data(team_compare_col_array)
                                                                                    .enter()
                                                                                    .append('text')
                                                                                    .text("-")
                                                                                    .attr('x', function(d, i) {

                                                                                        return team_compare_col_width * (i + 1);
                                                                                    })
                                                                                    .attr('y', 0)
                                                                                    .attr('class', 'team_compare_below_rows_text')
                                                                                    .attr('id', function(d,i) {
                                                                                        return 'team_compare_below_row_text_' + i;
                                                                                    })
                                                                                    .attr("text-anchor", 'middle')
                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                    .attr('fill', color_dict.dark_gray)
                                                                                    .attr('font-size', '12px')
                                                                                    .attr('font-weight', 500);

    populateTeamCompareStatRanks(stat_group_array, model_input_rank, num_teams_to_display_above, true, true)

    
}

function populateModelInputsStatsDistPlot(stat_group_dict) {

    let for_stat_group_array = stat_group_dict['for_stat_group_array'];
    let against_stat_group_array = stat_group_dict['against_stat_group_array'];

    let model_input_svg = d3.select("#model_input_distribution_svg");

    let model_input_svg_width = model_input_svg.node().getBoundingClientRect().width;
    let model_input_svg_height = model_input_svg.node().getBoundingClientRect().height;

    let model_input_padding_dict = {
        left: 70,
        right: 70,
        top: 15,
        bottom: 10,
    };

    let dist_panel_width_ratio = 0.65;

    let dist_panel_width = model_input_svg_width * dist_panel_width_ratio - model_input_padding_dict.left;
    let dist_panel_height = model_input_svg_height - model_input_padding_dict.top - model_input_padding_dict.bottom;

    let dist_bg = model_input_svg.append('rect')
                                                .attr('x', model_input_padding_dict.left)
                                                .attr('y', model_input_padding_dict.top)
                                                .attr('width', dist_panel_width)
                                                .attr('height', dist_panel_height)
                                                .attr('fill', color_dict.dark_bg)
                                                .style('shape-rendering', 'CrispEdges');

    //Plot Density Plot
    let for_stat_group_extent = d3.extent(for_stat_group_array, function(d) {return d.stat_group_median});
    let against_stat_group_extent = d3.extent(against_stat_group_array, function(d) {return d.stat_group_median});

    // Find the min and max of the two extents
    let stat_group_min = Math.min(for_stat_group_extent[0], against_stat_group_extent[0]) * .97;
    let stat_group_max = Math.max(for_stat_group_extent[1], against_stat_group_extent[1]) * 1.03;

    let for_stat_group_medians = for_stat_group_array.map(function(d) {
        return d.stat_group_median;
    });

    let against_stat_group_medians = against_stat_group_array.map(function(d) {
        return d.stat_group_median;
    });
    
    let density_x_scale = d3.scaleLinear()
                                                .domain([stat_group_min, stat_group_max])
                                                .range([model_input_padding_dict.left, model_input_padding_dict.left + dist_panel_width]);

    let density_y_scale = d3.scaleLinear()
                                                .domain([0.0, 0.08])
                                                .range([dist_panel_height, model_input_padding_dict.top]);

    // Create a kernel density estimate function
    let kde = kernelDensityEstimator(kernelEpanechnikov(12), density_x_scale.ticks(10))

    let for_density = kde(for_stat_group_medians);
    let against_density = kde(against_stat_group_medians);

    //Add Zero values to begin and end of array to guarantee the plots end on the X axis
    for_density.unshift([stat_group_min, 0]);
    against_density.unshift([stat_group_min, 0]);
    for_density.push([stat_group_max, 0]);
    against_density.push([stat_group_max, 0]);

    //Create Density Gradient
    let for_density_gradient = model_input_svg.append("defs")
                                                                .append("linearGradient")
                                                                .attr("id", "for_density_gradient")
                                                                .attr("x1", "0%")
                                                                .attr("y1", "0%")
                                                                .attr("x2", "0%")
                                                                .attr("y2", "100%");

    for_density_gradient.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", color_dict.light_blue); 

    for_density_gradient.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", color_dict.transparent);

    let against_density_gradient = model_input_svg.append("defs")
                                                                .append("linearGradient")   
                                                                .attr("id", "against_density_gradient")
                                                                .attr("x1", "0%")
                                                                .attr("y1", "0%")
                                                                .attr("x2", "0%")
                                                                .attr("y2", "100%");

    against_density_gradient.append("stop")
                    .attr("offset", "0%")
                    .style("stop-color", color_dict.red);

    against_density_gradient.append("stop")
                    .attr("offset", "100%")
                    .style("stop-color", color_dict.transparent);

    let for_density_line = model_input_svg.append('path')
                                                                        .attr('id', 'for_kde_path')
                                                                        .datum(for_density)
                                                                        .attr('fill', 'url(#for_density_gradient)')
                                                                        .attr('opacity', '0.7')
                                                                        .attr('stroke', color_dict.light_blue)
                                                                        .attr("stroke-width", '1px')
                                                                        .attr("stroke-linejoin", "round")
                                                                        .attr('d', d3.line().curve(d3.curveBasis)
                                                                                                        .x(function(d) {return density_x_scale(d[0])})
                                                                                                        .y(function(d) {return density_y_scale(d[1])})
                                                                        );

    let against_density_line = model_input_svg.append('path')
                                                                        .attr('id', 'against_kde_path')
                                                                        .datum(against_density)
                                                                        .attr('fill', 'url(#against_density_gradient)')
                                                                        .attr('opacity', '0.7')
                                                                        .attr('stroke', color_dict.red)
                                                                        .attr("stroke-width", '1px')
                                                                        .attr("stroke-linejoin", "round")
                                                                        .attr('display', 'none')
                                                                        .attr('d', d3.line().curve(d3.curveBasis)
                                                                                                        .x(function(d) {return density_x_scale(d[0])})
                                                                                                        .y(function(d) {return density_y_scale(d[1])})
                                                                        );

    let density_x_axis = model_input_svg.append('g')
                                    .attr('transform', 'translate(0,' + dist_panel_height + ')')
                                    .call(d3.axisBottom(density_x_scale))
                                    .attr('stroke', 'none') 

    density_x_axis.selectAll('text')
                                        .attr('fill', color_dict.med_gray)
                                        .style('shape-rendering', 'CrispEdges')
                                        .style('font-family', 'Work Sans')
                                        .style('font-size', '12px');
                                   
    density_x_axis.selectAll('.domain') // Select all path elements on the x-axis
                                    .attr('stroke', color_dict.transparent)
                                    .attr('fill', color_dict.transparent)

    density_x_axis.selectAll('line')
                                    .attr('stroke', 'none');

    //Retrieve Team values

    let for_stat_group_name = returnCurrentStatGroupName();
    let against_stat_group_name = for_stat_group_name.replace("_for_", "_against_");
    let for_model_input_value = formatDecimal1Place(projections_dict[for_stat_group_name]);
    let against_model_input_value = formatDecimal1Place(projections_dict[against_stat_group_name]);
    let selected_team_is_home = global_vars_dict['model_stat_group_is_home'];
    let selected_team_seo_name = selected_team_is_home ? matchup_info_dict['home_team_seo_name'] : matchup_info_dict['away_team_seo_name'];
    let selected_team_abbrev = selected_team_is_home ? matchup_info_dict['home_team_abbrev'] : matchup_info_dict['away_team_abbrev'];
    let selected_conf_abbrev = selected_team_is_home ? matchup_info_dict['home_team_conference_abbrev']: matchup_info_dict['away_team_conference_abbrev'];
    let for_model_input_rank = findStatGroupRank(for_stat_group_array, selected_team_seo_name);
    let against_model_input_rank = findStatGroupRank(against_stat_group_array, selected_team_seo_name);

    console.log("For Stat Group Name", for_stat_group_name);
    console.log("Against Stat Group Name", against_stat_group_name);

     //Plot Starting  Value for baseline    
    let team_starting_for_value_text = model_input_svg.append('text')
                                                                                        .text(for_model_input_value)
                                                    
                                                                                        .attr('id', 'for_team_starting_value_text')
                                                                                        .style('opacity', 0)
                                                                                        .attr('x', density_x_scale(for_model_input_value))
                                                                                        .attr('y', dist_panel_height)
                                                                                        .attr("text-anchor", 'middle')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('fill', color_dict.black)
                                                                                        .attr('font-size', '12px')
                                                                                        .attr('font-weight', 500);

    function for_team_value_dragged(event) {

        let dragged_x = d3.pointer(event)[0] - model_input_padding_dict.left;

        if (dragged_x <= model_input_padding_dict.left) {
            dragged_x = model_input_padding_dict.left;
        }

        if (dragged_x >= dist_panel_width + model_input_padding_dict.left  - 1) {
            dragged_x = dist_panel_width + model_input_padding_dict.left - 1;
        }

        //Update the elements positions
        d3.select("#for_team_value_bg").attr('x', dragged_x - team_value_rect_width / 2);
        d3.select("#for_team_value_circle").attr('cx', dragged_x)
        d3.select("#for_team_value_line").attr('x1', dragged_x).attr('x2', dragged_x);
        
        let dragged_stat_value = formatDecimal1Place(density_x_scale.invert(dragged_x));

        d3.select("#for_team_value_text").attr('x', dragged_x).text(dragged_stat_value);

        //Update Team Compares
        //Find nearest value to determine rank
        let closest_lower_index = 0;

        for (i = 0; i < for_stat_group_array.length; i ++) {

            let team_dict = for_stat_group_array[i];

            if (team_dict['stat_group_median'] < dragged_stat_value) {
                closest_lower_index = i;
                break
            }
        }

        //Update Team Compare List
        let current_team_rank = for_stat_group_array[closest_lower_index]['stat_group_rank'] + 1;
        // Use current_team_rank as needed
        populateTeamCompareStatRanks(for_stat_group_array, current_team_rank, num_teams_to_display_above, false, false)

        //Update Team Value and Rank
        d3.select("#team_compare_team_row_text_2").text(dragged_stat_value);
        d3.select("#team_compare_team_row_text_3").text(current_team_rank);

        //Update Time series model input
        d3.select("#model_input_for_stat_group_median_circle")
                .attr('cy', time_series_y_scale(dragged_stat_value));

        d3.select("#model_input_for_stat_group_median_text")
                .text(dragged_stat_value)
                .attr('y', time_series_y_scale(dragged_stat_value) - 10);


        for_model_input_value = dragged_stat_value;
        for_model_input_rank = current_team_rank;


    }

    function against_team_value_dragged(event) {

        let dragged_x = d3.pointer(event)[0] - model_input_padding_dict.left;

        if (dragged_x <= model_input_padding_dict.left) {
            dragged_x = model_input_padding_dict.left;
        }

        if (dragged_x >= dist_panel_width + model_input_padding_dict.left  - 1) {
            dragged_x = dist_panel_width + model_input_padding_dict.left - 1;
        }

        //Update the elements positions
        d3.select("#against_team_value_bg").attr('x', dragged_x - team_value_rect_width / 2);
        d3.select("#against_team_value_circle").attr('cx', dragged_x)
        d3.select("#against_team_value_line").attr('x1', dragged_x).attr('x2', dragged_x);
        
        let dragged_stat_value = formatDecimal1Place(density_x_scale.invert(dragged_x));

        d3.select("#against_team_value_text").attr('x', dragged_x).text(dragged_stat_value);

        //Update Team Compares
        //Find nearest value to determine rank
        let closest_lower_index = 0;

        for (i = 0; i < against_stat_group_array.length; i ++) {

            let team_dict = against_stat_group_array[i];

            if (team_dict['stat_group_median'] < dragged_stat_value) {
                closest_lower_index = i;
                break
            }
        }

        //Update Team Compare List
        let current_team_rank = against_stat_group_array[closest_lower_index]['stat_group_rank'] + 1;
        // Use current_team_rank as needed
        populateTeamCompareStatRanks(against_stat_group_array, current_team_rank, num_teams_to_display_above, false, false)

        //Update Team Value and Rank
        d3.select("#team_compare_team_row_text_2").text(dragged_stat_value);
        d3.select("#team_compare_team_row_text_3").text(current_team_rank);

        //Update Time series model input
        d3.select("#model_input_against_stat_group_median_circle")
                .attr('cy', time_series_y_scale(dragged_stat_value));

        d3.select("#model_input_against_stat_group_median_text")
                .text(dragged_stat_value)
                .attr('y', time_series_y_scale(dragged_stat_value) - 10);

        against_model_input_value = dragged_stat_value;
        against_model_input_rank = current_team_rank;

    }

    //Draw For Team Value
    let for_team_value_g = model_input_svg.append('g')
                                                .attr('id', 'model_input_for_team_value_g')
                                                .style('cursor', 'pointer')
                                                .call(d3.drag()
                                                                .on('start', function(event) {
                                                                    d3.select("#for_team_starting_value_text").style("opacity", 1);
                                                                })
                                                                .on('drag', for_team_value_dragged)
                                                )   

    let team_value_rect_width = 30;

    let for_team_value_bg = for_team_value_g.append('rect')
                                                        .attr('id', 'for_team_value_bg')
                                                        .attr('x', density_x_scale(for_model_input_value) - team_value_rect_width / 2)
                                                        .attr('y',model_input_padding_dict.top)
                                                        .attr('width', team_value_rect_width)
                                                        .attr('height', dist_panel_height)
                                                        .attr('fill', color_dict.transparent);

    let for_team_value_circle =  for_team_value_g.append('circle')
                                                        .attr('id', 'for_team_value_circle')
                                                        .attr('cx', density_x_scale(for_model_input_value))
                                                        .attr("cy", dist_panel_height)
                                                        .attr('r', 4)
                                                        .attr('fill', color_dict.light_blue);

    let for_team_value_line = for_team_value_g.append('line')
                                                        .attr('id', 'for_team_value_line')
                                                        .attr('class', 'dragable_team_value_elements')
                                                        .attr("x1", density_x_scale(for_model_input_value))
                                                        .attr("x2", density_x_scale(for_model_input_value))
                                                        .attr('y1', dist_panel_height)
                                                        .attr('y2', model_input_padding_dict.top)
                                                        .attr('stroke', color_dict.light_blue)
                                                        .attr('stroke-width', '1px');

    let for_team_value_text = for_team_value_g.append('text')
                                                        .text(for_model_input_value)
                                                        .attr('id', 'for_team_value_text')
                                                        .attr('class', 'for_dragable_team_value_elements')
                                                        .attr('x', density_x_scale(for_model_input_value))
                                                        .attr('y', model_input_padding_dict.top - 2)
                                                        .attr("text-anchor", 'middle')
                                                        .attr('dominant-baseline', 'baseline')
                                                        .attr('fill', color_dict.light_blue)
                                                        .attr('font-size', '16px')
                                                        .attr('font-weight', 500);

    //Draw Against Team Value
    let against_team_value_g = model_input_svg.append('g')
                                                .attr('id', 'model_input_against_team_value_g')
                                                .style('cursor', 'pointer')
                                                .attr('display', 'none')
                                                .call(d3.drag()
                                                                .on('start', function(event) {
                                                                    d3.select("#against_team_starting_value_text").style("opacity", 1);
                                                                })
                                                                .on('drag', against_team_value_dragged)
                                                );
                                                            
    let against_team_value_bg = against_team_value_g.append('rect')
                                                        .attr('id', 'against_team_value_bg')
                                                        .attr('class', 'against_dragable_team_value_elements')
                                                        .attr('x', density_x_scale(against_model_input_value) - team_value_rect_width / 2)
                                                        .attr('y',model_input_padding_dict.top)
                                                        .attr('width', team_value_rect_width)
                                                        .attr('height', dist_panel_height)
                                                        .attr('fill', color_dict.transparent);

    let against_team_value_circle =  against_team_value_g.append('circle')
                                                        .attr('id', 'against_team_value_circle')
                                                        .attr('class', 'against_dragable_team_value_elements')
                                                        .attr('cx', density_x_scale(against_model_input_value))
                                                        .attr("cy", dist_panel_height)
                                                        .attr('r', 4)
                                                        .attr('fill', color_dict.red);

    let against_team_value_line = against_team_value_g.append('line')
                                                        .attr('id', 'against_team_value_line')
                                                        .attr('class', 'against_dragable_team_value_elements')
                                                        .attr("x1", density_x_scale(against_model_input_value))
                                                        .attr("x2", density_x_scale(against_model_input_value))
                                                        .attr('y1', dist_panel_height)
                                                        .attr('y2', model_input_padding_dict.top)
                                                        .attr('stroke', color_dict.red)
                                                        .attr('stroke-width', '1px');

    let against_team_value_text = against_team_value_g.append('text')
                                                        .text(against_model_input_value)
                                                        .attr('id', 'against_team_value_text')
                                                        .attr('class', 'against_dragable_team_value_elements')
                                                        .attr('x', density_x_scale(against_model_input_value))
                                                        .attr('y', model_input_padding_dict.top - 2)
                                                        .attr("text-anchor", 'middle')
                                                        .attr('dominant-baseline', 'baseline')
                                                        .attr('fill', color_dict.red)
                                                        .attr('font-size', '16px')
                                                        .attr('font-weight', 500);

                                

    //Draw Comparable teams Panel
    let team_compare_panel_width = model_input_svg_width * (1 - dist_panel_width_ratio) - model_input_padding_dict.right;
    let team_compare_panel_height = dist_panel_height;
    let team_compare_panel_left = dist_panel_width + model_input_padding_dict.left;

    let team_compare_g = model_input_svg.append('g')
                                                        .attr('id', 'team_compare_g')
                                                        .attr('transform', 'translate(' + team_compare_panel_left + ',' + model_input_padding_dict.top + ')');

    let team_compare_col_array = [
        {"display_name": "Team", "id": 1, "base_name": "team_abbrev"},
        {"display_name": "Conf", "id": 2, "base_name": "conf_abbrev"},
        {"display_name": "Stat", "id": 3, "base_name": "team_elo"},
        {"display_name": "Rank", "id": 4, "base_name": "team_rank"},
    ]

    let num_teams_to_display_above = 4;
    let num_teams_to_display = num_teams_to_display_above * 2 + 1;
    let team_index_array = createArrayWithIndices(num_teams_to_display_above);

    let team_compare_col_width = team_compare_panel_width / (team_compare_col_array.length + 1);
    let team_compare_row_height = team_compare_panel_height / (num_teams_to_display + 1);

    let team_compare_bg = team_compare_g.append('rect')
                                                        .attr('id', 'team_compare_bg')
                                                        .attr('x', 0)
                                                        .attr('y', 0)
                                                        .attr('width', team_compare_panel_width)
                                                        .attr('height', team_compare_panel_height)
                                                        .attr('fill', color_dict.dark_bg);

    let team_compare_column_headers_text = team_compare_g.selectAll(".team_compare_column_headers_text")
                                                                                                    .data(team_compare_col_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {return d.display_name})
                                                                                                    .attr('x', function(d, i) {

                                                                                                        return team_compare_col_width * (i + 1);
                                                                                                    })
                                                                                                    .attr('y', 0)
                                                                                                    .attr("text-anchor", 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('fill', color_dict.dark_gray)
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500);

    let team_compare_team_row_g = team_compare_g.append('g')
                                                                                .attr('id', 'team_compare_team_row_g');

    
    let team_compare_team_row_text = team_compare_team_row_g.selectAll(".team_compare_team_row_text")
                                                                                                    .data(team_compare_col_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        if (i === 0) {
                                                                                                            return selected_team_abbrev;
                                                                                                        } else if (i === 1) {
                                                                                                            return selected_conf_abbrev;
                                                                                                        } else if (i == 2) {
                                                                                                            return for_model_input_value;
                                                                                                        } else if (i == 3) {
                                                                                                            return for_model_input_rank;
                                                                                                        } else {
                                                                                                            console.log('Team Text out of range');
                                                                                                            return ''
                                                                                                        };

                                                                                                    })
                                                                                                    .attr('class', 'team_compare_team_row_text')
                                                                                                    .attr('id', function(d, i) {
                                                                                                        return "team_compare_team_row_text_" + i;
                                                                                                    })
                                                                                                    .attr('x', function(d, i) {

                                                                                                        return team_compare_col_width * (i + 1);
                                                                                                    })
                                                                                                    .attr('y', (num_teams_to_display_above + 1) * team_compare_row_height)
                                                                                                    .attr("text-anchor", 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('fill', color_dict.light_blue)
                                                                                                    .attr('font-size', '12px')
                                                                                                    .attr('font-weight', 500);

    let team_compare_above_rows = team_compare_g.selectAll(".team_compare_above_row")
                                                                                                    .data(team_index_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'team_compare_above_row')
                                                                                                    .attr("id", function(d, i) {
                                                                                                       return "team_compare_above_row_" + i
                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        return "translate(0," + (team_compare_row_height * (i + 1)) + ")"

                                                                                                    });

    let team_compare_above_rows_text = team_compare_above_rows.selectAll(".team_compare_above_rows_text")
                                                                                            .data(team_compare_col_array)
                                                                                            .enter()
                                                                                            .append('text')
                                                                                            .text("-")
                                                                                            .attr("class", "team_compare_above_rows_text")
                                                                                            .attr('id', function(d,i) {
                                                                                                return 'team_compare_above_row_text_' + i;
                                                                                            })
                                                                                            .attr('x', function(d, i) {

                                                                                                return team_compare_col_width * (i + 1);
                                                                                            })
                                                                                            .attr('y', 0)
                                                                                            .attr("text-anchor", 'middle')
                                                                                            .attr('dominant-baseline', 'baseline')
                                                                                            .attr('fill', color_dict.dark_gray)
                                                                                            .attr('font-size', '12px')
                                                                                            .attr('font-weight', 500);

let team_compare_below_rows = team_compare_g.selectAll(".team_compare_below_row")
                                                                                            .data(team_index_array)
                                                                                            .enter()
                                                                                            .append('g')
                                                                                            .attr('class', 'team_compare_below_row')
                                                                                            .attr("id", function(d, i) {
                                                                                                return "team_compare_below_row_" + i
                                                                                            })
                                                                                            .attr('transform', function(d, i) {

                                                                                                return "translate(0," + (team_compare_row_height * (i + 2 + num_teams_to_display_above)) + ")"

                                                                                            });

let team_compare_below_rows_text = team_compare_below_rows.selectAll(".team_compare_below_rows_text")
                                                                                    .data(team_compare_col_array)
                                                                                    .enter()
                                                                                    .append('text')
                                                                                    .text("-")
                                                                                    .attr('x', function(d, i) {

                                                                                        return team_compare_col_width * (i + 1);
                                                                                    })
                                                                                    .attr('y', 0)
                                                                                    .attr('class', 'team_compare_below_rows_text')
                                                                                    .attr('id', function(d,i) {
                                                                                        return 'team_compare_below_row_text_' + i;
                                                                                    })
                                                                                    .attr("text-anchor", 'middle')
                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                    .attr('fill', color_dict.dark_gray)
                                                                                    .attr('font-size', '12px')
                                                                                    .attr('font-weight', 500);

    //Create For/Against Toggle
    let for_against_toggle_g = model_input_svg.append('g')
                                                            .attr('id', 'for_against_toggle_g')
                                                            .attr('transform', 'translate(' + 30 + ',' + (model_input_padding_dict.top) + ')')
                                                            .style('cursor', 'pointer')
                                                            .on('click', function() {

                                                                //If currently for, toggle to against
                                                                if (global_vars_dict['model_stat_group_is_for']) {

                                                                    global_vars_dict['model_stat_group_is_for'] = false;

                                                                    d3.select("#for_against_toggle_select_circle")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('cx', for_against_toggle_width - for_against_toggle_height / 2 - 2)
                                                                            .attr('fill', color_dict.red);

                                                                    d3.select("#for_against_toggle_select_text")
                                                                            .transition()
                                                                            .duration(100)
                                                                            .style('opacity', 0)
                                                                            .transition()
                                                                            .duration(10)
                                                                            .text('Against')
                                                                            .transition()
                                                                            .duration(100) 
                                                                            .style('opacity', 1)
                                                                            .attr('fill', color_dict.red);

                                                                        //Toggle Density Plots
                                                                    d3.select("#against_kde_path")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'block');

                                                                    d3.select('#model_input_against_team_value_g')
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'block');

                                                                    d3.select("#for_kde_path")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'none');

                                                                    d3.select('#model_input_for_team_value_g')
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'none');

                                                                    d3.selectAll(".team_compare_team_row_text")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('fill', color_dict.red);

                                                                    d3.select("#team_compare_team_row_text_2")
                                                                            .text(against_model_input_value);

                                                                    d3.select("#team_compare_team_row_text_3")
                                                                            .text(against_model_input_rank);

                                                                    console.log("Against Model Input Rank", against_model_input_rank);

                                                                    populateTeamCompareStatRanks(against_stat_group_array, against_model_input_rank, num_teams_to_display_above, false, false)

                                                                    //Times Series
                                                                    d3.select("#for_time_series_g")
                                                                            .attr('display', 'none');

                                                                    d3.select("#against_time_series_g")
                                                                            .attr('display', 'block');


                                                                } else {

                                                                    global_vars_dict['model_stat_group_is_for'] = true;

                                                                    d3.select("#for_against_toggle_select_circle")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('cx', for_against_toggle_height / 2 + 2)
                                                                            .attr('fill', color_dict.light_blue);

                                                                    d3.select("#for_against_toggle_select_text")
                                                                            .transition()
                                                                            .duration(100)
                                                                            .style('opacity', 0)
                                                                            .transition()
                                                                            .duration(10)
                                                                            .text('For')
                                                                            .transition()
                                                                            .duration(100) 
                                                                            .style('opacity', 1)
                                                                            .attr('fill', color_dict.light_blue);

                                                                    //Toggle Density Plots
                                                                    d3.select("#for_kde_path")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'block');

                                                                    d3.select('#model_input_for_team_value_g')
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'block');

                                                                    d3.select("#against_kde_path")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'none');

                                                                    d3.select('#model_input_against_team_value_g')
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('display', 'none');

                                                                    d3.selectAll(".team_compare_team_row_text")
                                                                            .transition()
                                                                            .duration(200)
                                                                            .attr('fill', color_dict.light_blue);

                                                                    d3.select("#team_compare_team_row_text_2")
                                                                            .text(for_model_input_value);

                                                                    d3.select("#team_compare_team_row_text_3")
                                                                            .text(for_model_input_rank);
                                                                    
                                                                    populateTeamCompareStatRanks(for_stat_group_array, for_model_input_rank, num_teams_to_display_above, false, false);

                                                                     //Times Series
                                                                     d3.select("#against_time_series_g")
                                                                        .attr('display', 'none');

                                                                        d3.select("#for_time_series_g")
                                                                        .attr('display', 'block');
                                                                }
                                                            });

    let for_against_toggle_width = 50;
    let for_against_toggle_height = 20;

    let for_against_toggle_bg = for_against_toggle_g.append('rect')
                                                                            .attr('id', 'for_against_toggle_bg')
                                                                            .attr('x', 0)
                                                                            .attr('y', 0)
                                                                            .attr('width', for_against_toggle_width)
                                                                            .attr('height', for_against_toggle_height)
                                                                            .attr('fill', color_dict.black)
                                                                            //round corners
                                                                            .attr('rx', for_against_toggle_height / 2)
                                                                            .attr('ry', for_against_toggle_height / 2);

    let for_against_toggle_select_circle = for_against_toggle_g.append('circle')
                                                                            .attr('id', 'for_against_toggle_select_circle')
                                                                            .attr('cx', for_against_toggle_height / 2)
                                                                            .attr('cy', for_against_toggle_height / 2)
                                                                            .attr('r', for_against_toggle_height / 2 - 2)
                                                                            .attr('fill', color_dict.light_blue);

    let for_against_toggle_select_text = for_against_toggle_g.append('text')
                                                                            .text('For')
                                                                            .attr('id', 'for_against_toggle_select_text')
                                                                            .attr('x', for_against_toggle_width / 2)
                                                                            .attr('y', for_against_toggle_height + 5)
                                                                            .attr('dominant-baseline', 'hanging')
                                                                            .attr('text-anchor', 'middle')
                                                                            .attr('fill', color_dict.light_blue)
                                                                            .attr('font-size', '13px')
                                                                            .attr('font-weight', 500);

                    

    populateTeamCompareStatRanks(for_stat_group_array, for_model_input_rank, num_teams_to_display_above, false, false);

}

function populateModelInputsELOTimeSeries(json_dict) {

    let stat_value_array = json_dict['stat_value_array'];
    let game_results_array = json_dict['game_results_array'];

    let time_series_svg = d3.select("#model_input_time_series_svg");

    let time_series_svg_width = time_series_svg.node().getBoundingClientRect().width;
    let time_series_svg_height = time_series_svg.node().getBoundingClientRect().height;

    let time_series_padding_dict = {
        left: 70,
        right: 120,
        top: 10,
        bottom: 20,
    };

    let time_series_width = time_series_svg_width - time_series_padding_dict.left - time_series_padding_dict.right;
    let time_series_height = time_series_svg_height - time_series_padding_dict.top - time_series_padding_dict.bottom;

    let time_series_g = time_series_svg.append('g')
                                                            .attr('id', 'model_input_time_series_g')
                                                            .attr('transform', 'translate(' + time_series_padding_dict.left + ',' + time_series_padding_dict.top + ')');

    let time_series_bg = time_series_g.append('rect')
                                                            .attr('x', 0)
                                                            .attr('y', 0)
                                                            .attr('width', time_series_width)
                                                            .attr('height', time_series_height)
                                                            .attr('fill', color_dict.dark_bg);
                                                            // .attr('stroke', color_dict.black)
                                                            // .attr('stroke-width', '1px');
    
    //Plot time series
    let parseDateTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    
    stat_value_array.forEach(function(d,i) {
        stat_value_array[i]['plot_date'] = parseDateTime(d.update_datetime);
    });

    let time_series_x_scale = d3.scaleTime()
                                                            .range([0, time_series_width])
                                                            .domain(d3.extent(stat_value_array, d => d.plot_date));

    let time_series_extent = d3.extent(stat_value_array, d => d.elo_rating);
    let time_series_min_value = parseInt(time_series_extent[0] * .95);
    let time_series_max_value = parseInt(time_series_extent[1] * 1.05);

    time_series_y_scale = d3.scaleLinear()
                                                            .range([0, time_series_height])
                                                            .domain([time_series_max_value, time_series_min_value]);

    let time_series_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.elo_rating))
                                                    .curve(d3.curveMonotoneX);

    let time_series_path = time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_time_series_path')
                                                    .attr('d', time_series_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.orange)
                                                    .attr('stroke-width', '1px')
                                                    .style('opacity', 0.8);

    let time_series_points = time_series_g.selectAll(".model_input_time_series_point")
                                                        .data(stat_value_array)
                                                        .enter()
                                                        .append('circle')
                                                        .attr('class', 'model_input_time_series_point')
                                                        .attr('id', function(d, i) {
                                                            return "model_input_time_series_point_" + i
                                                        })
                                                        .attr('cx', d => time_series_x_scale(d.plot_date))
                                                        .attr('cy', d => time_series_y_scale(d.elo_rating))
                                                        .attr('r', 2)
                                                        .attr('fill', color_dict.orange)
                                                        .attr('stroke', color_dict.orange)
                                                        .attr('stroke-width', '1px')
                                                        .style('opacity', 0.8);
    
    let time_series_x_axis = time_series_g.append('g')
                                                        .attr('transform', 'translate(0,' + time_series_height + ")")
                                                        .attr("id", "time_series_x_axis")
                                                        .call(d3.axisBottom(time_series_x_scale))
                                                       
    time_series_x_axis.selectAll('path')
                                        .attr('display', 'none');                                                   
                                        
    let time_series_y_axis = time_series_g.append('g')
                                                        .call(d3.axisLeft(time_series_y_scale).ticks(5));

    time_series_y_axis.selectAll('path')
                                            .attr('display', 'none');

    //Model Input Value
    //Retrieve Team values
    let stat_group_name = returnCurrentStatGroupName();
    let model_input_value = projections_dict[stat_group_name];

    let model_input_stat_group_median_g = time_series_g.append('g')
                                                                                                    .attr('id', 'model_input_stat_group_median_g')
                                                                                                    .style('cursor', 'pointer');

    let model_input_stat_group_width = 30;
    let model_input_stat_group_height = 20;

    let model_input_stat_group_median_circle = model_input_stat_group_median_g.append('circle')  
                                                                                                    .attr('id', "model_input_stat_group_median_circle")
                                                                                                    .attr('cx', time_series_width + 20)
                                                                                                    .attr('cy', time_series_y_scale(model_input_value))
                                                                                                    .attr('r', 4)
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .attr('stroke', color_dict.orange)
                                                                                                    .attr('stroke-width', '1px')
                                                                                                    .style('opacity', 0.8);

    let model_input_stat_group_median_text = model_input_stat_group_median_g.append('text')
                                                                                                    .text(parseInt(model_input_value))
                                                                                                    .attr('id', "model_input_stat_group_median_text")
                                                                                                    .attr('x', time_series_width + 20)
                                                                                                    .attr('y', time_series_y_scale(model_input_value) - 10)
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .attr("font-size", "14px")
                                                                                                    .attr('font-weight', 500)
                                                                                                    .attr('text-anchor', 'middle');



                                                                                    


}

function populateModelInputsStatsTimeSeries(json_dict) {

    let stat_value_array = json_dict['stat_value_array'];
    let game_results_array = json_dict['game_results_array'];

    console.log("SV", stat_value_array);

    let time_series_svg = d3.select("#model_input_time_series_svg");

    let time_series_svg_width = time_series_svg.node().getBoundingClientRect().width;
    let time_series_svg_height = time_series_svg.node().getBoundingClientRect().height;

    let time_series_padding_dict = {
        left: 70,
        right: 120,
        top: 10,
        bottom: 20,
    };

    let time_series_width = time_series_svg_width - time_series_padding_dict.left - time_series_padding_dict.right;
    let time_series_height = time_series_svg_height - time_series_padding_dict.top - time_series_padding_dict.bottom;

    let time_series_g = time_series_svg.append('g')
                                                            .attr('id', 'model_input_time_series_g')
                                                            .attr('transform', 'translate(' + time_series_padding_dict.left + ',' + time_series_padding_dict.top + ')');

    let time_series_bg = time_series_g.append('rect')
                                                            .attr('x', 0)
                                                            .attr('y', 0)
                                                            .attr('width', time_series_width)
                                                            .attr('height', time_series_height)
                                                            .attr('fill', color_dict.dark_bg);
                                                            // .attr('stroke', color_dict.black)
                                                            // .attr('stroke-width', '1px');
    
    //Plot time series
    let parseDateTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    
    stat_value_array.forEach(function(d,i) {

        stat_value_array[i]['plot_date'] = parseDateTime(d.start_date);
    });

    let time_series_x_scale = d3.scaleTime()
                                                            .range([0, time_series_width])
                                                            .domain(d3.extent(stat_value_array, d => d.plot_date));

    //Calc Extent across all stat fields
    let extent_fields = [
            'team_against_stat_q10', 'team_against_stat_q50', 'team_against_stat_q90',
            'team_for_stat_q10', 'team_for_stat_q50', 'team_for_stat_q90', 
    ];

    //Calc Min/Max for each field
    let extents = extent_fields.map(function(field) {
       return d3.extent(stat_value_array, function(d) {
            return d[field];
       });
    });

    //Calc overall extent
    let overall_extent = [
        d3.min(extents, d => d[0]),
        d3.max(extents, d => d[1]),
    ];

    // overall_extent = [15, 100];

    let time_series_min_value = parseInt(overall_extent[0] * .95);
    let time_series_max_value = parseInt(overall_extent[1] * 1.05);

    time_series_y_scale = d3.scaleLinear()
                                                            .range([0, time_series_height])
                                                            .domain([time_series_max_value, time_series_min_value]);

    //Plot For Time Series Elements
    let for_time_series_g = time_series_g.append('g')
                                                            .attr('id', 'for_time_series_g');

    let for_time_series_median_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_for_stat_q50))
                                                    .curve(d3.curveMonotoneX);

    let for_time_series_median_path = for_time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_for_time_series_median_path')
                                                    .attr('d', for_time_series_median_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.light_blue)
                                                    .attr('stroke-width', '3px')
                                                    .style('opacity', 0.8);

    let for_time_series_upper_bound_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_for_stat_q90))
                                                    .curve(d3.curveMonotoneX);

    let for_time_series_upper_bound_path = for_time_series_g.append('path')
                                                    .data([stat_value_array])       
                                                    .attr('id', 'model_input_for_time_series_upper_bound_path')
                                                    .attr('d', for_time_series_upper_bound_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.light_blue)
                                                    .attr('stroke-width', '1px')
                                                    .style('opacity', 0.8);

    let for_time_series_lower_bound_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_for_stat_q10))
                                                    .curve(d3.curveMonotoneX);

    let for_time_series_lower_bound_path = for_time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_for_time_series_lower_bound_path')
                                                    .attr('d', for_time_series_lower_bound_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.light_blue)
                                                    .attr('stroke-width', '1px')
                                                    .style('opacity', 0.8);

    let for_time_series_points = for_time_series_g.selectAll(".model_input_time_series_point")
                                                        .data(stat_value_array)
                                                        .enter()
                                                        .append('circle')
                                                        .attr('class', 'model_input_time_series_point')
                                                        .attr('id', function(d, i) {
                                                            return "model_input_time_series_point_" + i
                                                        })
                                                        .attr('cx', d => time_series_x_scale(d.plot_date))
                                                        .attr('cy', d => time_series_y_scale(d.team_for_stat_value))
                                                        .attr('r', 2)
                                                        .attr('fill', color_dict.light_blue)
                                                        .attr('stroke', color_dict.light_blue)
                                                        .attr('stroke-width', '1px')
                                                        .style('opacity', 0.8);

    //Plot Against Time series elements
    let against_time_series_g = time_series_g.append('g')
                                                            .attr('id', 'against_time_series_g')
                                                            .attr("display", "none");

    let against_time_series_median_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_against_stat_q50))
                                                    .curve(d3.curveMonotoneX);

    let against_time_series_median_path = against_time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_against_time_series_median_path')
                                                    .attr('d', against_time_series_median_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.red)
                                                    .attr('stroke-width', '3px')
                                                    .style('opacity', 0.8);

    let against_time_series_upper_bound_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_against_stat_q90))
                                                    .curve(d3.curveMonotoneX);

    let against_time_series_upper_bound_path = against_time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_against_time_series_upper_bound_path')
                                                    .attr('d', against_time_series_upper_bound_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.red)
                                                    .attr('stroke-width', '1px')
                                                    .style('opacity', 0.8);

    let against_time_series_lower_bound_line = d3.line()
                                                    .x(d => time_series_x_scale(d.plot_date))
                                                    .y(d => time_series_y_scale(d.team_against_stat_q10))
                                                    .curve(d3.curveMonotoneX);

    let against_time_series_lower_bound_path = against_time_series_g.append('path')
                                                    .data([stat_value_array])
                                                    .attr('id', 'model_input_against_time_series_lower_bound_path')
                                                    .attr('d', against_time_series_lower_bound_line)
                                                    .attr('fill', 'none')
                                                    .attr('stroke', color_dict.red)
                                                    .attr('stroke-width', '1px')
                                                    .style('opacity', 0.8);

    let against_time_series_points = against_time_series_g.selectAll(".model_input_time_series_point")
                                                        .data(stat_value_array)
                                                        .enter()
                                                        .append('circle')
                                                        .attr('class', 'model_input_time_series_point')
                                                        .attr('id', function(d, i) {
                                                            return "model_input_time_series_point_" + i
                                                        }
                                                        )
                                                        .attr('cx', d => time_series_x_scale(d.plot_date))
                                                        .attr('cy', d => time_series_y_scale(d.team_against_stat_value))
                                                        .attr('r', 2)
                                                        .attr('fill', color_dict.red)
                                                        .attr('stroke', color_dict.red)
                                                        .attr('stroke-width', '1px')
                                                        .style('opacity', 0.8);

    
    let time_series_x_axis = time_series_g.append('g')
                                                        .attr('transform', 'translate(0,' + time_series_height + ")")
                                                        .attr("id", "time_series_x_axis")
                                                        .call(d3.axisBottom(time_series_x_scale))
                                                       
    time_series_x_axis.selectAll('path')
                                        .attr('display', 'none');                                                   
                                        
    let time_series_y_axis = time_series_g.append('g')
                                                        .call(d3.axisLeft(time_series_y_scale).ticks(5));

    time_series_y_axis.selectAll('path')
                                            .attr('display', 'none');

    //Model Input Value
    //Retrieve Team values
    let for_stat_group_name = returnCurrentStatGroupName();
    let against_stat_group_name = for_stat_group_name.replace("_for_", "_against_");
    let for_model_input_value = formatDecimal1Place(projections_dict[for_stat_group_name]);
    let against_model_input_value = formatDecimal1Place(projections_dict[against_stat_group_name]);

    let model_input_for_stat_group_median_g = for_time_series_g.append('g')
                                                                                                    .attr('id', 'model_input_for_stat_group_median_g')
                                                                                                    .style('cursor', 'pointer');

    let model_input_stat_group_width = 30;
    let model_input_stat_group_height = 20;

    let model_input_for_stat_group_median_circle = model_input_for_stat_group_median_g.append('circle')  
                                                                                                    .attr('id', "model_input_for_stat_group_median_circle")
                                                                                                    .attr('cx', time_series_width + 20)
                                                                                                    .attr('cy', time_series_y_scale(for_model_input_value))
                                                                                                    .attr('r', 4)
                                                                                                    .attr('fill', color_dict.light_blue)
                                                                                                    .attr('stroke', color_dict.light_blue)
                                                                                                    .attr('stroke-width', '1px')
                                                                                                    .style('opacity', 0.8);

    let model_input_for_stat_group_median_text = model_input_for_stat_group_median_g.append('text')
                                                                                                    .text(formatDecimal1Place(for_model_input_value))
                                                                                                    .attr('id', "model_input_for_stat_group_median_text")
                                                                                                    .attr('x', time_series_width + 20)
                                                                                                    .attr('y', time_series_y_scale(for_model_input_value) - 10)
                                                                                                    .attr('fill', color_dict.light_blue)
                                                                                                    .attr("font-size", "14px")
                                                                                                    .attr('font-weight', 500)
                                                                                                    .attr('text-anchor', 'middle');

    let model_input_against_stat_group_median_g = against_time_series_g.append('g')
                                                                                                    .attr('id', 'model_input_against_stat_group_median_g')
                                                                                                    .style('cursor', 'pointer');
                                                                                                

    let model_input_against_stat_group_median_circle = model_input_against_stat_group_median_g.append('circle')  
                                                                                                    .attr('id', "model_input_against_stat_group_median_circle")
                                                                                                    .attr('cx', time_series_width + 20)
                                                                                                    .attr('cy', time_series_y_scale(against_model_input_value))
                                                                                                    .attr('r', 4)
                                                                                                    .attr('fill', color_dict.red)
                                                                                                    .attr('stroke', color_dict.red)
                                                                                                    .attr('stroke-width', '1px')
                                                                                                    .style('opacity', 0.8);

    let model_input_against_stat_group_median_text = model_input_against_stat_group_median_g.append('text')
                                                                                                    .text(formatDecimal1Place(against_model_input_value))
                                                                                                    .attr('id', "model_input_against_stat_group_median_text")
                                                                                                    .attr('x', time_series_width + 20)
                                                                                                    .attr('y', time_series_y_scale(against_model_input_value) - 10)
                                                                                                    .attr('fill', color_dict.red)
                                                                                                    .attr("font-size", "14px")
                                                                                                    .attr('font-weight', 500)
                                                                                                    .attr('text-anchor', 'middle');



                                                                                    


}

function populateModelInputsGameResults(json_dict) {

    let stat_value_array = json_dict['stat_value_array'];
    let game_results_array = json_dict['game_results_array'];

    let game_results_div = d3.select("#model_input_game_results_div");

    let game_results_table = game_results_div.append('table')
                                                                        .attr('id', 'model_inputs_game_results_table');

    let game_results_col_array = [
                                                                {"display_name": "Date", "id": 1, "base_name": "start_date", 'col_width': 80},
                                                                {'display_name': "Rank", "id": 2, "base_name": "away_team_rank", 'col_width': 60},
                                                                {"display_name": "Away", "id": 3, "base_name": "away_team_abbrev", 'col_width': 140},
                                                                {"display_name": "Score", "id": 4, "base_name": "away_team_score", 'col_width': 100},
                                                                {"display_name": "", "id": 0, "base_name": "placeholder", 'col_width': 80},
                                                                {"display_name": "Score", "id": 5, "base_name": "home_team_score", 'col_width': 100},
                                                                {"display_name": "Home", "id": 6, "base_name": "home_team_abbrev", 'col_width': 140},
                                                                {"display_name": "Rank", "id": 7, "base_name": "home_team_rank", 'col_width': 60}
                                                            ];

    let game_results_table_header = game_results_table.append('thead')
                                                                            .attr('id', 'model_inputs_game_results_thead')
                                                                            .selectAll(".model_inputs_game_results_th")
                                                                            .data(game_results_col_array)
                                                                            .enter()
                                                                            .append('th')
                                                                            .text(d => d.display_name)
                                                                            .attr('class', 'model_inputs_game_results_th');

    let game_results_table_body = game_results_table.append('tbody')
                                                                            .attr('id', 'model_inputs_game_results_tbody');

    let game_results_table_rows = game_results_table_body.selectAll(".model_inputs_game_results_row")
                                                                            .data(game_results_array)
                                                                            .enter()
                                                                            .append('tr')
                                                                            .attr('class', 'model_inputs_game_results_row');
                                                                           

    let game_results_table_cells = game_results_table_rows.each(function(d) {

        let row = d3.select(this);

        //Append Cells
        //Date
        row.append('td')
                    .text(function(d) {

                        let date_str = d.start_date.split(" ")[0];
                        let date_array = date_str.split("-");
                        let month = parseInt(date_array[1]);
                        let day = parseInt(date_array[2]);
                        let year = parseInt(date_array[0]);

                        return  month + "/" + day + "/" + year;

                    })
                    .attr('class', 'model_inputs_game_results_cell')
                    .style('min-width', game_results_col_array[0].col_width + "px");

        //Away Team Rank
        row.append('td')
                .text(d.away_team_rank)
                .attr('class', 'model_inputs_game_results_cell')
                .style('min-width', game_results_col_array[1].col_width + "px")

        //Away Team
        row.append('td')
                .text(d.away_team_short_name)
                .attr('class', 'model_inputs_game_results_cell')
                .style('min-width', game_results_col_array[2].col_width + "px");

        //Away Score
        row.append('td')
            .text(d.away_team_score)
            .attr('class', 'model_inputs_game_results_cell')
            .style('min-width', game_results_col_array[3].col_width + "px");

        //AT Text
        row.append('td')
            .text("@")
            .attr('class', 'model_inputs_game_results_cell')
            .style('min-width', game_results_col_array[4].col_width + "px")

        //homeTeam
        row.append('td')
                .text(d.home_team_score)
                .attr('class', 'model_inputs_game_results_cell')
                .style('min-width', game_results_col_array[5].col_width + "px");


        //home Score
        row.append('td')
            .text(d.home_team_short_name)
            .attr('class', 'model_inputs_game_results_cell')
            .style('min-width', game_results_col_array[6].col_width + "px");

        //Home Team Rank
        row.append('td')
            .text(d.home_team_rank)
            .attr('class', 'model_inputs_game_results_cell')
            .style('min-width', game_results_col_array[7].col_width + "px")

    })
    



                                                                        
                                                                        

}

function closeModal() {

    //Display Modal and Overlay
    d3.select("#modal_overlay").style('display', 'none');
    d3.select("#modal_div").style('display', 'none')
                                                                    .selectAll("*")
                                                                    .remove();
}

function launchTeamRosterModal(is_home) {

    console.log("Launch Team Roster Modal, is_home ->", is_home);

    //Display Modal and Overlay
    d3.select("#modal_overlay").style('display', 'block');
    d3.select("#modal_div").style('display', 'block');

    let modal_div = d3.select("#modal_div");

    let team_roster_header_div = modal_div.append('div')
                                                                    .attr('id', 'team_roster_header_div');

    let team_roster_close_div = team_roster_header_div.append('div')
                                                                    .attr('id', 'modal_close_div')
                                                                    .on("click", function() {

                                                                        closeModal();

                                                                    });

    let team_roster_header_close_x = team_roster_close_div.append('text')
                                                                                                                    .text('x')
                                                                                                                    .attr('id', 'modal_div_close_x');

    let team_abbrev = is_home ? "home": "away";

    let team_logo_url = team_abbrev + "_team_logo_url";
    let team_roster_logo_image = team_roster_header_div.append('img')
                                                                        .attr('src', matchup_info_dict[team_logo_url])
                                                                        .attr('alt', 'Team Logo')
                                                                        .attr('id', 'modal_team_logo_image');

    let team_name = team_abbrev + "_team_short_name";
    let team_roster_team_header = team_roster_header_div.append('h2')
                                                                        .text(matchup_info_dict[team_name])
                                                                        .attr('id', 'modal_team_header');

    //Create Roster Table Div
    let team_roster_table_div = modal_div.append('div')
                                                                        .attr('id', 'team_roster_table_div');

    //Create Plot SVG
    let roster_plot_svg = modal_div.append('div')
                                                                    .attr('id', 'roster_plot_div')
                                                                    .style('position', 'relative')
                                                                    .append('svg')
                                                                    .attr('id', 'roster_plot_svg')
                                                                    .attr('width', '100%')
                                                                    .attr('height', '400px');

}

function launchModelInputModal(model_input_id, model_input_stat_group, is_home) {

    console.log("Model Input ID ->", model_input_id, "Stat Group ->", model_input_stat_group);

    //Display Modal and Overlay
    d3.select("#modal_overlay").style('display', 'block');
    d3.select("#modal_div").style('display', 'block');

    let modal_div = d3.select("#modal_div");

    let model_input_header_div = modal_div.append('div')
                                                                    .attr('id', 'model_input_header_div');

    let model_input_close_div = model_input_header_div.append('div')
                                                                    .attr('id', 'modal_close_div')
                                                                    .on("click", function() {

                                                                        closeModal();

                                                                    });

    let model_input_header_close_x = model_input_close_div.append('text')
                                                                                                                    .text('x')
                                                                                                                    .attr('id', 'modal_div_close_x');
                                                                   
    let team_abbrev = is_home ? "home": "away";
                    
    let team_logo_url = team_abbrev + "_team_logo_url";
    let model_input_logo_image = modal_div.append('img')
                                                                        .attr('src', matchup_info_dict[team_logo_url])
                                                                        .attr('alt', 'Team Logo')
                                                                        .attr('id', 'modal_team_logo_image');

    let team_name = team_abbrev + "_team_short_name";
    let model_input_team_header = modal_div.append('h2')
                                                                        .text(matchup_info_dict[team_name])
                                                                        .attr('id', 'modal_team_header');

    //Create update model input button
    let model_input_update_model_button = modal_div.append('button')
                                                                        .text("Update Models")
                                                                        .attr('id', 'model_input_update_model_button')
                                                                        .style("border-radius", "20px")
                                                                        .on('click', function() {
                                                                            updateModelInputsAndSendRequest()
                                                                        });

    //Stat Name Header
    let stat_col_dict = projection_col_array.find(d => d.stat_group === model_input_stat_group);
    
    let model_input_stat_group_header = modal_div.append('h3')
                                                                        .text(stat_col_dict.display_name)
                                                                        .attr('id', 'model_input_stat_group_header');
                                                                        
    
    let projection_key_name = model_input_id === 0 ? team_abbrev + "_starting_elo" : team_abbrev + "_for_" + model_input_stat_group + "_q50";
    let model_input_value = projections_dict[projection_key_name];
    
    //Distribution SVG
    let model_input_svg = modal_div.append('div')
                                                                        .attr('id', 'model_input_slider_div')
                                                                        .style('position', 'relative')
                                                                        .append('svg')
                                                                        .attr('id', 'model_input_distribution_svg')
                                                                        .attr('width', '100%')
                                                                        .attr('height', '200px');
                                               
    //Time Series SVG
    let time_series_svg = modal_div.append('div')
                                                                      .attr('id', 'model_input_time_series_div')
                                                                      .style('position', 'relative')
                                                                      .append('svg')
                                                                      .attr('id', 'model_input_time_series_svg')
                                                                      .attr('width', '100%')
                                                                      .attr('height', '200px');

    //Game Results SVG
    let game_results_div = modal_div.append('div')
                                                                    .attr("id", "model_input_game_results_div")
                                                                    .style('position', 'relative');
                                                                    
    
}

function updateModelProjections(modal_stat_name, for_model_input_value, against_model_input_value) {

    //Select Projections
    let modal_stat_id = global_vars_dict['modal_stat_id'];

    let away_home = global_vars_dict['model_stat_group_is_home'] ? 'home' : 'away';
    let projection_row_id = "projection_row_" + away_home + "_g_" + modal_stat_id;

    console.log(projection_row_id);

    let projection_row = d3.select("#" + projection_row_id);

    //Update Projections
    if (modal_stat_id === 0) {

        let for_circle_x = global_vars_dict[away_home + "_projection_scales"][modal_stat_id](for_model_input_value);

        projection_row.select("." + away_home + "_for_median_circle")
                                .attr('cx', for_circle_x);

        projection_row.select("." + away_home + "_for_median_text")
                                .attr('x', for_circle_x)
                                .text(for_model_input_value);

    } else {
        
        let for_circle_x = global_vars_dict[away_home + "_projection_scales"][modal_stat_id](for_model_input_value);
        let against_circle_x = global_vars_dict[away_home + "_projection_scales"][modal_stat_id](against_model_input_value);

        console.log("For Circle X ->", for_circle_x, "Against Circle X ->", against_circle_x);

        projection_row.select("." + away_home + "_for_median_circle")
                                .attr('cx', for_circle_x);

        projection_row.select("." + away_home + "_against_median_circle")
                                .attr('cx', against_circle_x);

        projection_row.select("." + away_home + "_for_median_text")
                                .attr('x', for_circle_x)
                                .text(for_model_input_value);

        projection_row.select("." + away_home + "_against_median_text")
                                .attr('x', against_circle_x)
                                .text(against_model_input_value);

    };                

}

function populateTeamProjections(json_dict) {

    let projections_dict = json_dict['projections']

    let projection_col_array = [
        {'display_name': "Elo Rating", "stat_id": 0, "stat_group": "elo_rating"},
        {'display_name': "Points",  "stat_id": 1, 'stat_group': 'points'},
        {'display_name': "FG Made",  "stat_id": 2, 'stat_group': 'fg_made'},
        {'display_name': "FG Att",  "stat_id": 3, 'stat_group': 'fg_att'},
        {'display_name': "3pt Made",  "stat_id": 4, 'stat_group': 'three_pt_made'},
        {'display_name': "3pt Att",  "stat_id": 5, 'stat_group': 'three_pt_att'},
        {'display_name': "FT Made",  "stat_id": 6, 'stat_group': 'ft_made'},
        {'display_name': "FT Att", "stat_id": 7, 'stat_group': 'ft_att'},
        {'display_name': "Total Rebs",  "stat_id": 8, 'stat_group': 'total_rebs'},
        {'display_name': "Off Rebs",  "stat_id": 9, 'stat_group': 'off_rebs'},
        {'display_name': "Assists",  "stat_id": 10, 'stat_group': 'assists'},
        {'display_name': "Turnovers",  "stat_id": 11, 'stat_group': 'turnovers'},
        {'display_name': "Steals",  "stat_id": 12, 'stat_group': 'steals'},
        {'display_name': "Blocks",  "stat_id": 13, 'stat_group': 'blocks'},
        {'display_name': "Fouls", "stat_id": 14, 'stat_group': 'personal_fouls'}
    ]

    let num_projection_rows = projection_col_array.length;

    let matchup_projections_div = d3.select("#matchup_projections_div");
    let projection_div_width = matchup_projections_div.node().getBoundingClientRect().width
    let projection_div_height = matchup_projections_div.node().getBoundingClientRect().height
    let projection_padding_top = 22;
    let projection_row_height = (projection_div_height - projection_padding_top) / num_projection_rows;

    let matchup_projections_svg = matchup_projections_div.append('svg')
                                                                                                    .attr('id', 'matchup_projections_svg')
                                                                                                    .attr('width', projection_div_width)
                                                                                                    .attr("height", projection_div_height);

    let projections_title_text = matchup_projections_svg.append('text')
                                                                                                    .text("Model Inputs")
                                                                                                    .attr('x', projection_div_width / 2)
                                                                                                    .attr('y', 1)
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-size', '16px')
                                                                                                    .style('font-family', 'Work Sans')
                                                                                                    .style('font-weight', 500);
                                    
    let projection_legend_g = matchup_projections_svg.append('g')
                                                                                                    .attr('transform', 'translate(20, 3)');

    let legend_for_x = 15;
    let legend_against_x = 100;

    let projection_legend_for_text = projection_legend_g.append('text')
                                                                                                    .text("For")
                                                                                                    .attr('x', legend_for_x - 3)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-size', '14px')
                                                                                                    .style('font-family', 'Work Sans')
                                                                                                    .style('font-weight', 500);

    let projection_legend_for_rect = projection_legend_g.append('rect')
                                                                                                    .attr('x', legend_for_x + 3)
                                                                                                    .attr('y', 3)
                                                                                                    .attr('width', 14)
                                                                                                    .attr('height', 6)
                                                                                                    .attr('fill', color_dict.light_blue);

    let projection_legend_against_text = projection_legend_g.append('text')
                                                                                                    .text("Against")
                                                                                                    .attr('x', legend_against_x - 3)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-size', '14px')
                                                                                                    .style('font-family', 'Work Sans')
                                                                                                    .style('font-weight', 500);

    let projection_legend_against_rect = projection_legend_g.append('rect')
                                                                                                    .attr('x', legend_against_x + 3)
                                                                                                    .attr('y', 3)
                                                                                                    .attr('width', 14)
                                                                                                    .attr('height', 6)
                                                                                                    .attr('fill', color_dict.red);
                                                                                                    

    let projection_rows_g = matchup_projections_svg.selectAll(".projection_rows_g")
                                                                                                    .data(projection_col_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'projection_rows_g')
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return 'projection_row_g_' + i

                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        let projection_row_y = i * projection_row_height + projection_padding_top;
                                                                                                        
                                                                                                        return 'translate(0, ' + projection_row_y + ')'

                                                                                                    });
                                                                                                   
                                                                                                 
    let projection_row_name_text = projection_rows_g.append('text')
                                                                                                    .text(function(d) {return d.display_name})
                                                                                                    .attr('x', projection_div_width / 2)
                                                                                                    .attr('y', projection_row_height / 2)
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('font-size', "14px")
                                                                                                    .style('font-weight', 500)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-family', 'Work Sans');
    
    let projection_padding_dict = {
        away_left: 50,
        away_right: 80,
        home_left: 80,
        home_right: 50,
    }


    let projection_row_away_g = projection_rows_g.append('g')
                                                                                                        .attr('id',  function(d,i) {
                                                                                                            return 'projection_row_away_g_' + i
                                                                                                        })
                                                                                                        .style('cursor', 'pointer')
                                                                                                        .on('click', function(event, d) {

                                                                                                            console.log("Clicked D->", d);

                                                                                                            let away_team_seo_name = matchup_info_dict['away_team_seo_name'];
                                                                                                            let game_start_date = matchup_info_dict['start_date'];

                                                                                                            global_vars_dict['modal_stat_id'] = d.stat_id;
                                                                                                            global_vars_dict['model_stat_group_is_home'] = false;

                                                                                                            sendModelInputRequest(d.stat_id, away_team_seo_name, game_start_date);
                                                                                                            launchModelInputModal(d.stat_id,d.stat_group, false);

                                                                                                        })
                                                                                                        .on('mouseover', function() {

                                                                                                            let rect = d3.select(this).select("#projection_row_away_highlight_rect");
                                                                                                            rect.style('display', 'block');
                                                                                                            
                                                                                                        })
                                                                                                        .on('mouseout', function() {

                                                                                                            let rect = d3.select(this).select("#projection_row_away_highlight_rect");

                                                                                                            rect.style('display', 'none');

                                                                                                        });

    let projection_row_away_bg = projection_row_away_g.append('rect')
                                                                                                        .attr('id', function(d, i) {
                                                                                                            return 'projection_row_away_bg_' + i
                                                                                                        })
                                                                                                        .attr('x', projection_padding_dict.away_left)
                                                                                                        .attr('y', 0)
                                                                                                        .attr('width',  projection_div_width / 2 - projection_padding_dict.away_right - projection_padding_dict.away_left)
                                                                                                        .attr('height', projection_row_height)
                                                                                                        .attr('fill', color_dict.dark_bg)
                                                                                                        // .attr('stroke', color_dict.med_gray)
                                                                                                        // .attr('stroke-width', '1px')
                                                                                                        .attr('shape-rendering', "CrispEdges")
                                                                                                        .style('box-sizing', 'border-box');

    let projection_row_home_g = projection_rows_g.append('g')
                                                                                                        .attr('id',  function(d,i) {
                                                                                                            return 'projection_row_home_g_' + i
                                                                                                        })
                                                                                                        .style('cursor', 'pointer')
                                                                                                        .on('click', function(event, d) {

                                                                                                            console.log("Clicked D->", d);

                                                                                                            let home_team_seo_name = matchup_info_dict['home_team_seo_name'];
                                                                                                            let game_start_date = matchup_info_dict['start_date'];

                                                                                                            global_vars_dict['modal_stat_id'] = d.stat_id;
                                                                                                            global_vars_dict['model_stat_group_is_home'] = true;

                                                                                                            sendModelInputRequest(d.stat_id, home_team_seo_name, game_start_date);
                                                                                                            launchModelInputModal(d.stat_id,d.stat_group, true);

                                                                                                        })
                                                                                                        .on('mouseover', function() {

                                                                                                            let rect = d3.select(this).select("#projection_row_home_highlight_rect");

                                                                                                            rect.style('display', 'block');

                                                                                                        })
                                                                                                        .on('mouseout', function() {

                                                                                                            let rect = d3.select(this).select("#projection_row_home_highlight_rect");

                                                                                                            rect.style('display', 'none');

                                                                                                        });

    let projection_row_home_bg = projection_row_home_g.append('rect')
                                                                                                        .attr('id', function(d, i) {
                                                                                                            return 'projection_row_home_bg_' + i
                                                                                                        })
                                                                                                        .attr('x', projection_div_width / 2 + projection_padding_dict.home_left)
                                                                                                        .attr('y', 0)
                                                                                                        .attr('width',  projection_div_width / 2 - projection_padding_dict.home_left - projection_padding_dict.home_right)
                                                                                                        .attr('height', projection_row_height)
                                                                                                        .attr('fill', color_dict.dark_bg)
                                                                                                        // .attr('stroke', color_dict.med_gray)
                                                                                                        // .attr('stroke-width', '1px')
                                                                                                        .attr('shape-rendering', "CrispEdges")
                                                                                                        .style('box-sizing', 'border-box');

    //Plot projection lines
    let projection_row_away_projection_line = projection_row_away_g.append('line')
                                                                                                    .attr('class', 'away_projection_lines')
                                                                                                    .attr('x1', projection_padding_dict.away_left)
                                                                                                    .attr('x2', projection_div_width / 2 - projection_padding_dict.away_right)
                                                                                                    .attr('y1', projection_row_height / 2)
                                                                                                    .attr('y2', projection_row_height / 2)
                                                                                                    .attr('stroke', '#000')
                                                                                                    .attr('stroke-width', '1px')
                                                                                                    .style('shape-rendering', 'CrispEdges');

    let projection_row_home_projection_line = projection_row_home_g.append('line')
                                                                                                    .attr('class', 'home_projection_lines')
                                                                                                    .attr('x1', projection_div_width / 2 + projection_padding_dict.home_left)
                                                                                                    .attr('x2', projection_div_width - projection_padding_dict.home_right)
                                                                                                    .attr('y1', projection_row_height / 2)
                                                                                                    .attr('y2', projection_row_height / 2)
                                                                                                    .attr('stroke', '#000')
                                                                                                    .attr('stroke-width', '1px')
                                                                                                    .style('shape-rendering', 'CrispEdges');

    //Draw Hover Highlight Rects
    let projection_highlight_rect_width = 6;

    let projection_row_away_highlight_rect = projection_row_away_g.append('rect')
                                                                                                    .attr('id', 'projection_row_away_highlight_rect')
                                                                                                    .attr('x', 0)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('width', projection_highlight_rect_width)
                                                                                                    .attr('height', projection_row_height)
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .style('display', 'none');

    let projection_row_home_highlight_rect = projection_row_home_g.append('rect')
                                                                                                    .attr('id', 'projection_row_home_highlight_rect')
                                                                                                    .attr('x', projection_div_width - projection_highlight_rect_width)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('width', projection_highlight_rect_width)
                                                                                                    .attr('height', projection_row_height)
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .style('display', 'none');
                                                                                                    

    //*******Away Projection Plots************* */
    let away_projection_scales = projection_col_array.map((d) => d3.scaleLinear()
                                                                                                                        .domain([
                                                                                                                            projection_range_dict[d.stat_group].min_value,
                                                                                                                            projection_range_dict[d.stat_group].max_value
                                                                                                                        ])
                                                                                                                        .range([
                                                                                                                            projection_padding_dict.away_left,
                                                                                                                            projection_div_width / 2 - projection_padding_dict.away_right
                                                                                                                        ])
                                                                                                                    );

    //Push Scales to Global Vars
    global_vars_dict['away_projection_scales'] = away_projection_scales;

    let away_projection_for_median_value_circle = projection_row_away_g.append('circle')
                                                                                                        .attr('cx', function(d, i) {

                                                                                                            let stat_name = '';

                                                                                                            if (d.stat_id === 0) {

                                                                                                                stat_name = "away_starting_elo";

                                                                                                            } else {
                                                                                                                stat_name = "away_for_" + d.stat_group + "_q50";

                                                                                                            }

                                                                                                            let stat_value = projections_dict[stat_name];
                                                                                                            
                                                                                                            return away_projection_scales[i](stat_value)

                                                                                                        })
                                                                                                        .attr('class', 'away_for_median_circle')
                                                                                                        .attr('cy', ((projection_row_height / 2)))
                                                                                                        .attr('r', 3)
                                                                                                        .attr('fill', color_dict.light_blue);

    let away_projection_for_median_value_text = projection_row_away_g.append('text')
                                                                                                        .text(function(d, i) {

                                                                                                            let stat_name = '';

                                                                                                            if (d.stat_id === 0) {

                                                                                                                stat_name = "away_starting_elo";

                                                                                                                let stat_value = projections_dict[stat_name];

                                                                                                                return parseInt(stat_value)

                                                                                                            } else {
                                                                                                                stat_name = "away_for_" + d.stat_group + "_q50";

                                                                                                                let stat_value = projections_dict[stat_name];

                                                                                                                return formatDecimal1Place(stat_value)

                                                                                                            }

                                                                                                            
                                                                                                        })
                                                                                                        .attr('class', 'away_for_median_text')
                                                                                                        .attr('x', function(d, i) {

                                                                                                            let stat_name = '';

                                                                                                            if (d.stat_id === 0) {

                                                                                                                stat_name = "away_starting_elo";

                                                                                                            } else {
                                                                                                                stat_name = "away_for_" + d.stat_group + "_q50";

                                                                                                            }

                                                                                                            let stat_value = projections_dict[stat_name];
                                                                                                            
                                                                                                            return away_projection_scales[i](stat_value)

                                                                                                        })
                                                                                                        .attr('y', ((projection_row_height / 2) - 4) / 2 + 2)
                                                                                                        .attr('fill', color_dict.light_blue)
                                                                                                        .attr('text-anchor', 'middle')
                                                                                                        .attr('dominant-baseline', 'baseline')
                                                                                                        .attr('font-size', '14px')
                                                                                                        .attr('font-weight', 500)
                                                                                                        .attr('font-family', 'Work Sans');
                                                                                                    
    

    let away_projection_against_median_circle = projection_row_away_g.append('circle')
                                                                                                        .attr('cx', function(d, i) {

                                                                                                            if (d.stat_id !== 0) {
                                                                                                                let stat_name = "away_against_" + d.stat_group + "_q50";
                                                                                                                let stat_value = projections_dict[stat_name];
                                                                                                                
                                                                                                                return away_projection_scales[i](stat_value)
                                                                                                            }
                                                                                                        })
                                                                                                        .attr('class', 'away_against_median_circle')
                                                                                                        .attr('cy', (projection_row_height / 2))
                                                                                                        .style('display', function(d) {
                                                                                                            if (d.stat_id === 0) {
                                                                                                                return "none"
                                                                                                            }
                                                                                                        })
                                                                                                        .attr('r', 3)
                                                                                                        .attr('fill', color_dict.red);

    let away_projection_against_median_value_text = projection_row_away_g.append('text')
                                                                                                        .text(function(d, i) {

                                                                                                            if (d.stat_id !== 0) {
                                                                                                                let stat_name = "away_against_" + d.stat_group + "_q50";
                                                                                                                let stat_value = projections_dict[stat_name];

                                                                                                                return formatDecimal1Place(stat_value)
                                                                                                            }
                                                                                                        })
                                                                                                        .attr('x', function(d, i) {

                                                                                                            if (d.stat_id !== 0) {
                                                                                                                let stat_name = "away_against_" + d.stat_group + "_q50";
                                                                                                                let stat_value = projections_dict[stat_name];
                                                                                                                
                                                                                                                return away_projection_scales[i](stat_value)
                                                                                                            }
                                                                                                        })
                                                                                                        .attr('y', ((projection_row_height / 2) + 4))
                                                                                                        .attr('class', 'away_against_median_text')
                                                                                                        .attr('fill', color_dict.red)
                                                                                                        .attr('text-anchor', 'middle')
                                                                                                        .attr('dominant-baseline', 'hanging')
                                                                                                        .attr('font-size', '14px')
                                                                                                        .attr('font-weight', 500)
                                                                                                        .attr('font-family', 'Work Sans');

    

    //****HOME PROJECTIONS***** */
    let home_projection_scales = projection_col_array.map((d) => d3.scaleLinear()
                                                                                                        .domain([
                                                                                                            projection_range_dict[d.stat_group].min_value,
                                                                                                            projection_range_dict[d.stat_group].max_value
                                                                                                        ])
                                                                                                        .range([
                                                                                                            projection_div_width / 2 + projection_padding_dict.home_left,
                                                                                                            projection_div_width - projection_padding_dict.home_right
                                                                                                        ])
                                                                                                    );

    //Push Scales to Global Vars
    global_vars_dict['home_projection_scales'] = home_projection_scales;

    let home_projection_for_median_value_circle = projection_row_home_g.append('circle')
                                                                                                    .attr('cx', function(d, i) {

                                                                                                        let stat_name = '';

                                                                                                        if (d.stat_id === 0) {

                                                                                                            stat_name = "home_starting_elo";

                                                                                                        } else {
                                                                                                            stat_name = "home_for_" + d.stat_group + "_q50";

                                                                                                        }

                                                                                                        let stat_value = projections_dict[stat_name];
                                                                                                        
                                                                                                        return home_projection_scales[i](stat_value)

                                                                                                    })
                                                                                                    .attr('cy', ((projection_row_height / 2)))
                                                                                                    .attr('class', 'home_for_median_circle')
                                                                                                    .attr('r', 3)
                                                                                                    .attr('fill', color_dict.light_blue);

let home_projection_for_median_value_text = projection_row_home_g.append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        let stat_name = '';

                                                                                                        if (d.stat_id === 0) {

                                                                                                            stat_name = "home_starting_elo";

                                                                                                            let stat_value = projections_dict[stat_name];

                                                                                                            return parseInt(stat_value)

                                                                                                        } else {
                                                                                                            stat_name = "home_for_" + d.stat_group + "_q50";

                                                                                                            let stat_value = projections_dict[stat_name];

                                                                                                            return formatDecimal1Place(stat_value)

                                                                                                        }
                                                                                                    })
                                                                                                    .attr('x', function(d, i) {

                                                                                                        let stat_name = '';

                                                                                                        if (d.stat_id === 0) {

                                                                                                            stat_name = "home_starting_elo";

                                                                                                        } else {
                                                                                                            stat_name = "home_for_" + d.stat_group + "_q50";

                                                                                                        }

                                                                                                        let stat_value = projections_dict[stat_name];
                                                                                                        
                                                                                                        return home_projection_scales[i](stat_value)

                                                                                                    })
                                                                                                    .attr('y', ((projection_row_height / 2) - 4) / 2 + 2)
                                                                                                    .attr('class', 'home_for_median_text')
                                                                                                    .attr('fill', color_dict.light_blue)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .attr('font-family', 'Work Sans');
                                                                                                


let home_projection_against_median_circle = projection_row_home_g.append('circle')
                                                                                                    .attr('cx', function(d, i) {

                                                                                                        if (d.stat_id !== 0) {
                                                                                                            let stat_name = "home_against_" + d.stat_group + "_q50";
                                                                                                            let stat_value = projections_dict[stat_name];
                                                                                                            
                                                                                                            return home_projection_scales[i](stat_value)
                                                                                                        }
                                                                                                    })
                                                                                                    .style('display', function(d) {
                                                                                                        if (d.stat_id === 0) {
                                                                                                            return "none"
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('class', 'home_against_median_circle')
                                                                                                    .attr('cy', (projection_row_height / 2))
                                                                                                    .attr('r', 3)
                                                                                                    .attr('fill', color_dict.red);

let home_projection_against_median_value_text = projection_row_home_g.append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        if (d.stat_id !== 0) {
                                                                                                            let stat_name = "home_against_" + d.stat_group + "_q50";
                                                                                                            let stat_value = projections_dict[stat_name];

                                                                                                            return formatDecimal1Place(stat_value)
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('class', 'home_against_median_text')
                                                                                                    .attr('x', function(d, i) {

                                                                                                        if (d.stat_id !== 0) {
                                                                                                            let stat_name = "home_against_" + d.stat_group + "_q50";
                                                                                                            let stat_value = projections_dict[stat_name];
                                                                                                            
                                                                                                            return home_projection_scales[i](stat_value)
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('y', ((projection_row_height / 2) + 4))
                                                                                                    .attr('fill', color_dict.red)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .attr('font-family', 'Work Sans');

}

function populateModelDetails(json_dict) {

    console.log(json_dict);

    let matchup_predictions_svg = d3.select("#matchup_predictions_svg");

    let matchup_predictions_width = matchup_predictions_svg.node().getBoundingClientRect().width;
    let matchup_predictions_height = matchup_predictions_svg.node().getBoundingClientRect().height;

    //Plot Version and Metrics
    let model_version_top_padding = 60;
    let model_details_text_padding = 40;

    let model_details_version_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'model_details_version_g')
                                                                                                    .attr('transform', 'translate(' + (matchup_predictions_width / 2) + ', ' + model_version_top_padding + ')');
                                                                                                
    let model_details_version_title_text = model_details_version_g.append('text')
                                                                                                    .text("version")
                                                                                                    .attr('x', 0)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let model_details_away_version_text = model_details_version_g.append('text')
                                                                                                    .text(json_dict['away_model_info']['model_version'])
                                                                                                    .attr('x', -model_details_text_padding)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let model_details_home_version_text = model_details_version_g.append('text')
                                                                                                    .text(json_dict['home_model_info']['model_version'])
                                                                                                    .attr('x', model_details_text_padding)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let regression_metrics_array = [
        {"display_name": "R2", "metric_id": 1, "base_name": "r2_score"},
        {"display_name": "MAE", "metric_id": 2, "base_name": "mean_absolute_error"},
        {"display_name": "MSE", "metric_id": 3, "base_name": "mean_squared_error"},
        {"display_name": "RMSE", "metric_id": 4, "base_name": "root_mean_squared_error"},
    ];

    let classification_metrics_array = [
        {"display_name": "Accuracy", "metric_id": 5, "base_name": "accuracy"},
        {"display_name": "Precision", "metric_id": 6, "base_name": "precision"},
        {"display_name": "Recall", "metric_id": 7, "base_name": "recall"},
        {"display_name": "F1", "metric_id": 8, "base_name": "f1_score"},
    ];

    let model_metrics_top_padding = 30;
    let model_metrics_row_height = 20;

    if (json_dict['away_model_info']['model_type'] === "regression") {

        let model_metrics_title_text = model_details_version_g.selectAll(".model_metrics_title_text")
                                                                                                    .data(regression_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(d => d.display_name)
                                                                                                    .attr('x', 0)
                                                                                                    .attr('y', function(d, i) {

                                                                                                        return model_metrics_top_padding + (i * model_metrics_row_height);

                                                                                                    })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

        let model_details_away_metric_text = model_details_version_g.selectAll(".model_details_away_metric_text")
                                                                                                    .data(regression_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {

                                                                                                        return formatDecimal3Places(json_dict['away_model_info']['model_metrics'][d.base_name]);

                                                                                                    })
                                                                                                    .attr('x', -model_details_text_padding)
                                                                                                    .attr('y', function(d, i) {

                                                                                                        return model_metrics_top_padding + (i * model_metrics_row_height);

                                                                                                    })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

        let model_details_home_metric_text = model_details_version_g.selectAll(".model_details_home_metric_text")
                                                                                                    .data(regression_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {

                                                                                                        return formatDecimal3Places(json_dict['home_model_info']['model_metrics'][d.base_name]);

                                                                                                    })
                                                                                                    .attr('x', model_details_text_padding)
                                                                                                    .attr('y', function(d, i) {

                                                                                                        return model_metrics_top_padding + (i * model_metrics_row_height);

                                                                                                    })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    } else {

        let model_metrics_title_text = model_details_version_g.selectAll(".model_metrics_title_text")
                                                                                                    .data(classification_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(d => d.display_name)
                                                                                                    .attr('x', 0)
                                                                                                    .attr('y', function(d, i) {

                                                                                                        return model_metrics_top_padding + (i * model_metrics_row_height);

                                                                                                    })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

        let model_details_away_metric_text = model_details_version_g.selectAll(".model_details_away_metric_text")
                                                                                                    .data(classification_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {
                                                                                                            
                                                                                                            return formatDecimal3Places(json_dict['away_model_info']['model_metrics'][d.base_name]);
    
                                                                                                        })
                                                                                                    .attr('x', -model_details_text_padding)
                                                                                                    .attr('y', function(d, i) {
                                                                                                                            
                                                                                                            return model_metrics_top_padding + (i * model_metrics_row_height);
        
                                                                                                        })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

        let model_details_home_metric_text = model_details_version_g.selectAll(".model_details_home_metric_text")
                                                                                                    .data(classification_metrics_array)
                                                                                                    .enter()
                                                                                                    .append('text')
                                                                                                    .text(function(d) {
                                                                                                                
                                                                                                                return formatDecimal3Places(json_dict['home_model_info']['model_metrics'][d.base_name]);
        
                                                                                                            })
                                                                                                    .attr('x', model_details_text_padding)
                                                                                                    .attr('y', function(d, i) {
                                                                                                                    
                                                                                                                    return model_metrics_top_padding + (i * model_metrics_row_height);
            
                                                                                                    })
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');
    }

    //**********************************PLOT AWAY FEATURES *************************************/
    let away_features_padding_dict = {
        left: 0,
        top: 30,
    };

    let away_features_width_ratio = 0.4;
    let away_features_width = matchup_predictions_width * away_features_width_ratio - away_features_padding_dict.left;

    let away_features_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'away_features_g')
                                                                                                    .attr('transform', 'translate(' + away_features_padding_dict.left + ', ' + away_features_padding_dict.top + ')');

    let away_feature_title_text = away_features_g.append('text')
                                                                                                    .text("Features")
                                                                                                    .attr('x', away_features_padding_dict.left)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    //Calc details on shap values;
    let away_shap_base_value = json_dict['away_shap_base_value'];
    let away_current_shap_value = away_shap_base_value;
    let away_current_model_pred = json_dict['away_model_pred'];
    let away_shap_value_min = away_shap_base_value;
    let away_shap_value_max = away_shap_base_value;
    let away_feature_name_array = [];
    let away_feature_cutoff = 5;  //Number of features to show before grouping the rest into "Other"
    let away_other_feature_value = 0;
    let away_other_feature_count = 0;

    for (let i = 0; i < json_dict['away_shap_array'].length; i++) {

        let shap_value_dict = json_dict['away_shap_array'][i];

        away_current_shap_value += shap_value_dict['shap_value'];

        if (away_current_shap_value < away_shap_value_min) {

            away_shap_value_min = away_current_shap_value;

        }

        if (away_current_shap_value > away_shap_value_max) {

            away_shap_value_max = away_current_shap_value;

        }

        if (i < away_feature_cutoff) {

            away_current_model_pred -= shap_value_dict['shap_value'];

            let append_dict = shap_value_dict;
            append_dict['starting_shap_value'] = away_current_model_pred; 

            away_feature_name_array.push(append_dict);

        } else {

            away_other_feature_value += shap_value_dict['shap_value'];
            away_other_feature_count += 1;

        }
    };

    away_feature_name_array.push({
                                                            "feature": away_other_feature_count + " Other", 
                                                            "shap_value": away_other_feature_value, 
                                                            "starting_shap_value": away_shap_base_value,
                                                        });

    let away_features_name_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'away_features_name_g')
                                                                                                    .attr('transform', 'translate(' + away_features_padding_dict.left + ', ' + away_features_padding_dict.top + ')');

    let away_features_row_height = (matchup_predictions_height - away_features_padding_dict.top) / (away_feature_name_array.length + 1);


    let away_features_names_g = away_features_name_g.selectAll(".away_features_names_g")
                                                                                                    .data(away_feature_name_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'away_features_names_g')
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return 'away_features_names_g_' + i

                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        let away_features_name_y = i * away_features_row_height + away_features_padding_dict.top;
                                                                                                        
                                                                                                        return 'translate(0, ' + away_features_name_y + ')'

                                                                                                    });

    let away_features_name_text = away_features_names_g.append('text')
                                                                                                    .text(function(d) {

                                                                                                        if (d.feature.includes("Other")) {

                                                                                                            return d.feature

                                                                                                        } else {

                                                                                                            return feature_display_name_dict[d.feature]
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('x', away_features_padding_dict.left)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('font-size', "8px")
                                                                                                    .style('font-weight', 500)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-family', 'Work Sans');
                                                                                                
    //Create Min and Max X scale, with the base value centered yet containings the min and the max values
    //first find the largest abs max value between base value and min and max
    let away_shap_value_abs_max = Math.max(Math.abs(away_shap_base_value - away_shap_value_min), Math.abs(away_shap_value_max - away_shap_base_value));
    let shap_x_padding = 1.6;
    let away_shap_min_x = away_shap_base_value - (away_shap_value_abs_max * shap_x_padding);
    let away_shap_max_x = away_shap_base_value + (away_shap_value_abs_max * shap_x_padding);

    let away_shap_x_axis_scale = d3.scaleLinear()
                                                                    .domain([away_shap_min_x, away_shap_max_x])
                                                                    .range([0, away_features_width - away_features_padding_dict.left]);

    let away_features_shap_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'away_features_shap_g')
                                                                                                    .attr('transform', 'translate(' + away_features_padding_dict.left + ', ' + away_features_padding_dict.top + ')');

    let away_features_shap_row_height = (matchup_predictions_height - away_features_padding_dict.top) / (away_feature_name_array.length + 1);

    let away_features_shap_rows = away_features_shap_g.selectAll(".away_features_shap_rows")
                                                                                                    .data(away_feature_name_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'away_features_shap_rows')
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return 'away_features_shap_g_' + i

                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        let away_features_shap_y = i * away_features_shap_row_height + away_features_padding_dict.top;

                                                                                                        return 'translate(0, ' + away_features_shap_y + ')'

                                                                                                    });

    let away_features_shap_rect = away_features_shap_rows.append('rect')
                                                                                                    .attr('x', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return away_shap_x_axis_scale(d.starting_shap_value);
                                                                                                        } else {
                                                                                                            return away_shap_x_axis_scale(d.starting_shap_value + d.shap_value);
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('y', -away_features_shap_row_height * 0.4)
                                                                                                    .attr('width', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return (away_shap_x_axis_scale(d.shap_value + d.starting_shap_value) - away_shap_x_axis_scale(d.starting_shap_value));
                                                                                                        } else {
                                                                                                            return (away_shap_x_axis_scale(d.starting_shap_value) - away_shap_x_axis_scale(d.shap_value + d.starting_shap_value));
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('height', away_features_shap_row_height * 0.8)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }

                                                                                                    });

        //Add the shap value text, if the shap value is negative, add it the right of the bar if positive add it to the left
        let away_features_shap_text = away_features_shap_rows.append('text')
                                                                                                    .text(function(d) {
                                                                                                            
                                                                                                            if (d.shap_value > 0) {
                                                                                                                return '+' + formatDecimal3Places(d.shap_value)
                                                                                                            } else {
                                                                                                                return formatDecimal3Places(d.shap_value)
                                                                                                            }
    
                                                                                                        })
                                                                                                    .attr('x', function(d) {
                                                                                                        
                                                                                                        if (d.shap_value > 0) {
                                                                                                            return away_shap_x_axis_scale(d.starting_shap_value) - 4;
                                                                                                        } else {
                                                                                                            return away_shap_x_axis_scale(d.starting_shap_value) + 4;
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }

                                                                                                    })
                                                                                                    .attr('text-anchor', function(d) {

                                                                                                        if (d.shap_value > 0) {

                                                                                                            return 'end'

                                                                                                        } else {

                                                                                                            return 'start'

                                                                                                        }

                                                                                                    })
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let away_shap_base_value_text = away_features_shap_g.append('text')
                                                                                                    .text(formatDecimal3Places(away_shap_base_value))
                                                                                                    .attr('x', away_shap_x_axis_scale(away_shap_base_value))
                                                                                                    .attr('y', matchup_predictions_height - away_features_padding_dict.top)
                                                                                                    .attr('id', 'away_shap_base_value_text')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');                                                                                                 

    let away_shap_model_pred_text = away_features_shap_g.append('text')
                                                                                                    .text(formatDecimal3Places(json_dict['away_model_pred']))
                                                                                                    .attr('x', away_shap_x_axis_scale(json_dict['away_model_pred']))
                                                                                                    .attr('y', 2)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (away_current_model_pred > away_shap_base_value) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');
                                                                                                    

    //*****************PLOT HOME FEATURES ***********************************/
    let home_features_padding_dict = {
        right: 0,
        top: 30,
    };

    let home_features_width_ratio = 0.5;
    let home_features_left = matchup_predictions_width * home_features_width_ratio;
    let home_features_width = matchup_predictions_width - home_features_left - home_features_padding_dict.right;

    //Plot Home Features Title
    let home_features_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'home_features_g')
                                                                                                    .attr('transform', 'translate(' + home_features_left + ', ' + home_features_padding_dict.top + ')');

    let home_feature_title_text = home_features_g.append('text')
                                                                                                    .text("Features")
                                                                                                    .attr('x', home_features_width)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '14px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    //Calc details on shap values;
    let home_shap_base_value = json_dict['home_shap_base_value'];

    let home_current_shap_value = home_shap_base_value;
    let home_current_model_pred = json_dict['home_model_pred'];
    let home_shap_value_min = home_shap_base_value;
    let home_shap_value_max = home_shap_base_value;
    let home_feature_name_array = [];
    let home_feature_cutoff = 5;  //Number of features to show before grouping the rest into "Other"
    let home_other_feature_value = 0;
    let home_other_feature_count = 0;

    for (let i = 0; i < json_dict['home_shap_array'].length; i++) {

        let shap_value_dict = json_dict['home_shap_array'][i];

        home_current_shap_value += shap_value_dict['shap_value'];

        if (home_current_shap_value < home_shap_value_min) {

            home_shap_value_min = home_current_shap_value;

        }

        if (home_current_shap_value > home_shap_value_max) {

            home_shap_value_max = home_current_shap_value;

        }

        if (i < home_feature_cutoff) {

            home_current_model_pred -= shap_value_dict['shap_value'];

            let append_dict = shap_value_dict;
            append_dict['starting_shap_value'] = home_current_model_pred; 

            home_feature_name_array.push(append_dict);

        } else {

            home_other_feature_value += shap_value_dict['shap_value'];
            home_other_feature_count += 1;

        }
    };

    home_feature_name_array.push({
                                                            "feature": home_other_feature_count + " Other",
                                                            "shap_value": home_other_feature_value,
                                                            "starting_shap_value": home_shap_base_value,
                                                        }); 

    let home_features_name_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'home_features_name_g')
                                                                                                    .attr('transform', 'translate(' + home_features_left + ', ' + home_features_padding_dict.top + ')');

    let home_features_row_height = (matchup_predictions_height - home_features_padding_dict.top) / (home_feature_name_array.length + 1);

    let home_features_names_g = home_features_name_g.selectAll(".home_features_names_g")
                                                                                                    .data(home_feature_name_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'home_features_names_g')
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return 'home_features_names_g_' + i

                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        let home_features_name_y = i * home_features_row_height + home_features_padding_dict.top;
                                                                                                        
                                                                                                        return 'translate(0, ' + home_features_name_y + ')'

                                                                                                    });

    let home_features_name_text = home_features_names_g.append('text')
                                                                                                    .text(function(d) {

                                                                                                        if (d.feature.includes("Other")) {

                                                                                                            return d.feature

                                                                                                        } else {

                                                                                                            return feature_display_name_dict[d.feature]
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('x', home_features_width)
                                                                                                    .attr('y', 0)
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('font-size', "8px")
                                                                                                    .style('font-weight', 500)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('font-family', 'Work Sans');

    //Create Min and Max X scale, with the base value centered yet containings the min and the max values
    //first find the largest abs max value between base value and min and max
    let home_shap_value_abs_max = Math.max(Math.abs(home_shap_base_value - home_shap_value_min), Math.abs(home_shap_value_max - home_shap_base_value));
    let home_shap_min_x = home_shap_base_value - (home_shap_value_abs_max * shap_x_padding);
    let home_shap_max_x = home_shap_base_value + (home_shap_value_abs_max * shap_x_padding);

    console.log("Home Shap Min X", home_shap_min_x, "Home Shap Max X", home_shap_max_x);

    let home_shap_x_axis_scale = d3.scaleLinear()
                                                                    .domain([home_shap_min_x, home_shap_max_x])
                                                                    .range([0, home_features_width]);

    let home_features_shap_g = matchup_predictions_svg.append('g')
                                                                                                    .attr('id', 'home_features_shap_g')
                                                                                                    .attr('transform', 'translate(' + home_features_left + ', ' + home_features_padding_dict.top + ')');

    let home_features_shap_row_height = (matchup_predictions_height - home_features_padding_dict.top) / (home_feature_name_array.length + 1);

    let home_features_shap_rows = home_features_shap_g.selectAll(".home_features_shap_rows")
                                                                                                    .data(home_feature_name_array)
                                                                                                    .enter()
                                                                                                    .append('g')
                                                                                                    .attr('class', 'home_features_shap_rows')
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return 'home_features_shap_g_' + i

                                                                                                    })
                                                                                                    .attr('transform', function(d, i) {

                                                                                                        let home_features_shap_y = i * home_features_shap_row_height + home_features_padding_dict.top;

                                                                                                        return 'translate(0, ' + home_features_shap_y + ')'

                                                                                                    });

    let home_features_shap_rect = home_features_shap_rows.append('rect')
                                                                                                    .attr('x', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return home_shap_x_axis_scale(d.starting_shap_value);
                                                                                                        } else {
                                                                                                            return home_shap_x_axis_scale(d.starting_shap_value + d.shap_value);
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('y', -home_features_shap_row_height * 0.4)
                                                                                                    .attr('width', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return (home_shap_x_axis_scale(d.shap_value + d.starting_shap_value) - home_shap_x_axis_scale(d.starting_shap_value));
                                                                                                        } else {
                                                                                                            return (home_shap_x_axis_scale(d.starting_shap_value) - home_shap_x_axis_scale(d.shap_value + d.starting_shap_value));
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('height', home_features_shap_row_height * 0.8)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }

                                                                                                    });

        //Add the shap value text, if the shap value is negative, add it the right of the bar if positive add it to the left
        let home_features_shap_text = home_features_shap_rows.append('text')
                                                                                                    .text(function(d) {
                                                                                                            
                                                                                                            if (d.shap_value > 0) {
                                                                                                                return '+' + formatDecimal3Places(d.shap_value)
                                                                                                            } else {
                                                                                                                return formatDecimal3Places(d.shap_value)
                                                                                                            }
    
                                                                                                        })
                                                                                                    .attr('x', function(d) {
                                                                                                        
                                                                                                        if (d.shap_value > 0) {
                                                                                                            return home_shap_x_axis_scale(d.starting_shap_value) - 4;
                                                                                                        } else {
                                                                                                            return home_shap_x_axis_scale(d.starting_shap_value) + 4;
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('y', 0)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (d.shap_value > 0) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }

                                                                                                    })
                                                                                                    .attr('text-anchor', function(d) {

                                                                                                        if (d.shap_value > 0) {

                                                                                                            return 'end'

                                                                                                        } else {

                                                                                                            return 'start'

                                                                                                        }

                                                                                                    })
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let home_shap_base_value_text = home_features_shap_g.append('text')
                                                                                                    .text(formatDecimal3Places(home_shap_base_value))
                                                                                                    .attr('x', home_shap_x_axis_scale(home_shap_base_value))
                                                                                                    .attr('y', matchup_predictions_height - home_features_padding_dict.top)
                                                                                                    .attr('id', 'home_shap_base_value_text')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'baseline')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let home_shap_model_pred_text = home_features_shap_g.append('text')
                                                                                                    .text(formatDecimal3Places(json_dict['home_model_pred']))
                                                                                                    .attr('x', home_shap_x_axis_scale(json_dict['home_model_pred']))
                                                                                                    .attr('y', 2)
                                                                                                    .attr('fill', function(d) {

                                                                                                        if (home_current_model_pred > home_shap_base_value) {
                                                                                                            return color_dict.light_blue
                                                                                                        } else {
                                                                                                            return color_dict.red
                                                                                                        }
                                                                                                    })
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '10px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');




}

function launchModelDetails(odds_col_dict, i, predictions_dict) {

    console.log("Model Details", odds_col_dict.base_name)

    let matchup_predictions_svg = d3.select("#matchup_predictions_svg");

    //Get current height and width
    let matchup_predictions_width = matchup_predictions_svg.node().getBoundingClientRect().width;
    let matchup_predictions_height = matchup_predictions_svg.node().getBoundingClientRect().height;

    //Append Svg in place over
    let model_details_svg = matchup_predictions_svg.append('svg')
                                                                                                    .attr('id', 'model_details_svg')
                                                                                                    .attr('width', matchup_predictions_width)
                                                                                                    .attr('height', matchup_predictions_height)
                                                                                                    .style('position', 'absolute')
                                                                                                    .style('top', 0)
                                                                                                    .style('left', 0);
                                                                                                 
    let model_details_bg = model_details_svg.append('rect')
                                                                                                .attr('x', 0)
                                                                                                .attr('y', 0)
                                                                                                .attr('width', matchup_predictions_width)
                                                                                                .attr('height', matchup_predictions_height)
                                                                                                .attr('fill', color_dict.dark_bg);

    let model_details_close_g = model_details_svg.append('g')
                                                                                                    .attr('id', 'model_details_close_g')
                                                                                                    .style('cursor', 'pointer')
                                                                                                    .on('click', function() {

                                                                                                        d3.select("#model_details_svg").remove();
                                                                                                        d3.select("#model_details_version_g").remove();
                                                                                                        d3.select("#away_features_g").remove();
                                                                                                        d3.select("#away_features_name_g").remove();
                                                                                                        d3.select("#away_features_shap_g").remove();
                                                                                                        d3.select("#home_features_g").remove();
                                                                                                        d3.select("#home_features_name_g").remove();
                                                                                                        d3.select("#home_features_shap_g").remove();

                                                                                                    });

    let model_details_close_x = model_details_close_g.append('text')
                                                                                                    .text('x')
                                                                                                    .attr('x', matchup_predictions_width - 20)
                                                                                                    .attr('y', 10)
                                                                                                    .attr('fill', color_dict.orange)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '24px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');
                                                                                            
    let model_details_title_text = model_details_svg.append('text')
                                                                                                    .text(odds_col_dict.display_name)
                                                                                                    .attr('x', matchup_predictions_width / 2)
                                                                                                    .attr('y', 20)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '24px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let away_features_padding_dict = {
        left: 0,
        top: 30,
    };

    let away_features_width_ratio = 0.4;
    let away_features_width = matchup_predictions_width * away_features_width_ratio - away_features_padding_dict.left;

    let model_details_away_odds_text = model_details_svg.append('text')
                                                                                                    .text(createOddsTextName(odds_col_dict, i, false, predictions_dict))
                                                                                                    .attr('x', away_features_width / 2 + away_features_padding_dict.left)
                                                                                                    .attr('y', 20)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '24px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let home_features_padding_dict = {
                                                                    right: 0,
                                                                    top: 30,
                                                                };
                                                                                                
    let home_features_width_ratio = 0.5;
    let home_features_left = matchup_predictions_width * home_features_width_ratio;
    let home_features_width = matchup_predictions_width - home_features_left - home_features_padding_dict.right;

    let model_details_home_odds_text = model_details_svg.append('text')
                                                                                                    .text(createOddsTextName(odds_col_dict, i, true, predictions_dict))
                                                                                                    .attr('x', home_features_left + home_features_width / 2)
                                                                                                    .attr('y', 20)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '24px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

}

function createOddsTextName(odds_col_dict, i, is_home, predictions_dict) {

    let odds_name = "";
    let away_home = is_home ? "home" : "away";

    if (odds_col_dict.line_type.includes("game_total")) {
        odds_name = "ncaab_pregame_" + odds_col_dict.base_name;
    } else {
        odds_name = "ncaab_pregame_" + away_home + "_" + odds_col_dict.base_name
    };

    let odds_value = predictions_dict[odds_name];
    let odds_text = formatDecimal2Places(odds_value);

    if (odds_value > 0 && odds_col_dict.line_type == "spread") {
        odds_text = "+" + odds_text;
    }

    //If win_prob in d.line_type
    if (odds_col_dict.line_type.includes("win_prob")) {
        let american_odds = convertWinProbToAmericanOdds(odds_value)

        if (american_odds >= 100) {

            american_odds = "+" + american_odds

        }

        odds_text = odds_text + " (" + american_odds + ")";
    }

    return odds_text

}

function createConsensusOddsText(col_base_name, is_home){

    if (col_base_name.includes("game_total")) {

        return formatDecimal2Places(predictions_dict['consensus_pricing_dict'][col_base_name])

    } else if (col_base_name.includes("win_prob")) {

        if (is_home) {

            let col_name = col_base_name.replace("consensus", "consensus_home");
            let win_prob = predictions_dict['consensus_pricing_dict'][col_name];

            let american_odds = parseInt(convertWinProbToAmericanOdds(win_prob));

            if (american_odds > 0) {
                return "+" + american_odds
            } else {
                return american_odds
            }

        } else {

            let col_name = col_base_name.replace("consensus", "consensus_away");
            let win_prob = predictions_dict['consensus_pricing_dict'][col_name];

            let american_odds = parseInt(convertWinProbToAmericanOdds(win_prob));

            if (american_odds > 0) {
                return "+" + american_odds
            } else {
                return american_odds
            }
        }

    } else if (col_base_name.includes("team_total")) {

        if (is_home) {

            if (col_base_name.includes("1h")) {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_1h_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_home_1h_spread'];

                console.log("1h Game Total", game_total, "1h Team Spread", team_spread)

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));

            } else if (col_base_name.includes("2h")) {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_2h_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_home_2h_spread'];

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));

            } else {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_fg_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_home_fg_spread'];

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));
            }
        } else {

            if (col_base_name.includes("1h")) {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_1h_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_away_1h_spread'];

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));

            } else if (col_base_name.includes("2h")) {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_2h_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_away_2h_spread'];

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));

            } else {

                let game_total = predictions_dict['consensus_pricing_dict']['consensus_fg_game_total'];
                let team_spread = predictions_dict['consensus_pricing_dict']['consensus_away_fg_spread'];

                return formatDecimal2Places(calcTeamTotal(-team_spread, game_total));

            }
        }
    } else {

        if (is_home) {

            let col_name = col_base_name.replace("consensus", "consensus_home");

            return formatDecimal2Places(predictions_dict['consensus_pricing_dict'][col_name]);

        } else {

            let col_name = col_base_name.replace("consensus", "consensus_away");

            return formatDecimal2Places(predictions_dict['consensus_pricing_dict'][col_name]);
        }
    }
}

function updateMatchupOdds(json_dict) {

    let odds_col_array = [
        {"display_name": "Spread", "market_id": 1, "line_type": "spread", "base_name": "consensus_1h_spread"},
        {"display_name": "Total", "market_id": 2, "line_type": "game_total", "base_name": "consensus_1h_game_total"},
        {"display_name": "ML", "market_id": 3, "line_type": "win_prob", "base_name": "consensus_1h_win_prob"},
        {"display_name": "TT", "market_id": 4, "line_type": "team_total", "base_name": "consensus_1h_team_total"},
        {"display_name": "Spread", "market_id": 5, "line_type": "spread", "base_name": "consensus_2h_spread"},
        {"display_name": "Total", "market_id": 6, "line_type": "game_total", "base_name": "consensus_2h_game_total"},
        {"display_name": "ML", "market_id": 7, "line_type": "win_prob", "base_name": "consensus_2h_win_prob"},
        {"display_name": "TT", "market_id": 8, "line_type": "team_total", "base_name": "consensus_2h_team_total"},
        {"display_name": "Spread", "market_id": 9, "line_type": "spread", "base_name": "consensus_fg_spread"},
        {"display_name": "Total", "market_id": 10, "line_type": "game_total", "base_name": "consensus_fg_game_total"},
        {"display_name": "ML", "market_id": 11, "line_type": "win_prob", "base_name": "consensus_fg_win_prob"},
        {"display_name": "TT", "market_id": 12, "line_type": "team_total", "base_name": "consensus_fg_team_total"},
    ];

    let odds_dict = json_dict['consensus_pricing_dict'];

    //Iterate through each prediction col and update the text
    odds_col_array.forEach(function(d) {

        let away_odds_text = createConsensusOddsText(d.base_name, false);

        d3.select("#game_odds_away_text_" + d.base_name).text(away_odds_text);

        let home_odds_text = createConsensusOddsText(d.base_name, true);

        d3.select("#game_odds_home_text_" + d.base_name).text(home_odds_text);
        
    });
}

function updateMatchupGameModels(json_dict) {

    let prediction_col_array = [
        {'display_name': "1H Win Prob", "market_id": 1, "line_type": "win_prob", "base_name": "1h_winner_model"},
        {'display_name': "1H Spread", "market_id": 2, "line_type": "spread", "base_name": "1h_spread_model"},
        {'display_name': "1H Total", "market_id": 3, "line_type": "game_total", "base_name": "1h_total_points_model"},
        {'display_name': "1H Team Total", "market_id": 4, "line_type": "team_total", "base_name": "1h_team_total_model"},
        {'display_name': "FG Win Prob", "market_id": 5, "line_type": "win_prob", "base_name": "fg_win_prob_model"},
        {'display_name': "FG Spread", "market_id": 6, "line_type": "spread", "base_name": "fg_spread_model"},
        {'display_name': "FG Total", "market_id": 7, "line_type": "game_total", "base_name": "fg_total_points_model"},
        {'display_name': "FG Team Total", "market_id": 8, "line_type": "team_total", "base_name": "team_total_model"},
    ];

    let team_combo_stat_array = [
        {'display_name': 'FG', 'stat_numerator': "fg_made", "stat_denominator": "fg_att"},
        {'display_name': '3pt', 'stat_numerator': "three_pt_made", "stat_denominator": "three_pt_att"},
        {'display_name': "FT", 'stat_numerator': 'ft_made', "stat_denominator": "ft_att"},
    ];

    let team_single_stat_array = [
        {"display_name": "Total Rebs", "base_name": "total_rebs"},
        {'display_name': "Off Rebs", 'base_name': 'off_rebs'},
        {'display_name': "Assists","base_name": "assists"},
        {'display_name': "Turnovers", 'base_name': "turnovers"},
        {'display_name': "Blocks", 'base_name': 'blocks'},
        {"display_name": "Steals", "base_name": "steals"},
    ];

    let predictions_dict = json_dict['predictions'];

    //Iterate through each prediction col and update the text

    prediction_col_array.forEach(function(d, i) {

        let away_odds_text = createOddsTextName(d, i, false, predictions_dict);

        d3.select("#away_main_odds_text_" + i).text(away_odds_text);

        let home_odds_text = createOddsTextName(d, i, true, predictions_dict);

        d3.select("#home_main_odds_text_" + i).text(home_odds_text);

    });


}

function updateMatchupPredictions(json_dict) {

    if (global_vars_dict['matchup_prediction_display_id'] === 0) {

        updateMatchupOdds(json_dict);

    }

    if (global_vars_dict['matchup_prediction_display_id'] === 1) {

        updateMatchupGameModels(json_dict);

    }
}

function populateMatchupOdds() {

    let odds_col_array = [
        {"display_name": "Spread", "market_id": 1, "line_type": "spread", "base_name": "consensus_1h_spread"},
        {"display_name": "Total", "market_id": 2, "line_type": "game_total", "base_name": "consensus_1h_game_total"},
        {"display_name": "ML", "market_id": 3, "line_type": "win_prob", "base_name": "consensus_1h_win_prob"},
        {"display_name": "TT", "market_id": 4, "line_type": "team_total", "base_name": "consensus_1h_team_total"},
        {"display_name": "Spread", "market_id": 5, "line_type": "spread", "base_name": "consensus_2h_spread"},
        {"display_name": "Total", "market_id": 6, "line_type": "game_total", "base_name": "consensus_2h_game_total"},
        {"display_name": "ML", "market_id": 7, "line_type": "win_prob", "base_name": "consensus_2h_win_prob"},
        {"display_name": "TT", "market_id": 8, "line_type": "team_total", "base_name": "consensus_2h_team_total"},
        {"display_name": "Spread", "market_id": 9, "line_type": "spread", "base_name": "consensus_fg_spread"},
        {"display_name": "Total", "market_id": 10, "line_type": "game_total", "base_name": "consensus_fg_game_total"},
        {"display_name": "ML", "market_id": 11, "line_type": "win_prob", "base_name": "consensus_fg_win_prob"},
        {"display_name": "TT", "market_id": 12, "line_type": "team_total", "base_name": "consensus_fg_team_total"},
    ];

    let period_col_array = ['1st Half', '2nd Half', 'Full Game'];

    let num_odds_pricing_cols = odds_col_array.length;

    let matchup_predictions_div = d3.select("#matchup_predictions_div");
    let prediction_div_width = matchup_predictions_div.node().getBoundingClientRect().width
    let prediction_div_height = matchup_predictions_div.node().getBoundingClientRect().height

    //Append SVG
    let game_odds_svg = matchup_predictions_div.append('svg')
                                                                                        .attr('id', 'game_odds_svg')
                                                                                        .attr('width', prediction_div_width)
                                                                                        .attr('height', prediction_div_height);

    let game_odds_padding_dict = {
        top: 60,
        bottom: 20,
        left: 160,
        right: 60,
        team_padding: 20,
        middle_padding: 6,
    };

    let game_odds_height = prediction_div_height - game_odds_padding_dict.top - game_odds_padding_dict.bottom;
    let game_odds_width = prediction_div_width - game_odds_padding_dict.left - game_odds_padding_dict.right;
    let game_odds_row_height = (game_odds_height - game_odds_padding_dict.team_padding) / 2;
    let game_odds_col_width = (game_odds_width - ((num_odds_pricing_cols - 1) * game_odds_padding_dict.middle_padding)) / num_odds_pricing_cols;

    let game_odds_g = game_odds_svg.append('g')
                                                                        .attr('id', 'game_odds_g')
                                                                        .attr('transform', 'translate(' + game_odds_padding_dict.left + ', ' + game_odds_padding_dict.top + ')');

    let game_odds_away_team_name_text = game_odds_g.append('text')
                                                                                        .text(matchup_info_dict['away_team_mascot'])
                                                                                        .attr('x', -game_odds_padding_dict.team_padding)
                                                                                        .attr('y', game_odds_row_height / 2)
                                                                                        .attr("fill", color_dict.med_gray)
                                                                                        .attr('text-anchor', 'end')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('font-size', '14px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');

    let game_odds_home_team_name_text = game_odds_g.append('text')
                                                                                        .text(matchup_info_dict['home_team_mascot'])
                                                                                        .attr('x', -game_odds_padding_dict.team_padding)
                                                                                        .attr('y', game_odds_row_height + (game_odds_row_height / 2) + game_odds_padding_dict.middle_padding)
                                                                                        .attr("fill", color_dict.med_gray)
                                                                                        .attr('text-anchor', 'end')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('font-size', '14px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');

    let game_odds_col_g = game_odds_g.selectAll(".game_odds_col_g")
                                                                                        .data(odds_col_array)
                                                                                        .enter()
                                                                                        .append('g')
                                                                                        .attr('class', 'game_odds_col_g')
                                                                                        .attr('id', function(d) {

                                                                                            return 'game_odds_col_g_' + d.base_name;

                                                                                        })
                                                                                        .attr('transform', function(d, i) {

                                                                                            let game_odds_col_x = i * (game_odds_col_width + game_odds_padding_dict.middle_padding);
                                                                                            let game_odds_col_y = 0;

                                                                                            return 'translate(' + game_odds_col_x + ', ' + game_odds_col_y + ')';

                                                                                        });

    let game_odds_col_text = game_odds_col_g.append('text')
                                                                                        .text(function(d) {return d.display_name})
                                                                                        .attr('x', game_odds_col_width / 2)
                                                                                        .attr('y', -game_odds_padding_dict.middle_padding)
                                                                                        .attr('fill', color_dict.med_gray)
                                                                                        .attr('text-anchor', 'middle')
                                                                                        .attr('dominant-baseline', 'baseline')
                                                                                        .attr('font-size', '12px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');

    let game_odds_period_width = game_odds_width / period_col_array.length;

    let game_odds_period_text = game_odds_g.selectAll(".game_odds_period_text")
                                                                                        .data(period_col_array)
                                                                                        .enter()
                                                                                        .append('text')
                                                                                        .text(function(d) {return d})
                                                                                        .attr('x', function(d, i) {

                                                                                            return game_odds_period_width / 2 + i * game_odds_period_width;

                                                                                        })
                                                                                        .attr('y', -game_odds_padding_dict.middle_padding - 20)
                                                                                        .attr('fill', color_dict.med_gray)
                                                                                        .attr('text-anchor', 'middle')
                                                                                        .attr('dominant-baseline', 'baseline')
                                                                                        .attr('font-size', '12px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');

    let game_odds_period_line = game_odds_g.selectAll(".game_odds_period_line")
                                                                                        .data(period_col_array.slice(0, -1))
                                                                                        .enter()
                                                                                        .append('line')
                                                                                        .attr('x1', function(d, i) {

                                                                                            return ((i + 1) * game_odds_period_width) + (game_odds_padding_dict.middle_padding / 2) - 3;

                                                                                        })
                                                                                        .attr('x2', function(d, i) {

                                                                                            return ((i + 1) * game_odds_period_width) + (game_odds_padding_dict.middle_padding / 2) - 3;

                                                                                        })
                                                                                        .attr('y1', -game_odds_padding_dict.middle_padding - 20)
                                                                                        .attr('y2', game_odds_height)
                                                                                        .attr('stroke', color_dict.med_gray)
                                                                                        .attr('stroke-width', 1);
                                                                                                                                                                                                                                                      
    let game_odds_away_odds_g = game_odds_col_g.append('g')
                                                                                        .attr('class', 'game_odds_away_odds_g')
                                                                                        .attr('id', function(d) {

                                                                                            return 'game_odds_away_odds_g_' + d.base_name;

                                                                                        });

    let game_odds_away_odds_bg = game_odds_away_odds_g.append('rect')
                                                                                        .attr('width', game_odds_col_width)
                                                                                        .attr('height', game_odds_row_height)
                                                                                        .attr('fill', color_dict.black)
                                                                                        .attr('rx', '5px')
                                                                                        .attr('ry', '5px');                                                                                        

    let game_odds_away_odds_text = game_odds_away_odds_g.append('text')
                                                                                        .text(function(d) {

                                                                                            return createConsensusOddsText(d.base_name, false);

                                                                                        })
                                                                                        .attr('id', function(d) {

                                                                                            return 'game_odds_away_text_' + d.base_name;

                                                                                        })
                                                                                        .attr('x', game_odds_col_width / 2)
                                                                                        .attr('y', game_odds_row_height / 2)
                                                                                        .attr('fill', color_dict.dark_gray)
                                                                                        .attr('text-anchor', 'middle')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('font-size', '14px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');

    let game_odds_home_odds_g = game_odds_col_g.append('g')
                                                                                        .attr('class', 'game_odds_home_odds_g')
                                                                                        .attr('id', function(d) {

                                                                                            return 'game_odds_home_odds_g_' + d.base_name;

                                                                                        })
                                                                                        .attr('transform', function(d, i) {

                                                                                            let game_odds_home_odds_y = game_odds_row_height + game_odds_padding_dict.middle_padding;

                                                                                            return 'translate(0, ' + game_odds_home_odds_y + ')';

                                                                                        });

    let game_odds_home_odds_bg = game_odds_home_odds_g.append('rect')
                                                                                        .attr('width', game_odds_col_width)
                                                                                        .attr('height', game_odds_row_height)
                                                                                        .attr('fill', color_dict.black)
                                                                                        .attr('rx', '5px')
                                                                                        .attr('ry', '5px');

    let game_odds_home_odds_text = game_odds_home_odds_g.append('text')
                                                                                        .text(function(d) {

                                                                                            return createConsensusOddsText(d.base_name, true);

                                                                                        })
                                                                                        .attr('id', function(d) {

                                                                                            return 'game_odds_home_text_' + d.base_name;

                                                                                        })
                                                                                        .attr('x', game_odds_col_width / 2)
                                                                                        .attr('y', game_odds_row_height / 2)
                                                                                        .attr('fill', color_dict.dark_gray)
                                                                                        .attr('text-anchor', 'middle')
                                                                                        .attr('dominant-baseline', 'middle')
                                                                                        .attr('font-size', '14px')
                                                                                        .attr('font-weight', 500)
                                                                                        .style('font-family', 'Work Sans');


}

function populateMatchupGameModels() {

    let prediction_col_array = [
        {'display_name': "1H Win Prob", "market_id": 1, "line_type": "win_prob", "base_name": "1h_winner_model"},
        {'display_name': "1H Spread", "market_id": 2, "line_type": "spread", "base_name": "1h_spread_model"},
        {'display_name': "1H Total", "market_id": 3, "line_type": "game_total", "base_name": "1h_total_points_model"},
        {'display_name': "1H Team Total", "market_id": 4, "line_type": "team_total", "base_name": "1h_team_total_model"},
        {'display_name': "FG Win Prob", "market_id": 5, "line_type": "win_prob", "base_name": "fg_win_prob_model"},
        {'display_name': "FG Spread", "market_id": 6, "line_type": "spread", "base_name": "fg_spread_model"},
        {'display_name': "FG Total", "market_id": 7, "line_type": "game_total", "base_name": "fg_total_points_model"},
        {'display_name': "FG Team Total", "market_id": 8, "line_type": "team_total", "base_name": "team_total_model"},
    ]

    let team_combo_stat_array = [
        {'display_name': 'FG', 'stat_numerator': "fg_made", "stat_denominator": "fg_att"},
        {'display_name': '3pt', 'stat_numerator': "three_pt_made", "stat_denominator": "three_pt_att"},
        {'display_name': "FT", 'stat_numerator': 'ft_made', "stat_denominator": "ft_att"},
    ]

    let team_single_stat_array = [
        {"display_name": "Total Rebs", "base_name": "total_rebs"},
        {'display_name': "Off Rebs", 'base_name': 'off_rebs'},
        {'display_name': "Assists","base_name": "assists"},
        {'display_name': "Turnovers", 'base_name': "turnovers"},
        {'display_name': "Blocks", 'base_name': 'blocks'},
        {"display_name": "Steals", "base_name": "steals"},
    ]

    let num_odds_pricing_rows = prediction_col_array.length;

    let matchup_predictions_div = d3.select("#matchup_predictions_div");
    let prediction_div_width = matchup_predictions_div.node().getBoundingClientRect().width
    let prediction_div_height = matchup_predictions_div.node().getBoundingClientRect().height
    let prediction_row_height = prediction_div_height / num_odds_pricing_rows;

    let prediction_padding_dict = {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
    };


    let matchup_predictions_svg = matchup_predictions_div.append('svg')
                                                                                                    .attr('id', 'matchup_predictions_svg')
                                                                                                    .attr('width', prediction_div_width)
                                                                                                    .attr("height", prediction_div_height);

    let odds_pricing_title_text = matchup_predictions_svg.append('text')
                                                                                                    .text("Odds")
                                                                                                    .attr('x', prediction_div_width / 2)
                                                                                                    .attr('y', prediction_padding_dict.top)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'middle')
                                                                                                    .attr('dominant-baseline', 'hanging')
                                                                                                    .attr('font-size', '16px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let odds_pricing_top_padding = 22;
    let odds_bg_width = 280;
    let odds_pricing_line_height = (prediction_div_height - odds_pricing_top_padding) / num_odds_pricing_rows;

    let odds_pricing_g = matchup_predictions_svg.selectAll(".odds_pricing_g")
                                                                                                        .data(prediction_col_array)
                                                                                                        .enter()
                                                                                                        .append('g')
                                                                                                        .attr('class', 'odds_pricing_g')
                                                                                                        .attr('transform', function(d, i) {

                                                                                                            let odds_pricing_x = prediction_div_width / 2 - odds_bg_width / 2;
                                                                                                            let odds_pricing_y = odds_pricing_top_padding + (odds_pricing_line_height * i) + (i * 1);

                                                                                                            return 'translate(' + odds_pricing_x + ', ' + odds_pricing_y + ')';

                                                                                                        })
                                                                                                        .style('cursor', 'pointer')
                                                                                                        .on('click', function(event, d, i) {

                                                                                                            launchModelDetails(d, i, predictions_dict);
                                                                                                            sendModelDetailsRequest(d.market_id);

                                                                                                        })
                                                                                                        .on('mouseover', function() {

                                                                                                            d3.select(this)
                                                                                                                    .select('.odds_pricing_highlight')
                                                                                                                    .style('display', 'block');

                                                                                                        })
                                                                                                        .on('mouseout', function() {

                                                                                                            d3.select(this)
                                                                                                                    .select('.odds_pricing_highlight')
                                                                                                                    .style('display', 'none');

                                                                                                        });

    let odds_pricing_bg = odds_pricing_g.append('rect')
                                                                                            .attr('x', 0)
                                                                                            .attr('y', 0)
                                                                                            .attr('class', 'odds_pricing_bg')
                                                                                            .attr('width', odds_bg_width)
                                                                                            .attr('height', odds_pricing_line_height)
                                                                                            .attr('stroke', color_dict.dark_bg)
                                                                                            .attr('stroke-width', '1px')
                                                                                            .attr('fill', color_dict.dark_bg)
                                                                                            .attr('shape-rendering', "CrispEdges")
                                                                                            .style('box-sizing', 'border-box');                                                      
                                                                                                
    let odds_pricing_line_title_text = odds_pricing_g.append('text')
                                                                                            .text(function(d) {

                                                                                                    return d.display_name
                                                                                            })
                                                                                            .attr('class', 'odds_pricing_line_title_texts')
                                                                                            .attr('x', odds_bg_width / 2)
                                                                                            .attr('y', odds_pricing_line_height / 2 - 5)
                                                                                            .attr('fill', color_dict.med_gray)
                                                                                            .attr('text-anchor', 'middle')
                                                                                            .attr('dominant-baseline', 'middle')
                                                                                            .attr('font-size', '14px')
                                                                                            .attr('font-weight', 500)
                                                                                            .style('font-family', 'Work Sans');
                                                                                
    let odds_pricing_highlight_width = 90;
    let odds_pricing_highlight_height = 2;

    let odds_pricing_line_highight = odds_pricing_g.append('rect')
                                                                                            .attr('x', odds_bg_width / 2 - odds_pricing_highlight_width / 2)
                                                                                            .attr('y', odds_pricing_line_height / 2 + 2)
                                                                                            .attr('class', 'odds_pricing_highlight')
                                                                                            .attr('width', odds_pricing_highlight_width)
                                                                                            .attr('height', odds_pricing_highlight_height)
                                                                                            .attr('fill', color_dict.orange)
                                                                                            .style('display', 'none');                                                                                     

    let odds_padding = 60;

    let odds_pricing_away_odds_text = odds_pricing_g.append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        let is_home = false;
                                                                                                        return createOddsTextName(d, i, is_home, predictions_dict);

                                                                                                    })
                                                                                                    .attr('id', function(d, i) {

                                                                                                        return "away_main_odds_text_" + i;

                                                                                                    })
                                                                                                    .attr('x', odds_bg_width / 2 - odds_padding)
                                                                                                    .attr('y', odds_pricing_line_height / 2)
                                                                                                    .attr('class', 'odds_pricing_away_odds_text')
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'end')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '16px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

    let odds_pricing_home_odds_text = odds_pricing_g.append('text')
                                                                                                    .text(function(d, i) {

                                                                                                        let is_home = true;
                                                                                                        return createOddsTextName(d, i, is_home, predictions_dict);

                                                                                                    })
                                                                                                    .attr("id", function(d, i) {

                                                                                                        return "home_main_odds_text_" + i

                                                                                                    })
                                                                                                    .attr('class', 'odds_pricing_home_odds_text')
                                                                                                    .attr('x', odds_bg_width / 2 + odds_padding)
                                                                                                    .attr('y', odds_pricing_line_height / 2)
                                                                                                    .attr('fill', color_dict.med_gray)
                                                                                                    .attr('text-anchor', 'start')
                                                                                                    .attr('dominant-baseline', 'middle')
                                                                                                    .attr('font-size', '16px')
                                                                                                    .attr('font-weight', 500)
                                                                                                    .style('font-family', 'Work Sans');

                                                                                        
    //***************************** Away Team Stat Predictions **********************************/
    let away_team_stats_g = matchup_predictions_svg.append('g')
                                                                                                .attr('id', 'away_team_stats_g')
                                                                                                .attr('transform', 'translate(' + prediction_padding_dict.left + ',' + prediction_padding_dict.top + ')');

    let team_stats_width = prediction_div_width * .33; 
    let team_stats_title_height = 36;
    let team_stats_row_height = (prediction_div_height - team_stats_title_height - prediction_padding_dict.bottom) / 11; //9 stat rows plus 2 padding rows
    let combo_stat_padding = 20;

    let away_team_stats_heading_text = away_team_stats_g.append('text')
                                                                                                .text("Team Stats")
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', 0)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'hanging')
                                                                                                .attr('font-size', '16px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let away_team_stats_header_row = away_team_stats_g.append('text')
                                                                                                .text("Made          Att         %")
                                                                                                .attr('x', team_stats_width / 2 - prediction_padding_dict.left - 2)
                                                                                                .attr('y', 20)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'hanging')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');
    
    let away_team_combo_stats_g = away_team_stats_g.selectAll(".away_team_combo_stats_g")
                                                                                                .data(team_combo_stat_array)
                                                                                                .enter()
                                                                                                .append('g')
                                                                                                .attr('class', 'away_team_combo_stats_g')
                                                                                                .attr('transform', function(d, i) {

                                                                                                    let combo_row_y = team_stats_row_height * i + team_stats_title_height;

                                                                                                    return 'translate(0,' + combo_row_y + ')'

                                                                                                })
                                                                                                // .style('cursor', 'pointer');

    let away_team_combo_stats_bg = away_team_combo_stats_g.append('rect')
                                                                                                .attr('x', 0)
                                                                                                .attr('y', 0)
                                                                                                .attr('width', team_stats_width)
                                                                                                .attr('height', team_stats_row_height)
                                                                                                .attr('fill', color_dict.dark_bg);

    let away_team_combo_stats_title = away_team_combo_stats_g.append('text')
                                                                                                .text(function(d) {return d.display_name})
                                                                                                .attr('x', prediction_padding_dict.left + 15)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'start')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');
    
    let away_team_combo_stats_numerator_text = away_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_away_" + d.stat_numerator + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal1Place(prediction_value)
                                                                                                })
                                                                                                .attr('id', function(d) {

                                                                                                    return "away_" + d.stat_numerator + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2 - combo_stat_padding)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'end')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let away_team_combo_stats_denominator_text = away_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_away_" + d.stat_denominator + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal1Place(prediction_value)
                                                                                                })
                                                                                                .attr("id", function(d) {

                                                                                                    return "away_" + d.stat_denominator + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let away_team_combo_stats_percent_text = away_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let numerator_stat_name = "ncaab_pregame_away_" + d.stat_numerator + "_model";
                                                                                                    let denominator_stat_name = "ncaab_pregame_away_" + d.stat_denominator + "_model";
                                                 
                                                                                                    let numerator_prediction_value = predictions_dict[numerator_stat_name];
                                                                                                    let denominator_prediction_value = predictions_dict[denominator_stat_name];

                                                                                                    return formatDecimal2Places(numerator_prediction_value / denominator_prediction_value)
                                                                                                })
                                                                                                .attr("id", function(d) {

                                                                                                    return "away_" + d.stat_numerator + "_percent_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2 + combo_stat_padding)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'start')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let away_team_single_stat_top = team_stats_title_height + ((team_combo_stat_array.length + 1) * team_stats_row_height);

    let away_team_single_stats_g = away_team_stats_g.selectAll(".away_team_single_stats_g")
                                                                                                .data(team_single_stat_array)
                                                                                                .enter()
                                                                                                .append('g')
                                                                                                .attr('class', 'away_team_single_stats_g')
                                                                                                .attr('transform', function(d, i) {

                                                                                                    let stat_row_y = team_stats_row_height * i + away_team_single_stat_top;

                                                                                                    return 'translate(0,' + stat_row_y + ')'

                                                                                                })
                                                                                                // .style('cursor', 'pointer');

    let away_team_single_stats_bg = away_team_single_stats_g.append('rect')
                                                                                                .attr('x', 0)
                                                                                                .attr('y', 0)
                                                                                                .attr('width', team_stats_width)
                                                                                                .attr('height', team_stats_row_height)
                                                                                                .attr('fill', color_dict.dark_bg);

    let away_team_single_stats_title = away_team_single_stats_g.append('text')
                                                                                                .text(function(d) {return d.display_name})
                                                                                                .attr('x', prediction_padding_dict.left + 15)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'start')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let away_team_single_stats_text = away_team_single_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_away_" + d.base_name + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal2Places(prediction_value)
                                                                                                })
                                                                                                .attr("id", function(d) {

                                                                                                    return "away_" + d.base_name + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    //************************************HOME TEAM STAT Predictions *************************************** */
    let home_team_stats_g = matchup_predictions_svg.append('g')
                                                                                                .attr('id', 'home_team_stats_g')
                                                                                                .attr('transform', 'translate(' + (prediction_div_width * 0.66) + ',' + prediction_padding_dict.top + ')');

    let home_team_stats_heading_text = home_team_stats_g.append('text')
                                                                                                .text("Team Stats")
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', 0)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'hanging')
                                                                                                .attr('font-size', '16px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let home_team_stats_header_row = home_team_stats_g.append('text')
                                                                                                .text("Made          Att         %")
                                                                                                .attr('x', team_stats_width / 2 - prediction_padding_dict.left - 2)
                                                                                                .attr('y', 20)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'hanging')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');
    
    let home_team_combo_stats_g = home_team_stats_g.selectAll(".home_team_combo_stats_g")
                                                                                                .data(team_combo_stat_array)
                                                                                                .enter()
                                                                                                .append('g')
                                                                                                .attr('class', 'home_team_combo_stats_g')
                                                                                                .attr('transform', function(d, i) {

                                                                                                    let combo_row_y = team_stats_row_height * i + team_stats_title_height;

                                                                                                    return 'translate(0,' + combo_row_y + ')'

                                                                                                })
                                                                                                // .style('cursor', 'pointer');

    let home_team_combo_stats_bg = home_team_combo_stats_g.append('rect')
                                                                                                .attr('x', 0)
                                                                                                .attr('y', 0)
                                                                                                .attr('width', team_stats_width)
                                                                                                .attr('height', team_stats_row_height)
                                                                                                .attr('fill', color_dict.dark_bg);

    let home_team_combo_stats_title = home_team_combo_stats_g.append('text')
                                                                                                .text(function(d) {return d.display_name})
                                                                                                .attr('x', team_stats_width - prediction_padding_dict.right)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'end')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');
    
    let home_team_combo_stats_numerator_text = home_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_home_" + d.stat_numerator + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal1Place(prediction_value)
                                                                                                })
                                                                                                .attr('id', function(d) {

                                                                                                    return "home_" + d.stat_numerator + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2 - combo_stat_padding)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'end')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let home_team_combo_stats_denominator_text = home_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_home_" + d.stat_denominator + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal1Place(prediction_value)
                                                                                                })
                                                                                                .attr("id", function(d) {

                                                                                                    return "home_" + d.stat_denominator + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let home_team_combo_stats_percent_text = home_team_combo_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let numerator_stat_name = "ncaab_pregame_home_" + d.stat_numerator + "_model";
                                                                                                    let denominator_stat_name = "ncaab_pregame_home_" + d.stat_denominator + "_model";
                                                 
                                                                                                    let numerator_prediction_value = predictions_dict[numerator_stat_name];
                                                                                                    let denominator_prediction_value = predictions_dict[denominator_stat_name];

                                                                                                    return formatDecimal2Places(numerator_prediction_value / denominator_prediction_value)
                                                                                                })
                                                                                                .attr('id', function(d) {

                                                                                                    return "home_" + d.stat_numerator + "_percent_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2 + combo_stat_padding)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'start')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let home_team_single_stat_top = team_stats_title_height + ((team_combo_stat_array.length + 1) * team_stats_row_height);

    let home_team_single_stats_g = home_team_stats_g.selectAll(".home_team_single_stats_g")
                                                                                                .data(team_single_stat_array)
                                                                                                .enter()
                                                                                                .append('g')
                                                                                                .attr('class', 'home_team_single_stats_g')
                                                                                                .attr('transform', function(d, i) {

                                                                                                    let stat_row_y = team_stats_row_height * i + home_team_single_stat_top;

                                                                                                    return 'translate(0,' + stat_row_y + ')'

                                                                                                })
                                                                                                // .style('cursor', 'pointer');

    let home_team_single_stats_bg = home_team_single_stats_g.append('rect')
                                                                                                .attr('x', 0)
                                                                                                .attr('y', 0)
                                                                                                .attr('width', team_stats_width)
                                                                                                .attr('height', team_stats_row_height)
                                                                                                .attr('fill', color_dict.dark_bg);

    let home_team_single_stats_title = home_team_single_stats_g.append('text')
                                                                                                .text(function(d) {return d.display_name})
                                                                                                .attr('x', team_stats_width - prediction_padding_dict.right)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'end')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');

    let home_team_single_stats_text = home_team_single_stats_g.append("text")
                                                                                                .text(function(d) {

                                                                                                    let full_stat_name = "ncaab_pregame_home_" + d.base_name + "_model";
                                                 
                                                                                                    let prediction_value = predictions_dict[full_stat_name];

                                                                                                    return formatDecimal2Places(prediction_value)
                                                                                                })
                                                                                                .attr('id', function(d) {

                                                                                                    return "home_" + d.base_name + "_text";

                                                                                                })
                                                                                                .attr('x', team_stats_width / 2)
                                                                                                .attr('y', team_stats_row_height / 2)
                                                                                                .attr('fill', color_dict.med_gray)
                                                                                                .attr('text-anchor', 'middle')
                                                                                                .attr('dominant-baseline', 'middle')
                                                                                                .attr('font-size', '12px')
                                                                                                .attr('font-weight', 500)
                                                                                                .style('font-family', 'Work Sans');
}

function populateMatchupPredictions(json_dict) {

    if (global_vars_dict['matchup_prediction_display_id'] === 0) {

        populateMatchupOdds();

    }

    if (global_vars_dict['matchup_prediction_display_id'] === 1) {

        populateMatchupGameModels();

    }

}

function populateMatchupHeader(json_dict) {

    matchup_info_dict = json_dict['matchup_info']

    let matchup_header_div = d3.select("#matchup_header_div");
    let matchup_header_width = matchup_header_div.node().getBoundingClientRect().width
    let matchup_header_height = matchup_header_div.node().getBoundingClientRect().height

    let header_padding_dict = {
        left: 10,
        top: 15,
        bottom: 5,
        right: 10,
    }

    let team_logo_size = 100;
    let header_team_text_size = '18px';

    let matchup_header_svg = matchup_header_div
                                                                .append('svg')
                                                                .attr('id', 'matchup_header_svg')
                                                                .attr('width', matchup_header_width)
                                                                .attr('height', matchup_header_height);

    let away_team_logo = matchup_header_svg.append("svg:image")
                                                                .attr("id", "away_team_logo_img")
                                                                .attr('x', header_padding_dict.left)
                                                                .attr('y',  (matchup_header_height / 2) - (team_logo_size / 2))
                                                                .attr('width', team_logo_size + 'px')
                                                                .attr('xlink:href', matchup_info_dict['away_team_logo_url']);
                                                            
    let away_team_short_name_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['away_team_short_name'])
                                                                .attr('id', 'away_team_short_name_text')
                                                                .attr('x', header_padding_dict.left + team_logo_size + 20)
                                                                .attr('y', header_padding_dict.top)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'start')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', header_team_text_size)
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    let away_team_rank_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['away_team_rank'])
                                                                .attr('id', 'away_team_rank_text')
                                                                .attr('x', header_padding_dict.left + team_logo_size + 12)
                                                                .attr('y', header_padding_dict.top + 5)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'end')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '12px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    let away_team_mascot_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['away_team_mascot'])
                                                                .attr('id', 'away_team_mascot_text')
                                                                .attr('x', header_padding_dict.left + team_logo_size + 16)
                                                                .attr('y', header_padding_dict.top + 22)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'start')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '32px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);



    let away_conference_name_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['away_conference_name'])
                                                                .attr('id', 'away_conference_name_text')
                                                                .attr('x', header_padding_dict.left + team_logo_size + 20)
                                                                .attr('y', header_padding_dict.top + 68)
                                                                .attr('text-anchor', 'start')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '18px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    //Get x position of away conference text end
    let away_conference_name_text_bbox = away_conference_name_text.node().getBBox();
    let away_conference_name_text_end_x = away_conference_name_text_bbox.x + away_conference_name_text_bbox.width;

    let away_team_record_text = matchup_header_svg.append('text')
                                                                //.text(matchup_info_dict['away_team_record'])
                                                                .text("10-3 (2-2)")
                                                                .attr('id', 'away_team_record_text')
                                                                .attr('x', away_conference_name_text_end_x + 15)
                                                                .attr('y', header_padding_dict.top + 67)
                                                                .attr('text-anchor', 'start')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '14px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    //Insert 3 SVG buttons  [team, lineups, news]
    let matchup_header_button_width = 60;
    let matchup_header_button_height = 18;
    let matchup_header_button_padding = 7;

    let away_team_button_g = matchup_header_svg.append('g')
                                                                .attr('id', 'away_team_button_g')
                                                                .attr('transform', function() {

                                                                    away_team_button_x = header_padding_dict.left + team_logo_size + 20;
                                                                    away_team_button_y = header_padding_dict.top + 65 + 14;

                                                                    return 'translate(' + away_team_button_x + ',' + away_team_button_y + ')';

                                                                });
                                                                

    let away_team_team_button_g = away_team_button_g.append('g')
                                                                .attr('id', 'away_team_team_button_g')
                                                                .style('cursor', 'not-allowed')
                                                                .on('click', function() {

                                                                    console.log("Clicked away team team button");

                                                                });

    let away_team_team_button_bg = away_team_team_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', 1)
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let away_team_team_button_text = away_team_team_button_g.append('text')
                                                                .text('Team')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');

    let away_team_lineups_button_g = away_team_button_g.append('g')
                                                                .attr('id', 'away_team_lineups_button_g')
                                                                .attr('transform', function() {

                                                                    let away_team_lineups_button_x = matchup_header_button_width + matchup_header_button_padding;
                                                                    let away_team_lineups_button_y = 0;

                                                                    return 'translate(' + away_team_lineups_button_x + ',' + away_team_lineups_button_y + ')';

                                                                })
                                                                .style('cursor', 'pointer')
                                                                .on('click', function() {

                                                                    let away_team_seo_name = matchup_info_dict['away_team_seo_name'];

                                                                    sendTeamRosterRequest(away_team_seo_name);
                                                                    launchTeamRosterModal(false);

                                                                });

    let away_team_lineups_button_bg = away_team_lineups_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', '1px')
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let away_team_lineups_button_text = away_team_lineups_button_g.append('text')
                                                                .text('Roster')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');

    let away_team_news_button_g = away_team_button_g.append('g')
                                                                .attr('id', 'away_team_news_button_g')
                                                                .attr('transform', function() {

                                                                    let away_team_news_button_x = (matchup_header_button_width + matchup_header_button_padding) * 2;
                                                                    let away_team_news_button_y = 0;

                                                                    return 'translate(' + away_team_news_button_x + ',' + away_team_news_button_y + ')';

                                                                })
                                                                .style('cursor', 'not-allowed')
                                                                .on('click', function() {

                                                                    console.log("Clicked away team news button");

                                                                });

    let away_team_news_button_bg = away_team_news_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', 1)
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let away_team_news_button_text = away_team_news_button_g.append('text')
                                                                .text('News')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');

    let home_team_logo = matchup_header_svg.append("svg:image")
                                                                .attr("id", "home_team_logo_img")
                                                                .attr('x', matchup_header_width - team_logo_size - header_padding_dict.right)
                                                                .attr('y',  (matchup_header_height / 2) - (team_logo_size / 2))
                                                                .attr('width', team_logo_size + 'px')
                                                                .attr('xlink:href', matchup_info_dict['home_team_logo_url']);

    let home_team_name_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['home_team_short_name'])
                                                                .attr('id', 'home_team_name_text')
                                                                .attr('x', matchup_header_width - header_padding_dict.right - team_logo_size - 20)
                                                                .attr('y', header_padding_dict.top)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'end')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', header_team_text_size)
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    let home_team_rank_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['home_team_rank'])
                                                                .attr('id', 'home_team_rank_text')
                                                                .attr('x', matchup_header_width - header_padding_dict.right - team_logo_size - 12)
                                                                .attr('y', header_padding_dict.top + 5)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'start')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '16px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    let home_team_mascot_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['home_team_mascot'])
                                                                .attr('id', 'home_team_mascot_text')
                                                                .attr('x', matchup_header_width - header_padding_dict.right - team_logo_size - 16)
                                                                .attr('y', header_padding_dict.top + 22)
                                                                .attr('dominant-baseline', 'hanging')
                                                                .attr('text-anchor', 'end')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '32px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);
                                                                
    let home_conference_name_text = matchup_header_svg.append('text')
                                                                .text(matchup_info_dict['home_conference_name'])
                                                                .attr('id', 'home_conference_name_text')
                                                                .attr('x', matchup_header_width - header_padding_dict.right - team_logo_size - 20)
                                                                .attr('y', header_padding_dict.top + 68)
                                                                .attr('text-anchor', 'end')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '18px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    //Get x position of home conference text start
    let home_conference_name_text_bbox = home_conference_name_text.node().getBBox();
    let home_conference_name_text_start_x = home_conference_name_text_bbox.x;

    let home_team_record_text = matchup_header_svg.append('text')
                                                                //.text(matchup_info_dict['home_team_record'])
                                                                .text("10-3 (2-2)")
                                                                .attr('id', 'home_team_record_text')
                                                                .attr('x', home_conference_name_text_start_x - 15)
                                                                .attr('y', header_padding_dict.top + 67)
                                                                .attr('text-anchor', 'end')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '14px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    //Insert 3 SVG buttons  [team, lineups, news]
    let home_team_button_g = matchup_header_svg.append('g')
                                                                .attr('id', 'home_team_button_g')
                                                                .attr('transform', function() {

                                                                    home_team_button_x = matchup_header_width - header_padding_dict.right - team_logo_size - 10 - (matchup_header_button_width * 3) - (matchup_header_button_padding * 2);
                                                                    home_team_button_y = header_padding_dict.top + 67 + 14;

                                                                    return 'translate(' + home_team_button_x + ',' + home_team_button_y + ')';

                                                                });

    let home_team_team_button_g = home_team_button_g.append('g')
                                                                .attr('id', 'home_team_team_button_g')
                                                                .style('cursor', 'not-allowed')
                                                                .on('click', function() {

                                                                    console.log("Clicked home team team button");

                                                                });

    let home_team_team_button_bg = home_team_team_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', 1)
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let home_team_team_button_text = home_team_team_button_g.append('text')
                                                                .text('Team')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');

    let home_team_lineups_button_g = home_team_button_g.append('g')
                                                                .attr('id', 'home_team_lineups_button_g')
                                                                .attr('transform', function() {

                                                                    let home_team_lineups_button_x = matchup_header_button_width + matchup_header_button_padding;
                                                                    let home_team_lineups_button_y = 0;

                                                                    return 'translate(' + home_team_lineups_button_x + ',' + home_team_lineups_button_y + ')';

                                                                })
                                                                .style('cursor', 'pointer')
                                                                .on('click', function() {
                                                                    
                                                                    let home_team_seo_name = matchup_info_dict['home_team_seo_name'];

                                                                    sendTeamRosterRequest(home_team_seo_name);
                                                                    launchTeamRosterModal(true);

                                                                });

    let home_team_lineups_button_bg = home_team_lineups_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', '1px')
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let home_team_lineups_button_text = home_team_lineups_button_g.append('text')
                                                                .text('Roster')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');

    let home_team_news_button_g = home_team_button_g.append('g')
                                                                .attr('id', 'home_team_news_button_g')
                                                                .attr('transform', function() {

                                                                    let home_team_news_button_x = (matchup_header_button_width + matchup_header_button_padding) * 2;
                                                                    let home_team_news_button_y = 0;

                                                                    return 'translate(' + home_team_news_button_x + ',' + home_team_news_button_y + ')';

                                                                })
                                                                .style('cursor', 'not-allowed')
                                                                .on('click', function() {

                                                                    console.log("Clicked home team news button");

                                                                });

    let home_team_news_button_bg = home_team_news_button_g.append('rect')
                                                                .attr('x', 0)
                                                                .attr('y', 0)
                                                                .attr('width', matchup_header_button_width)
                                                                .attr('height', matchup_header_button_height)
                                                                .attr('fill', color_dict.dark_bg)
                                                                .attr('stroke', color_dict.med_gray)
                                                                .attr('stroke-width', 1)
                                                                .attr('rx', 10)
                                                                .attr('ry', 10)
                                                                .attr('shape-rendering', "CrispEdges")
                                                                .style('box-sizing', 'border-box');

    let home_team_news_button_text = home_team_news_button_g.append('text')
                                                                .text('News')
                                                                .attr('x', matchup_header_button_width / 2)
                                                                .attr('y', matchup_header_button_height / 2)
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('text-anchor', 'middle')
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('font-size', '12px')
                                                                .attr('font-weight', 500)
                                                                .style('font-family', 'Work Sans');
                                                                
    let matchup_at_text = matchup_header_svg.append('text')
                                                                .text("@")
                                                                .attr('x', matchup_header_width / 2)
                                                                .attr('y', matchup_header_height / 2)
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('text-anchor', 'middle')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '38px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

    let matchup_start_date_text = matchup_header_svg.append('text')
                                                                .text(function() {

                                                                    let date_str = matchup_info_dict['start_date'];

                                                                    // Parse the date string
                                                                    let date = new Date(date_str + ' EST');

                                                                    // Get the browser's timezone
                                                                    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                                                                    // Format the local time
                                                                    let local_date = date.toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    });

                                                                    return local_date
                                                                })
                                                                .attr('x', matchup_header_width / 2)
                                                                .attr('y', matchup_header_height - header_padding_dict.bottom - 30)
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('text-anchor', 'middle')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '18px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);

                                                            
    let matchup_start_time_text = matchup_header_svg.append('text')
                                                                .text(function() {

                                                                     //Get browser timezone
                                                                        let browser_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

                                                                        let date_str = matchup_info_dict['start_date'];
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
                                                                .attr('x', matchup_header_width / 2)
                                                                .attr('y', matchup_header_height - header_padding_dict.bottom - 10)
                                                                .attr('dominant-baseline', 'middle')
                                                                .attr('text-anchor', 'middle')
                                                                .attr('fill', color_dict.med_gray)
                                                                .attr('font-size', '18px')
                                                                .style('font-family', 'Work Sans')
                                                                .style('font-weight', 500);
                                                                
}

function startWebSocket() {
    ws_conn = new WebSocket('wss://api.untouted.com');
    console.log("Websocket Connected.");

    ws_conn.onmessage = function incoming(event) {

        let resp_dict = JSON.parse(event.data);
        let resp_type = resp_dict['resp_type'];

        if (resp_type == "matchup_game_info") {

            //Set Global Matchup Info Dict
            matchup_info_dict = resp_dict['data']['matchup_info'];
            console.log(resp_dict['data']);
            populateMatchupHeader(resp_dict['data']);

        }

        if (resp_type == "main_models") {
            projections_dict = resp_dict['data']['projections'];
            model_input_dict = resp_dict['data']['projections'];
            predictions_dict = resp_dict['data']['predictions'];

            console.log(predictions_dict);

            populateMatchupPredictions(resp_dict['data']);
            populateTeamProjections(resp_dict['data']);
        }

        if (resp_type == "projection_ranges") {
            projection_range_dict = resp_dict['data']['projection_ranges'];
            projection_col_array = resp_dict['data']['projection_col_array'];
        }

        if (resp_type == "model_inputs_stat_group") {

            console.log(resp_dict['data']);

            let stat_id = resp_dict['data']['stat_id'];

            if (stat_id === 0) {

                populateModelInputsELODistPlot(resp_dict['data']['stat_group_array']);

            } else {

                populateModelInputsStatsDistPlot(resp_dict['data']['stat_group_dict']);

            }

        }

        if (resp_type == "model_inputs_game_results" ) {

            let stat_id = resp_dict['data']['stat_id'];

            if (stat_id == 0) {

                populateModelInputsELOTimeSeries(resp_dict['data']);
            } else {

                populateModelInputsStatsTimeSeries(resp_dict['data']);

            }

            populateModelInputsGameResults(resp_dict['data']);

        }

        if (resp_type == "model_details") {

            populateModelDetails(resp_dict['data']);

        }

        if (resp_type === "all_models_update") {

            console.log("All Models Update ->", resp_dict['data']);
            predictions_dict = resp_dict['data']['predictions'];
            updateMatchupPredictions(resp_dict['data']);

        }

    }

    ws_conn.onclose = function() {
        ws_conn = null;
        console.log("Websocket Disconnected")
        setTimeout(startWebSocket, 500);
    }
}

function parseGameUrlParam() {

    let url = window.location.href;

    let param_name = "game_url";

    let regex = new RegExp("[?&]" + param_name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);

      if (!results) return null;

      if (!results[2]) return '';

      return decodeURIComponent(results[2].replace(/\+/g, " "));

}

//Request Functions
function sendInitRequests(game_url) {

    let init_game_req_dict = {
        req_type: "matchup_game_info",
        params: {
            "game_url": game_url,
        }
    };

    let init_model_req_dict = {
        req_type: "main_models",
        params: {
            "game_url": game_url,
        }
    };


    ws_conn.send(JSON.stringify(init_game_req_dict));
    ws_conn.send(JSON.stringify(init_model_req_dict));

}

function sendModelInputRequest(stat_id, team_seo_name, game_start_date) {

    //Stat Group Request
    let stat_group_req_dict = {
        req_type: "model_input_stat_group_medians",
        params: {
            "stat_id": stat_id,
            "team_seo_name": team_seo_name,
            "game_start_date": game_start_date,
        }
    }

    ws_conn.send(JSON.stringify(stat_group_req_dict));

    //Game Results Request
    let game_result_req_dict = {
        req_type: "model_input_game_results",
        params: {
            "team_seo_name": team_seo_name,
            "stat_id": stat_id
        }
    }

    ws_conn.send(JSON.stringify(game_result_req_dict));

}

function sendTeamRosterRequest(team_seo_name) {

    let team_roster_req_dict = {
        req_type: "team_roster",
        params: {
            "team_seo_name": team_seo_name,
        }
    }

    ws_conn.send(JSON.stringify(team_roster_req_dict));

}

function sendModelDetailsRequest(market_id) {
    
        let model_details_req_dict = {
            req_type: "model_details",
            params: {
                "market_id": market_id,
                "model_inputs": model_input_dict,
            }
        }
    
        ws_conn.send(JSON.stringify(model_details_req_dict));
    
}

function sendAllModelsUpdateRequest() {

    //Create Request Dict
    let model_req_dict = {
        "req_type": "all_models_update",
        "params": {
            "model_inputs": model_input_dict,
        }
    }

    //Send Request
    ws_conn.send(JSON.stringify(model_req_dict));
}

function updateModelInputsAndSendRequest() {

    //HERE upon clicking pull in the for and against model inputs, if different from starting values, update model_inputs_dict and 
    //send request for updating the models
    let modal_stat_dict = projection_col_array.find(dict => dict["stat_id"] === global_vars_dict['modal_stat_id']);
    let modal_stat_base_name = modal_stat_dict['stat_group'];
    let for_team_value;
    let against_team_value;

    if (modal_stat_base_name === "elo_rating") {

        for_team_value = parseInt(d3.select("#team_value_text").text());

        if (global_vars_dict['model_stat_group_is_home']) {

            model_input_dict['home_starting_elo'] = for_team_value;

        } else {

            model_input_dict['away_starting_elo'] = for_team_value;

        }

    } else {

        for_team_value = parseFloat(d3.select("#for_team_value_text").text());
        against_team_value = parseFloat(d3.select("#against_team_value_text").text());

        //Get currently selected team and stat
        if (global_vars_dict['model_stat_group_is_home']) {

            let for_model_input_name = "home_for_" + modal_stat_base_name + "_q50";
            let against_model_input_name  = "home_against_" + modal_stat_base_name + "_q50";

            model_input_dict[for_model_input_name] = for_team_value;
            model_input_dict[against_model_input_name] = against_team_value;

        } else {

            let for_model_input_name = "away_for_" + modal_stat_base_name + "_q50";
            let against_model_input_name  = "away_against_" + modal_stat_base_name + "_q50";

            model_input_dict[for_model_input_name] = for_team_value;
            model_input_dict[against_model_input_name] = against_team_value;

        };
    };

    //Send request for model details
    console.log("Modal Stat name", modal_stat_base_name);
    console.log("For Team value", for_team_value, "Against Team Value", against_team_value);
    console.log("Model Input Dict", model_input_dict);

    sendAllModelsUpdateRequest();

    //Update Model Projections
    updateModelProjections(modal_stat_base_name, for_team_value, against_team_value);

    //Close Modal
    closeModal();


};

startWebSocket();

//Add event listeners to selection buttons
d3.select("#odds_button").on('click', function() {

    let button_transition_duration = 100;

    if (global_vars_dict['matchup_prediction_display_id'] != 0) {

        //Update global var
        global_vars_dict['matchup_prediction_display_id'] = 0;

        //Update button colors
        d3.select("#odds_button")
            .transition()
            .duration(button_transition_duration)
            .style('background-color', color_dict.orange)
            .style('border', "none")
            .style('color', color_dict.dark_bg);

        d3.select("#models_button")
            .transition()
            .duration(button_transition_duration)
            .style('background-color', color_dict.dark_bg)
            .style('border', '1px solid ' + color_dict.dark_gray)
            .style("color", color_dict.med_gray);

        //Clear matchup_predictions_div
        d3.select("#matchup_predictions_div").selectAll("*").remove();

        //Repopulate Matchup Odds
        populateMatchupOdds();

    }
});

d3.select("#models_button").on('click', function() {

    let button_transition_duration = 100;

    if (global_vars_dict['matchup_prediction_display_id'] != 1) {

        //Update global var
        global_vars_dict['matchup_prediction_display_id'] = 1;

        //Update button colors
        d3.select("#models_button")
            .transition()
            .duration(button_transition_duration)
            .style('background-color', color_dict.orange)
            .style('border', "none")
            .style("color", color_dict.dark_bg)

        d3.select("#odds_button")
            .transition()
            .duration(button_transition_duration)
            .style('background-color', color_dict.dark_bg)
            .style('border', '1px solid ' + color_dict.dark_gray)
            .style('color', color_dict.med_gray);

        //Clear matchup_predictions_div
        d3.select("#matchup_predictions_div").selectAll("*").remove();

        //Repopulate Matchup Game Models
        populateMatchupGameModels();

    }

});


//Send for projection ranges first
setTimeout(function() {

    let init_projection_range_req_dict = {
        req_type: "projection_ranges",
        params: {}
    };

    ws_conn.send(JSON.stringify(init_projection_range_req_dict));

}, 1500)


setTimeout(function() {

    let game_req_url = parseGameUrlParam();

    sendInitRequests(game_req_url);

    //Show update sim button
    d3.select("#update_models_button").style('display', 'block');
    
}, 2000);
