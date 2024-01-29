const server_api_url = "https://ncaaf-season-sim-api.untouted.com"

let global_pricing_dict = {
    json_data: {},
    pricing_market_id: 2001,
    conference_winner_display_id: 151,
    conference_exacta_display_id: 151,
    division_conference_winner_display_id: 37,
    division_winner_display_id: 111,
    bowl_id: 101,
    win_totals_team_id: 2005,
    win_totals_slider_value: 8.5,
    win_totals_radio_value: 1,
    h2h_win_total_team_1_id: 99,
    h2h_win_total_team_2_id: 333,
    h2h_team_1_spread_slider_value: 0,
    vig_int: 24,
    vig_type_id: 1,
}

//Global Vars
let color_dict = {
    black: "#000",
    charcoal: "#1a1a1a",
    white: "#cec1ae",
    light_gray: "#f2f2f2",
    med_gray: "#cec1ae",
    dark_gray: ' #cec1ae',
    orange: "#e8220b",
}

let pricing_market_dict = {
    2001: {
        'market_title': 'Championship Winner',
        'market_type': 'ToWin',
        'market_type_id': 1,
    },
    2002: {
        'market_title': "Make Playoffs",
        'market_type': 'ToWin',
        'market_type_id': 1,
    },
    2101: {
        'market_title': 'Conference Winners',
        'market_type': 'ToWin',
        'market_type_id': 1,
    },
    2102: {
        'market_title': 'Division Winners',
        'market_type': 'ToWIn',
        'market_type_id': 1,
    },
    2103: {
        'market_title': "Bowl Winners",
        'market_type': "ToWin",
        'market_type_id': 1,
    },
    2201: {
        'market_title': "Season Win Totals",
        'market_type': 'WinTotals',
        'market_type_id': 2,
    },
    2202: {
        'market_title': "Team H2H Win Totals",
        'market_type': "WinTotals",
        'market_type_id': 2,
    },
    2301: {
        'market_title': "Conference Championship Exacta",
        'market_type': 'Exacta',
        'market_type_id': 3,
    },
}

base_sidebar_width = 400
d3.select("#sidebar_div").attr('min-width', base_sidebar_width + 'px');

//************************API Requests*********************************************/
async function fetchSidebarData(server_api_url, user_id) {

    const payload = {
        'user_id': user_id,
        'request_type': 'SidebarLoadData',
        'request_params': {
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const json_data = await response.json();

    console.log(json_data);

    return json_data

};

async function fetchTeamSchedule(server_api_url, user_id, sidebar_data_dict, team_id) {

    const payload = {
        'user_id': user_id,
        'request_type': 'TeamSchedule',
        'request_params': {
            "team_id": team_id,
            "user_elo_map": sidebar_data_dict.user_elo_map,
            "user_homefield_adj_map": sidebar_data_dict.user_homefield_adj_map,
            "user_game_adj_map": sidebar_data_dict.user_game_adj_map,
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const json_data = await response.json();

    console.log(json_data);

    populateTeamSchedule(json_data, sidebar_data_dict, team_id);

}

async function sendRunSimRequest(server_api_url, user_id, sidebar_data_dict) {

    let global_pricing_id = global_pricing_dict.pricing_market_id;

    let payload = {
                            'user_id': user_id,
                            'request_type': 'RunFuturesSim',
                            }

    //Determine request by global market id
    if (global_pricing_id == 2001) {
        
        payload['request_params'] = {
                        'pricing_market_id': global_pricing_dict.pricing_market_id,
                        'user_elo_map': sidebar_data_dict.user_elo_map,
                        'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
                        'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
                         };

    } else if (global_pricing_id == 2002) {

        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
             };

    } else if (global_pricing_id == 2101) {

        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'conference_id': global_pricing_dict.conference_winner_display_id,
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
                     };

    } else if (global_pricing_id == 2102) {

        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'conference_id': global_pricing_dict.division_conference_winner_display_id,
            'division_id': global_pricing_dict.division_winner_display_id,
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
        };

    } else if (global_pricing_id == 2201) {

        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'team_id': global_pricing_dict.win_totals_team_id,
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
        };

    } else if (global_pricing_id == 2202) {

        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'h2h_win_params': {
                'h2h_win_total_team_1_id': global_pricing_dict.h2h_win_total_team_1_id,
                'h2h_win_total_team_2_id': global_pricing_dict.h2h_win_total_team_2_id,
            },
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
        };

    } else if (global_pricing_id == 2301) {
        
        payload['request_params'] = {
            'pricing_market_id': global_pricing_dict.pricing_market_id,
            'conference_id': global_pricing_dict.conference_exacta_display_id,
            'user_elo_map': sidebar_data_dict.user_elo_map,
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
        };

    } else {

        console.log("Market id not matched", global_pricing_id);

    }

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const json_data = await response.json();

    console.log(json_data);

    handlePricingResponse(json_data, sidebar_data_dict);

}

async function sendSaveEloRatingsRequest(server_api_url, user_id, sidebar_data_dict) {

    const payload = {
        'user_id': user_id,
        'request_type': 'SaveUserEloRatings',
        'request_params': {
            'user_elo_map': sidebar_data_dict.user_elo_map,
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    const json_data = await response.json();

    console.log(json_data);

    if (json_data['response'] === "success") {

        displayUserEloSavedMessage();

    }

}

async function sendSaveHomefieldAdjRequest(server_api_url, user_id, sidebar_data_dict) {

    const payload = {
        'user_id': user_id,
        'request_type': 'SaveUserHomefieldAdj',
        'request_params': {
            'user_homefield_adj_map': sidebar_data_dict.user_homefield_adj_map,
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)

    })

    const json_data = await response.json();

    console.log(json_data);

    if (json_data['response'] === "success") {

        displayUserHomefieldAdjSavedMessage();

    }
}

async function sendSaveGameAdjRequest(server_api_url, user_id, sidebar_data_dict) {

    const payload = {
        'user_id': user_id,
        'request_type': 'SaveUserGameAdj',
        'request_params': {
            'user_game_adj_map': sidebar_data_dict.user_game_adj_map,
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)

    })

    const json_data = await response.json();

    console.log(json_data);

    if (json_data['response'] === "success") {

        displayUserGameAdjSavedMessage();

    }


}

async function sendSaveMarketVigRequest(server_api_url, user_id, sidebar_data_dict) {

    const payload = {
        'user_id': user_id,
        'request_type': 'SaveUserMarketVig',
        'request_params': {
            'user_market_vig_map': sidebar_data_dict.user_market_vig_map,
        }
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)

    })

    const json_data = await response.json();

    console.log(json_data);

    if (json_data['response'] === "success") {

        displayUserMarketVigSavedMessage();

    }


}

async function sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict) {

    global_pricing_dict.pricing_market_id = pricing_request_params.pricing_market_id;

    console.log("---->>>", pricing_request_params);

    const payload = {
        'user_id': user_id,
        'request_type': 'PricingRequest',
        'request_params': pricing_request_params,
    };

    const response = await fetch(server_api_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    console.log("------>", payload);

    const json_data = await response.json();

    console.log(json_data);

    handlePricingResponse(json_data, sidebar_data_dict);

}

//*********************PRICING FNS************************************************/
function handlePricingResponse(json_data, sidebar_data_dict) {

    //Set pricing data
    global_pricing_dict.json_data = json_data;

    let pricing_market_id = json_data['pricing_market_id'];

    console.log(pricing_market_id);

    if (pricing_market_id == 2001) {

        populatePlayoffOddsPricingTable(json_data, sidebar_data_dict);

    } else if (pricing_market_id == 2002) {

        populateMakePlayoffsPricingTable(json_data, sidebar_data_dict);

    } else if (pricing_market_id == 2101) {

        populateConferenceOddsPricingTable(json_data, sidebar_data_dict);
    
    } else if (pricing_market_id == 2102) {

        populateDivisionOddsPricingTable(json_data, sidebar_data_dict);
    
    }  else if (pricing_market_id == 2103) {
        
        populateBowlOddsPricingTable(json_data, sidebar_data_dict);
    
    } else if (pricing_market_id == 2201) {

        populateTeamTotalsPricingScreen(json_data, sidebar_data_dict);

    } else if (pricing_market_id == 2202) {

        populateH2HTeamWinTotalPricingScreeen(json_data, sidebar_data_dict);

    } else if (pricing_market_id == 2301) {

        populateConferenceExactaOddsPricingTable(json_data, sidebar_data_dict);
        
    }else {

        console.log("Pricing market not recognized: ", pricing_market_id);
    }

    //Hide loading animation
    stopLoadingAnimation();

}

function CalcVig(vig, n, vig_type_id, base_prob) {

    //Power Method
    if (vig_type_id === 1) {

        let k = Math.log(n) / (Math.log(n / (vig + 1)));

        return base_prob ** (1 / k);
    
    //Multiplicative method
    } else if (vig_type_id === 2) {

        return (1 + vig) * base_prob;
    
    //Additive Method
    } else if (vig_type_id === 3) {

        return (vig / n) + base_prob;

    } else {

        console.log('Vig type id not found')
    }

}

function AddVigToPricing(vig_int, vig_type_id, pricing_probs) {

    let vig_percent = vig_int / 100;
    let n = pricing_probs.length;

    for (let i = 0; i < pricing_probs.length; i++) {

        let base_prob = pricing_probs[i]['win_probability'];

        let prob_with_vig = CalcVig(vig_percent, n, vig_type_id, base_prob);

        pricing_probs[i]['probability_with_vig'] = prob_with_vig;

    }

    return pricing_probs
}

function populateVigSettingValues(sidebar_data_dict, pricing_market_id) {

    //Vig  Handlers
    let vig_percent_input = d3.select("#vig_percent_input")
            .property('value', function() {

                return sidebar_data_dict.user_market_vig_map[pricing_market_id]['market_vig_percent'];

            })
            .on('change', function() {

                let vig_int = parseInt(this.value);

                sidebar_data_dict.user_market_vig_map[pricing_market_id]['market_vig_percent'] = vig_int;

            });

    let vig_method_dropdown = d3.select("#vig_method_dropdown")
            .property('value', function() {

                return sidebar_data_dict.user_market_vig_map[pricing_market_id]['market_vig_type'];

            })
            .on('click', function() {

                let vig_type_id = parseInt(this.value);

                sidebar_data_dict.user_market_vig_map[pricing_market_id]['market_vig_type'] = vig_type_id;

            })

    let vig_save_button = d3.select("#save_vig_button")
                                                    .on('click', function() {

                                                        sendSaveMarketVigRequest(server_api_url, user_id, sidebar_data_dict) 

                                                    });

}

//**************************HELPER FNS********************************************/

function convertProbToAmericanOdds(probability) {
    // if (probability < 0 || probability > 1) {
    //     throw new Error('Probability must be between 0 and 1');
    // }

    if (probability <= 0) {
        return "∞";
    }

    if (probability >= 1) {
        return "-∞";
    }

    if (probability < 0.5) {

        let american_odds_int = (Math.round(100 / probability) - 100);

        //Round lower numbers to nearest 5, then to the 10, then 50, then 100
        if (american_odds_int < 120) {

            return "+" + american_odds_int;
        } else if (american_odds_int < 200) {

            return "+" + Math.round(american_odds_int / 5) * 5;
        } else if (american_odds_int < 500) {

            return "+" + Math.round(american_odds_int / 10) * 10;
        } else if (american_odds_int < 1000) {
            
            return "+" + Math.round(american_odds_int / 50) * 50;
        } else {

            return "+" + Math.round(american_odds_int / 100) * 100;
        }
    } 

    let american_odds_int =  (Math.round((probability * 100) / (1 - probability)) * -1)

    //Round lower numbers to nearest 5, then to the 10, then 50, then 100
    if (american_odds_int > -120) {

        return american_odds_int;
    } else if (american_odds_int > -200) {

        return Math.round(american_odds_int / 5) * 5;
    } else if (american_odds_int > -500) {

        return Math.round(american_odds_int / 10) * 10;
    } else if (american_odds_int > -1000) {
        
        return Math.round(american_odds_int / 50) * 50;
    } else {

        return Math.round(american_odds_int / 100) * 100;
    }
    
}

function adjEloRating(team_id, team_elo_rating, elo_slider_x_scale, sidebar_data_dict) {

    team_elo_rating = parseInt(team_elo_rating)

    let elo_slider_handle = d3.select("#team_elo_slider_handle_" + team_id);
    let elo_slider_rating_text = d3.select("#team_elo_slider_rating_text_" + team_id);

    elo_slider_handle.attr('cx', elo_slider_x_scale(team_elo_rating));
    elo_slider_rating_text.text(team_elo_rating)

    sidebar_data_dict.user_elo_map[team_id] = team_elo_rating;


}

function displayUserEloSavedMessage() {

    d3.select('#save_elo_success_text').transition()
                    .duration(50) // Fade in duration (1 second)
                    .style("opacity", 1)
                    .on("end", function() {
                    // Pause for 3 seconds
                    setTimeout(() => {
                        d3.select(this).transition()
                        .duration(50) // Fade out duration (1 second)
                        .style("opacity", 0);
                    }, 3000); // 5 seconds
                    });
};

function displayUserHomefieldAdjSavedMessage() {

    d3.select("#homefield_save_button_success_text")
            .transition()
            .duration(50)
            .style("opacity", 1)
            .on("end", function() {
                // Pause for 3 seconds
                setTimeout(() => {
                    d3.select(this).transition()
                    .duration(50) // Fade out duration (1 second)
                    .style("opacity", 0);
                }, 3000); // 5 seconds
                });

};

function displayUserGameAdjSavedMessage() {

    d3.select("#game_adj_save_button_success_text")
            .transition()
            .duration(50)
            .style("opacity", 1)
            .on("end", function() {
                // Pause for 3 seconds
                setTimeout(() => {
                    d3.select(this).transition()
                    .duration(50) // Fade out duration (1 second)
                    .style("opacity", 0);
                }, 3000); // 5 seconds
                });

};

function displayUserMarketVigSavedMessage() {

    d3.select("#save_vig_success_text")
            .transition()
            .duration(50)
            .style("opacity", 1)
            .on("end", function() {
                // Pause for 3 seconds
                setTimeout(() => {
                    d3.select(this).transition()
                    .duration(50) // Fade out duration (1 second)
                    .style("opacity", 0);
                }, 3000); // 5 seconds
                });

}

//******************************Populate Elements FNs******************************/
function startLoadingAnimation() {

    d3.select("#loading_animation_modal").style('display', 'block');
    d3.select("#loading_animation_text")
        .remove();

    let loading_animation_div_width = 300;
    let loading_animation_div_height = 200;

    let loading_animation_svg = d3.select("#loading_animation_div")
                                                            .append('svg')
                                                            .attr('id', 'loading_animation_svg')
                                                            .attr('width', loading_animation_div_width)
                                                            .attr('height', loading_animation_div_height);

    let loading_animation_circle = loading_animation_svg.append('circle')
                                                            .attr('id', 'loading_animation_circle')
                                                            .attr('r', 30)
                                                            .attr('cx', loading_animation_div_width / 2)
                                                            .attr('cy', loading_animation_div_height / 2)
                                                            .attr('fill', 'none')
                                                            .attr('stroke', color_dict.orange)
                                                            .attr('stroke-width', 5)
                                                            .attr('stroke-dasharray', '5, 5');
                                                            

    let loading_animation_text = loading_animation_svg.append('text')
                                                            .text('Simulating Seasons')
                                                            .attr('x', loading_animation_div_width / 2)
                                                            .attr('y', loading_animation_div_height - 20)
                                                            .attr('text-anchor', 'middle')
                                                            .attr('dominant-baseline', 'baseline')
                                                            .attr('font-size', '24px')
                                                            .attr('font-weight', 500)
                                                            .attr('fill', color_dict.med_gray)
                                                            .style('font-family', 'Work Sans');

    function animateCircle() {
                                                        loading_animation_circle.transition()
                                                            .duration(1500)
                                                            .ease(d3.easeLinear)
                                                            .attrTween("stroke-dasharray", function () {
                                                                let len = this.getTotalLength();
                                                                return function (t) {
                                                                    return (t * len) + ", " + (len - (t * len));
                                                                };
                                                            })
                                                            .on("end", function () {
                                                                // Use setTimeout for a delay before the next iteration
                                                                setTimeout(animateCircle, 300);
                                                            });
                                                    }

    animateCircle();

}

function stopLoadingAnimation() {

    //Phase out loading animation
    d3.select("#loading_animation_svg").transition()
                                                            .duration(300)
                                                            .style('opacity', 0)
                                                            .on('end', function() {

                                                                d3.select(this).remove();

                                                            });

    d3.select("#loading_animation_modal").style('display', 'none');

}

function populateSidebarEloSliders(sidebar_data_dict, conference_id) {

    let sidebar_svg = d3.select("#sidebar_svg");

    let elo_slider_g = d3.select("#elo_slider_g");              
    
    //Remove any pre existing elements
    elo_slider_g.selectAll("*").remove();

    //Create elo data array
    let conference_team_id_array = sidebar_data_dict.conference_team_map[conference_id];

    let elo_data_array = [];

    conference_team_id_array.forEach(team_id => {

        let append_dict = {
            "team_id": team_id,
            "team_name": sidebar_data_dict.team_info_map[team_id].team_abbrev,
            "user_elo_rating": sidebar_data_dict.user_elo_map[team_id],
        }

        elo_data_array.push(append_dict)

    });

    //Sort By ELO's descending
    let sorted_elo_data_array = elo_data_array.sort((a,b) => d3.descending(a.user_elo_rating, b.user_elo_rating,));

    console.log(sorted_elo_data_array);
                            
    //Create Sliders
    let elo_slider_height = 34;
    let elo_slider_width = parseInt(base_sidebar_width * .75);
    let elo_slider_padding_left = 50;

    let team_elo_slider_g = elo_slider_g.selectAll(".team_elo_slider_g")
                                                            .data(sorted_elo_data_array)
                                                            .enter()
                                                            .append('g')
                                                            .attr("class", "team_elo_slider_g")
                                                            .attr('transform', function(d, i) {

                                                                let elo_slider_y = i * elo_slider_height;

                                                                return 'translate(0,' + elo_slider_y + ')';

                                                            })
                                                            .attr('id', function(d) {

                                                                return 'elo_slider_team_' + d.team_id;
                                                            });

    let team_elo_slider_bg = team_elo_slider_g.append('rect')
                                                            .attr('width', elo_slider_width)
                                                            .attr('height', elo_slider_height)
                                                            .attr('fill', color_dict.charcoal);

    let team_elo_slider_team_text = team_elo_slider_g.append('text')
                                                            .text(d => d.team_name)
                                                            .attr('x', 3)
                                                            .attr('y', elo_slider_height / 2)
                                                            .attr('dominant-baseline', 'middle')
                                                            .attr('font-size', '14px')
                                                            .style("font-weight", 500)
                                                            .style("font-family", 'Work Sans')
                                                            .attr('fill', color_dict.light_gray);

    //Team Elo Slider
    let min_slider_elo= 700;
    let max_slider_elo = 2350;
    let elo_slider_step = 10;

    let elo_slider_x_scale = d3.scaleLinear()
                                                            .domain([min_slider_elo, max_slider_elo])
                                                            .range([elo_slider_padding_left, elo_slider_width])
                                                            .clamp(true);

    let team_elo_slider_track = team_elo_slider_g.append('line', '.team_elo_slider_track_overlays')
                                                                .attr('id', function(d) {
                                                                    return "team_elo_slider_track_" + d.team_id;
                                                                })
                                                                .attr('x1', elo_slider_x_scale.range()[0])
                                                                .attr('x2', elo_slider_x_scale.range()[1])
                                                                .attr('y1', elo_slider_height / 2)
                                                                .attr('y2', elo_slider_height / 2)
                                                                .attr('stroke', color_dict.black)
                                                                .attr('stroke-width', '1px')
                                                                .style('shape-rendering', 'CrispEdges')
                                                        .select(function() {
                                                            return this.parentNode.appendChild(this.cloneNode(true));
                                                        })
                                                                .attr('id', function(d) {
                                                                    return 'team_elo_slider_track_inset_' + d.team_id;
                                                                })
                                                        .select(function() {
                                                            return this.parentNode.appendChild(this.cloneNode(true));
                                                        })
                                                                .attr("id", function(d) {
                                                                    return 'team_elo_slider_track_overlay' + d.team_id;
                                                                })
                                                                .attr('class', 'team_elo_slider_track_overlays')
                                                                .call(d3.drag()
                                                                        .on('start.interrupt', function() {team_elo_slider_g.interrupt();})
                                                                        .on('start drag', function(d) {

                                                                            adjEloRating(
                                                                                d.team_id, 
                                                                                elo_slider_x_scale.invert(d3.event.x), 
                                                                                elo_slider_x_scale,
                                                                                sidebar_data_dict,
                                                                            );

                                                                        }));
    
    let team_elo_slider_ticks = team_elo_slider_g.insert('g', '.team_elo_slider_track_overlays')
                                                                        .attr('class', 'team_elo_slider_ticks')
                                                                        .attr('transform', 'translate(0,' + (elo_slider_height - 5) + ')')
                                                                        .selectAll('text')
                                                                        .data(elo_slider_x_scale.ticks(3))
                                                                        .enter()
                                                                        .append('text')
                                                                        .attr('font-size', '10px')
                                                                        .style('font-family', "Work Sans")
                                                                        .attr('x', elo_slider_x_scale)
                                                                        .attr('text-anchor', 'middle')
                                                                        .attr('fill', color_dict.med_gray)
                                                                        .style('shape-rendering', 'CrispEdges')
                                                                        .text(d => d);

    let team_elo_slider_handle = team_elo_slider_g.insert("circle", ".team_elo_slider_track_overlays")
                                                                        .attr('id', function(d) {
                                                                            return "team_elo_slider_handle_" + d.team_id;
                                                                        })
                                                                        .attr('r', 5)
                                                                        .attr('cy', elo_slider_height / 2)
                                                                        .attr('cx', function(d) {

                                                                            let user_elo_rating = sidebar_data_dict.user_elo_map[d.team_id];

                                                                            return elo_slider_x_scale(user_elo_rating);

                                                                        })
                                                                        .attr('fill', color_dict.orange)
                                                                        .attr('stroke', color_dict.black)
                                                                        .attr('stroke-width', '1px')
                                                                        .style('cursor', 'pointer');
    
    let team_elo_slider_rating_text = team_elo_slider_g.append('text')
                                                                        .attr('id', function(d) {
                                                                            return "team_elo_slider_rating_text_" + d.team_id;
                                                                        })
                                                                        .attr('x', elo_slider_width + 10)
                                                                        .attr('y',  elo_slider_height / 2)
                                                                        .attr('text-anchor', 'start')
                                                                        .attr('dominant-baseline', 'middle')
                                                                        .attr('font-size', '14px')
                                                                        .attr('fill', color_dict.light_gray)
                                                                        .style('font-family', 'Work Sans')
                                                                        .text(d => {

                                                                            let user_elo_rating = sidebar_data_dict.user_elo_map[d.team_id];

                                                                            return user_elo_rating;
                                                                        });

    let team_elo_slider_team_info_chevron = team_elo_slider_g.append('text')
                                                                        .text(function() {return '\uf054'})
                                                                        .attr('id', function(d) {
                                                                            return "team_elo_slider_team_info_chevron_" + d.team_id;
                                                                        })
                                                                        .attr('x', elo_slider_width + 50)
                                                                        .attr('y',  elo_slider_height / 2)
                                                                        .attr('text-anchor', 'start')
                                                                        .attr('dominant-baseline', 'middle')
                                                                        .attr('class', 'font_awesome_text_icon')
                                                                        .attr('font-size', '10px')
                                                                        .attr('fill', color_dict.med_gray)
                                                                        .style('cursor', 'pointer')
                                                                        .on('mouseover', function(){

                                                                            d3.select(this).attr('fill', color_dict.orange);

                                                                        })
                                                                        .on('mouseout', function() {

                                                                            d3.select(this).attr('fill', color_dict.med_gray);

                                                                        })
                                                                        .on('click', function(d) {

                                                                            openTeamSettingsSidebar(d.team_id, sidebar_data_dict);

                                                                        });


    //Save Elo values button
    let save_elo_values_button_top = -40;
    let save_elo_values_button_width = 120;
    let save_elo_values_button_height = 24;
    let save_elo_values_button_left = 0;

    let save_elo_values_button_g = elo_slider_g.append('g')
                                                                        .attr('id', 'save_elo_values_button_g')
                                                                        .attr('transform', 'translate(' + save_elo_values_button_left + ',' + save_elo_values_button_top + ')')
                                                                        .style('cursor', 'pointer')
                                                                        .on('click', function() {

                                                                            sendSaveEloRatingsRequest(server_api_url, user_id, sidebar_data_dict);

                                                                        })

    let save_elo_values_button_bg = save_elo_values_button_g.append('rect')
                                                                        .attr('id', 'save_elo_values_button_bg')
                                                                        .attr('width', save_elo_values_button_width)
                                                                        .attr('height', save_elo_values_button_height)
                                                                        .attr('fill', color_dict.orange)
                                                                        .attr('rx', 15)
                                                                        .attr('ry', 15)
                                                                        .style('shape-rendering', 'CrispEdges');

    let save_elo_values_button_text = save_elo_values_button_g.append('text')
                                                                        .text("Save Ratings")
                                                                        .attr('x', save_elo_values_button_width / 2)
                                                                        .attr('y', save_elo_values_button_height / 2)
                                                                        .attr('text-anchor', 'middle')
                                                                        .attr('dominant-baseline', 'middle')
                                                                        .attr('font-size', '14px')
                                                                        .attr('fill', color_dict.light_gray)
                                                                        .style('font-weight', 500)
                                                                        .style('font-family', "Work Sans")
                                                                        .style('shape-rendering', 'CrispEdges');

    let save_elo_success_text = save_elo_values_button_g.append('text')
                                                                        .text("User Elo Ratings Saved")
                                                                        .attr('x', save_elo_values_button_width + 30)
                                                                        .attr('y', save_elo_values_button_height / 2)
                                                                        .attr('id', 'save_elo_success_text')
                                                                        .attr('text-anchor', 'start')
                                                                        .attr('dominant-baseline', 'middle')
                                                                        .attr('font-size', '12px')
                                                                        .style('font-weight', 500)
                                                                        .style('font-family', "Work Sans")
                                                                        .attr('fill', color_dict.orange)
                                                                        .style('opacity', 0);

}

function closeTeamSettingsSidebar() {

    let sidebar_div = d3.select("#sidebar_contents");
    let sidebar_svg = d3.select("#sidebar_svg");

    //remove team settings g
    d3.select("#team_settings_g").remove();

    //extend sidebar div and svg
    sidebar_div.transition()
                        .duration(100)
                        .attr('width', base_sidebar_width)
                        .attr('status', 'normal');

    sidebar_svg.transition()
                        .duration(100)
                        .attr('width', base_sidebar_width);

}

function populateTeamSchedule(json_data, sidebar_data_dict, team_id) {

    //verify data is sorted by week
    sorted_schedule_data = json_data['team_schedule'].sort((a,b) => d3.ascending(
        a.week,
        b.week,
        ));


    let team_schedule_g = d3.select("#team_schedule_g");

    let team_schedule_row_height = 40;
    let team_schedule_row_width = 380;

    let team_schedule_rows = team_schedule_g.selectAll('.team_schedule_row')
                                                                    .data(sorted_schedule_data)
                                                                    .enter()
                                                                    .append('g')
                                                                    .attr('id', function(d) {
                                                                        return 'team_schedule_row_week_' + d.week;
                                                                    })
                                                                    .attr('transform', function(d, i) {

                                                                        let team_schedule_row_y = (i * team_schedule_row_height) + 50;

                                                                        return 'translate(26, ' + team_schedule_row_y + ')';

                                                                    });

    let team_schedule_row_bg = team_schedule_rows.append('rect')
                        .attr('width', team_schedule_row_width)
                        .attr('height', team_schedule_row_height)
                        .attr('fill', color_dict.charcoal);

    //Insert team game adjustments 
    let game_adj_input_height = 20;
    let game_adj_input_width = 50;
    let team_schedule_game_adj_foreign_obj = team_schedule_rows.append("foreignObject")
                                                            .attr('x', 0)
                                                            .attr('y', team_schedule_row_height / 2 - (game_adj_input_height / 2))
                                                            .attr('width', game_adj_input_width + 'px')
                                                            .attr('height', game_adj_input_height + 'px')
                                                            .attr('id', d => {

                                                                return 'team_schedule_game_adj_' + d.game_id;

                                                            });


    let team_schedule_game_adj_input = team_schedule_game_adj_foreign_obj.append('xhtml:input')
                                                            .attr('type', 'number')
                                                            .attr('min', '-14')
                                                            .attr('max', '14')
                                                            .attr('step', '0.25')
                                                            .attr("value", d => {

                                                                if (team_id === d.away_team_id) {

                                                                    return sidebar_data_dict.user_game_adj_map[d.game_id]['away_team_spread_adj'];

                                                                } else if (team_id === d.home_team_id) {

                                                                    return sidebar_data_dict.user_game_adj_map[d.game_id]['home_team_spread_adj'];

                                                                } else {

                                                                    console.log('Game Adj team id not matched on load.');

                                                                    return 0;
                                                                }

                                                            })
                                                            .style('width', '99%')
                                                            .style('height', '99%')
                                                            .style('background-color', color_dict.black)
                                                            .style('color', color_dict.light_gray)
                                                            .style('border', 'none')
                                                            .on('change', function(d) {

                                                                let new_value = parseFloat(this.value);

                                                                if (team_id === d.away_team_id) {

                                                                    sidebar_data_dict.user_game_adj_map[d.game_id]['away_team_spread_adj'] = new_value;

                                                                } else if (team_id === d.home_team_id) {

                                                                    sidebar_data_dict.user_game_adj_map[d.game_id]['home_team_spread_adj'] = new_value;

                                                                } else {

                                                                    console.log('Game Adj team id not matched on click.');

                                                                }

                                                            });

    let team_schedule_away_team_text = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        if (d.away_team_id in sidebar_data_dict.team_abbrev_map) {

                                                                            return sidebar_data_dict.team_abbrev_map[d.away_team_id];

                                                                        } else {

                                                                            return "";
                                                                        }
                                                                    })
                                                                    .attr('x', team_schedule_row_width / 2 - 20)
                                                                    .attr('y', team_schedule_row_height / 2)
                                                                    .attr('text-anchor', 'end')
                                                                    .attr('dominant-baseline', 'middle')
                                                                    .attr('font-size', '14px')
                                                                    .attr('fill', color_dict.light_gray)
                                                                    .style('font-weight', 500);

    let team_schedule_at_text = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        if (d.neutral_site) {
                                                                            return 'v';
                                                                        } else {
                                                                            return "@"
                                                                        };
                                                                    })
                                                                    .attr('x', team_schedule_row_width / 2)
                                                                    .attr('y', team_schedule_row_height / 2)
                                                                    .attr('text-anchor', 'middle')
                                                                    .attr('dominant-baseline', 'middle')
                                                                    .attr('font-size', '16px')
                                                                    .attr('fill', color_dict.light_gray)
                                                                    .style('font-weight', 500);

    let team_schedule_home_team_text = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        if (d.home_team_id in sidebar_data_dict.team_abbrev_map) {

                                                                            return sidebar_data_dict.team_abbrev_map[d.home_team_id];

                                                                        } else {

                                                                            return "";
                                                                        }
                                                                    })
                                                                    .attr('x', team_schedule_row_width / 2 + 20)
                                                                    .attr('y', team_schedule_row_height / 2)
                                                                    .attr('text-anchor', 'start')
                                                                    .attr('dominant-baseline', 'middle')
                                                                    .attr('font-size', '14px')
                                                                    .attr('fill', color_dict.light_gray)
                                                                    .style('font-weight', 500);

    let team_schedule_start_date_text = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        let first_space_index = d.start_date.indexOf(" ");

                                                                        if (first_space_index !== -1) {

                                                                            return d.start_date.substring(0, first_space_index);
                                                                        }
                                                                    })
                                                                    .attr('x', team_schedule_row_width / 2)
                                                                    .attr('y', team_schedule_row_height)
                                                                    .attr('text-anchor', 'middle')
                                                                    .attr('font-size', '10px')
                                                                    .attr('fill', color_dict.light_gray)
                                                                    .style('font-weight', 300);

    let format_number = d3.format(".2f");

    let team_schedule_away_team_spread = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        if (d.away_team_spread > 0) {

                                                                            return "+" + format_number(d.away_team_spread);
                                                                        } else {

                                                                            return format_number(d.away_team_spread);
                                                                        };

                                                                    })
                                                                    .attr('x', 70)
                                                                    .attr('y', team_schedule_row_height / 2)
                                                                    .attr('dominant-baseline', 'middle')
                                                                    .attr('font-size', '12px')
                                                                    .style('font-weight', 500)
                                                                    .attr('fill', color_dict.light_gray);

    let team_schedule_home_team_spread = team_schedule_rows.append('text')
                                                                    .text(function(d) {

                                                                        if (d.home_team_spread > 0) {

                                                                            return "+" + format_number(d.home_team_spread);
                                                                        } else {

                                                                            return format_number(d.home_team_spread);
                                                                        };

                                                                    })
                                                                    .attr('x', team_schedule_row_width - 65)
                                                                    .attr('y', team_schedule_row_height / 2)
                                                                    .attr('dominant-baseline', 'middle')
                                                                    .attr('text-anchor', 'end')
                                                                    .attr('font-size', '12px')
                                                                    .style('font-weight', 500)
                                                                    .attr('fill', color_dict.light_gray);

    //Save Game Adj button

}

function openTeamSettingsSidebar(team_id, sidebar_data_dict) {

    let sidebar_div = d3.select("#sidebar_contents");
    let sidebar_height = sidebar_div.node().getBoundingClientRect().height;

    let sidebar_svg = d3.select("#sidebar_svg");
    let team_settings_width = 380;

    //extend sidebar div and svg if not already extending
    if (sidebar_div.attr('status') != "expanded") {

        sidebar_div.transition()
                            .duration(100)
                            .attr('width', base_sidebar_width + team_settings_width)
                            .attr('status', 'expanded')

        sidebar_svg.transition()
                            .duration(100)
                            .attr('width', base_sidebar_width + team_settings_width)
    } 

    //Remove if team settings g exists
    d3.select("#team_settings_g").remove();

    //Add team settings g
    let team_settings_left = base_sidebar_width;
    let team_settings_top = 20;
    let team_settings_left_margin = 25;

    let team_settings_g = sidebar_svg.append('g')
                                                            .attr('id', 'team_settings_g')
                                                            .attr('transform', 'translate(' + team_settings_left + ',' + team_settings_top + ')');

    let team_settings_divide_line = team_settings_g.append('line')
                                                            .attr('x1', 5)
                                                            .attr('x2', 5)
                                                            .attr('y1', 0)
                                                            .attr('y2', sidebar_height * .8)
                                                            .attr('stroke', color_dict.dark_gray)
                                                            .attr('stroke-width', '1px')
                                                            .style('shape-rendering', 'CrispEdges');

    let team_settings_close_x = team_settings_g.append('text')
                                                            .text(function() {return "\uf00d"})
                                                            .attr('x', team_settings_width - 10)
                                                            .attr('y', 0)
                                                            .attr('font-size', '16px')
                                                            .style('font-weight', 300)
                                                            .attr('text-anchor', 'end')
                                                            .attr('class', 'font_awesome_text_icon')
                                                            .attr('fill', color_dict.orange)
                                                            .style('cursor', 'pointer')
                                                            .on("click", function() {

                                                                closeTeamSettingsSidebar();

                                                            });
    
    let team_settings_logo_img = team_settings_g.append("svg:image")
                                                            .attr("id", "team_settings_logo_img")
                                                            .attr('x', team_settings_left_margin)
                                                            .attr('y',  0)
                                                            .attr('width', '90px')
                                                            .attr('xlink:href', function() {

                                                                return sidebar_data_dict.team_info_map[team_id]['team_logo_url'];

                                                            });

    let team_settings_team_name = team_settings_g.append('text')
                                                            .text( function() {

                                                                return sidebar_data_dict.team_info_map[team_id]['team_name'];

                                                            })
                                                            .attr("id", "team_settings_team_name")
                                                            .attr('font-size', '24px')
                                                            .attr('font-weight', 500)
                                                            .style('font-family', 'Work Sans')
                                                            .attr('x', team_settings_left_margin)
                                                            .attr('y', 95)
                                                            .attr('fill', color_dict.light_gray)
                                                            .attr('dominant-baseline', 'hanging');

    let team_homefield_adv_top = 135;
    
    let team_settings_homefield_adv_text = team_settings_g.append("text")
                                                            .text("Home Field Adv")
                                                            .attr("x", team_settings_left_margin)
                                                            .attr('y', team_homefield_adv_top)
                                                            .attr('font-size', '14px')
                                                            .attr('font-weight', 500)
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('fill', color_dict.light_gray);

    let team_settings_homefield_adv_foreign_obj = team_settings_g.append("foreignObject")
                                                            .attr('x', team_settings_left_margin + 120)
                                                            .attr('y', team_homefield_adv_top - 8)
                                                            .attr('width', '50px')
                                                            .attr('height', '24px')
                                                            
   

    let team_settings_homefield_adv_input = team_settings_homefield_adv_foreign_obj.append('xhtml:input')
                                                            .attr('type', 'number')
                                                            .attr('min', '-7')
                                                            .attr('max', '0')
                                                            .attr('step', '0.1')
                                                            .attr("value", sidebar_data_dict.user_homefield_adj_map[team_id])
                                                            .style('width', '99%')
                                                            .style('height', '99%')
                                                            .style('background-color', color_dict.black)
                                                            .style('color', color_dict.light_gray)
                                                            .style('border', 'none')
                                                            .style('font-size', '14px')
                                                            .on('click', function() {

                                                                let new_value = parseFloat(this.value);

                                                                sidebar_data_dict.user_homefield_adj_map[team_id] = new_value;

                                                            });

    let homefield_save_button_left = team_settings_left_margin + 190;
    let homefield_save_button_top = team_homefield_adv_top - 8;
    let homefield_save_button_width = 130;
    let homefield_save_button_height = 20;

    let homefield_save_button_g = team_settings_g.append('g')
                                                            .attr('id', 'team_setting_homefield_save_button_g')
                                                            .attr('transform', 'translate(' + homefield_save_button_left + ', ' + homefield_save_button_top + ')')
                                                            .style('cursor', 'pointer')
                                                            .on('click', function() {

                                                                sendSaveHomefieldAdjRequest(server_api_url, user_id, sidebar_data_dict) 

                                                            });

    let homefield_save_button_bg = homefield_save_button_g.append('rect')
                                                            .attr('x', 0)
                                                            .attr('y', 0)
                                                            .attr('width', homefield_save_button_width)
                                                            .attr('height', homefield_save_button_height)
                                                            .attr('fill', color_dict.orange)
                                                            .attr('rx', 12)
                                                            .attr('ry', 12)
                                                            .style('shape-rendering', 'CrispEdges');

    let homefield_save_button_text = homefield_save_button_g.append('text')
                                                            .text("Save Homefield Adv")
                                                            .attr('x', homefield_save_button_width / 2)
                                                            .attr('y', homefield_save_button_height / 2)
                                                            .attr('dominant-baseline', 'middle')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '12px')
                                                            .attr('fill', color_dict.light_gray)
                                                            .style('font-weight', 500)
                                                            .style('font-family', "Work Sans");

    let homefield_save_button_success_text = homefield_save_button_g.append('text')
                                                            .text("Homefield Adj Saved")
                                                            .attr('x', homefield_save_button_width / 2)
                                                            .attr('y', -5)
                                                            .attr('id', 'homefield_save_button_success_text')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '12px')
                                                            .style('font-weight', 500)
                                                            .style('font-family', "Work Sans")
                                                            .attr('fill', color_dict.orange)
                                                            .style('opacity', 0);
                                                            
    //Add Schedule
    let team_schedule_top = 140;

    let team_schedule_g = team_settings_g.append('g')
                                                            .attr("id", "team_schedule_g")
                                                            .attr('transform', 'translate(0,' + team_schedule_top + ')');

    //Send team schedule request
    fetchTeamSchedule(server_api_url, user_id, sidebar_data_dict, team_id)

    let team_schedule_text_header = team_schedule_g.append('text')
                                                            .text(function() {

                                                                return sidebar_data_dict.team_info_map[team_id]['team_mascot'] + ' Schedule';

                                                            })
                                                            .attr('x', team_settings_left_margin)
                                                            .attr('y', 20)
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('font-size', '14px')
                                                            .attr("fill", color_dict.light_gray)
                                                            .style('font-weight', 500);

    let team_schedule_adj_text = team_schedule_g.append('text')
                                                            .text("Spread Adj")
                                                            .attr('x', team_settings_left_margin)
                                                            .attr('y', 40)
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('text-anchor', 'start')
                                                            .attr('font-size', '10px')
                                                            .attr('font-weight', 500)
                                                            .attr('fill', color_dict.light_gray);
    
    let team_schedule_away_spread_text = team_schedule_g.append('text')
                                                            .text("Away Spread")
                                                            .attr('x', 116)
                                                            .attr('y', 40)
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '10px')
                                                            .attr('font-weight', 500)
                                                            .attr('fill', color_dict.light_gray);

    let team_schedule_home_spread_text = team_schedule_g.append('text')
                                                            .text("Home Spread")
                                                            .attr('x', team_settings_width - 55)
                                                            .attr('y', 40)
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '10px')
                                                            .attr('font-weight', 500)
                                                            .attr('fill', color_dict.light_gray);

    //Game Adj Save Button
    let game_adj_save_button_width = 120;
    let game_adj_save_button_height = 20;
    let game_adj_save_button_left = team_settings_left_margin;
    let game_adj_save_button_top = sidebar_height - 110 - game_adj_save_button_height;
   

    let game_adj_save_button_g = team_settings_g.append('g')
                                                            .attr('id', 'team_setting_game_adj_save_button_g')
                                                            .attr('transform', 'translate(' + game_adj_save_button_left + ', ' + game_adj_save_button_top + ')')
                                                            .style('cursor', 'pointer')
                                                            .on('click', function() {

                                                                sendSaveGameAdjRequest(server_api_url, user_id, sidebar_data_dict) 

                                                            });

    let game_adj_save_button_bg = game_adj_save_button_g.append('rect')
                                                            .attr('x', 0)
                                                            .attr('y', 0)
                                                            .attr('width', game_adj_save_button_width)
                                                            .attr('height', game_adj_save_button_height)
                                                            .attr('rx', 12)
                                                            .attr('ry', 12)
                                                            .attr('fill', color_dict.orange)
                                                            .style('shape-rendering', 'CrispEdges');

    let game_adj_save_button_text = game_adj_save_button_g.append('text')
                                                            .text("Save Spread Adj")
                                                            .attr('x', game_adj_save_button_width / 2)
                                                            .attr('y', game_adj_save_button_height / 2)
                                                            .attr('dominant-baseline', 'middle')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '12px')
                                                            .attr('fill', color_dict.light_gray)
                                                            .style('font-weight', 500)
                                                            .style('font-family', "Work Sans");

    let game_adj_save_button_success_text = game_adj_save_button_g.append('text')
                                                            .text("Homefield Adj Saved")
                                                            .attr('x', game_adj_save_button_width / 2)
                                                            .attr('y', game_adj_save_button_height + 5)
                                                            .attr('id', 'game_adj_save_button_success_text')
                                                            .attr('dominant-baseline', 'hanging')
                                                            .attr('text-anchor', 'middle')
                                                            .attr('font-size', '12px')
                                                            .style('font-weight', 500)
                                                            .style('font-family', "Work Sans")
                                                            .attr('fill', color_dict.orange)
                                                            .style('opacity', 0);
     
}

function toggleConferenceDropdown(sidebar_data_dict,  conference_dropdown_width) {
    let conference_dropdown_g = d3.select("#conference_dropdown_g");
    let conference_dropdown_options_g = conference_dropdown_g.select("#conference-dropdown-options-g");

    let sorted_option_data = d3.nest()
                                                        .key((d) => d.conference_name)
                                                        .sortKeys(d3.ascending)
                                                        .entries(sidebar_data_dict.conferences)
                                                        .map((group) => group.values)
                                                        .flat();

    //Create options group if doesn't exist
    if (conference_dropdown_options_g.empty()) {

        let dropdown_row_height = 40;

        let conference_dropdown_options_g = conference_dropdown_g.append("foreignObject")
                                                    .attr("id", "conference-dropdown-options-g")
                                                    .attr('width', conference_dropdown_width + 2)
                                                    .attr('height', sorted_option_data.length * dropdown_row_height);

        let conference_options = conference_dropdown_options_g.selectAll("div")
                                                    .data(sorted_option_data)
                                                    .enter()
                                                    .append("xhtml:div")
                                                    .style("cursor", "pointer")
                                                    .style('background-color', color_dict.black)
                                                    .style('padding', '5px')
                                                    .style('display', 'flex')
                                                    .style('font-size', '14px')
                                                    .style('justify-conent', 'center')
                                                    .style('align-items', 'center')
                                                    .style('text-align', 'center')
                                                    .attr("font-size", "20px")
                                                    .style("font-weight", 400)
                                                    .style("font-family", "Work Sans")
                                                    .attr('rx', 10)
                                                    .attr('ry', 10)
                                                    .text(d => d.conference_name)
                                                    .on("click", function(d) {

                                                        d3.select('#conference_selected_option_text').text(d.conference_name);
                                                        toggleConferenceDropdown(sidebar_data_dict,  conference_dropdown_width);

                                                        //Populate sliders
                                                        populateSidebarEloSliders(sidebar_data_dict, d.conference_id);
                                                    })
    } else {

        d3.selectAll('#conference-dropdown-options-g').remove();

    }
}

function drawSidebarContents(sidebar_data_dict) {
    let width = d3.select('#viz').node().getBoundingClientRect().width;
    let height = d3.select('#viz').node().getBoundingClientRect().height;
    let navbar_height = d3.select('#navbar').node().getBoundingClientRect().height;
    let sidebar_height = d3.select('#sidebar_contents').node().getBoundingClientRect().height;
    let sidebar_margin_dict = {top: 10, bottom: 0, left: 10, right: 8};

    let sidebar_svg = d3.select('#sidebar_contents')
                            .append('svg')
                            .attr('id', 'sidebar_svg')
                            .attr('width', base_sidebar_width)
                            .attr('height', height - navbar_height);

    //Draw slider g first so  ratings drop down is above it
    sidebar_svg.append('g')
            .attr('transform', 'translate(' + 20 + ',' + 130 + ')')
            .attr('id', 'elo_slider_g');

    let rating_g = sidebar_svg.append("g")
                                                .attr("id", "rating_g")
                                                .attr("transform", "translate("+ 10 + "," + sidebar_margin_dict.top + ")");

    let rating_heading = rating_g.append("text")
                                                        .text("Team ELO Ratings")
                                                        .attr("id", "rating_header")
                                                        .attr("x", (base_sidebar_width - sidebar_margin_dict.left) / 2)
                                                        .attr("y", sidebar_margin_dict.top)
                                                        .attr("fill", color_dict.light_gray)
                                                        .attr("text-anchor", "middle")
                                                        .attr("dominant-baseline", "middle")
                                                        .attr("font-size", "20px")
                                                        .style("font-weight", 400)
                                                        .style("font-family", "Work Sans")
                                                        .style("position", "fixed");

    //Dropdown Params
    let conference_dropdown_width = 240;
    let conference_dropdown_height = 32;  
    let conference_dropdown_header_padding = 10;                           
    let conference_dropdown_top = sidebar_margin_dict.top + 10;
    let conference_dropdown_left = (base_sidebar_width - sidebar_margin_dict.left) / 2 - (conference_dropdown_width / 2);
    let conference_dropdown_option_text_x = conference_dropdown_width / 2;
    let conference_dropdown_option_text_y = conference_dropdown_header_padding + conference_dropdown_height / 2 + 1;

    let conference_dropdown_g = rating_g.append("g")
                                                                    .attr('id', 'conference_dropdown_g')
                                                                    .attr('transform', 'translate(' + conference_dropdown_left + "," + conference_dropdown_top + ")")
                                                                    .style('cursor', 'pointer');


    let conference_dropdown_click_g = conference_dropdown_g.append('g')
                                                                            .attr("id", 'conference_dropdown_click_g')
                                                                            .on("click", function() {

                                                                                toggleConferenceDropdown( 
                                                                                    sidebar_data_dict,
                                                                                    conference_dropdown_width,
                                                                                );
                                                                            });

    let conference_dropdown_bg = conference_dropdown_click_g.append("rect")
                                                        .attr("width", conference_dropdown_width) 
                                                        .attr("height", conference_dropdown_height)
                                                        .attr('x', 0)
                                                        .attr('y', conference_dropdown_header_padding)
                                                        .attr("fill", color_dict.black)
                                                        .attr('rx', 20)
                                                        .attr('ry', 20)
                                                        .style("cursor", "pointer")
                                                        .style('shape-rendering', 'CrispEdges');
                                                        
    let conference_dropdown_chevron = conference_dropdown_click_g.append('text')
                                                        .text(function() {return '\uf078'})
                                                        .attr('id', 'conference_dropdown_chevron')
                                                        .attr('class', 'font_awesome_text_icon')
                                                        .attr('font-size', '12px')
                                                        .style('font-weight', 300)
                                                        .attr('fill', color_dict.med_gray)
                                                        .attr('x', conference_dropdown_width - 20)
                                                        .attr('y', 20)
                                                        .attr('text-anchor', 'middle')
                                                        .attr('dominant-baseline', 'hanging');



    let conference_dropdown_selected_option_text = conference_dropdown_click_g.append('text')
                                                        .attr('x', conference_dropdown_option_text_x)
                                                        .attr('y', conference_dropdown_option_text_y)
                                                        .text("Select Conference")
                                                        .attr('id', 'conference_selected_option_text')
                                                        .attr("text-anchor", "middle")
                                                        .attr("dominant-baseline", "middle")
                                                        .attr("font-size", "16px")
                                                        .attr('fill', color_dict.light_gray)
                                                        .style("font-weight", 400)
                                                        .style("font-family", "Work Sans")
    

    let run_sim_button_width = 200;
    let run_sim_button_height = 35;
    let run_sim_button_left = (base_sidebar_width / 2) - (run_sim_button_width / 2);
    let run_sim_button_top = sidebar_height - 80 - run_sim_button_height;

    let run_sim_button_g = sidebar_svg.append('g')
                                                        .attr('id', 'run_sim_button_g')
                                                        .attr('transform', 'translate(' + run_sim_button_left + ',' + run_sim_button_top + ')')
                                                        .style('cursor', 'pointer')
                                                        .on('click', function() {

                                                            startLoadingAnimation();

                                                            sendRunSimRequest(server_api_url, user_id, sidebar_data_dict);

                                                        });
                                                        
                                    
    let run_sim_button_bg = run_sim_button_g.append('rect')
                                                        .attr('width', run_sim_button_width)
                                                        .attr('height', run_sim_button_height)
                                                        .attr('fill', color_dict.orange)
                                                        .attr('rx', 20)
                                                        .attr('ry', 20)
                                                        .style('shape-rendering', 'CrispEdges');

    let run_sim_button_text = run_sim_button_g.append('text')
                                                        .text("Run Simulation")
                                                        .attr('x', run_sim_button_width / 2)
                                                        .attr('y', run_sim_button_height / 2)
                                                        .attr('font-size', '16px')
                                                        .attr('font-weight', 500)
                                                        .attr('fill', color_dict.light_gray)
                                                        .attr('text-anchor', 'middle')
                                                        .attr('dominant-baseline', 'middle')
                                                        .style('font-family', 'Work Sans')
                                                        .style('shape-rendering', 'CrispEdges');
    
    //Populate initial sliders
    populateSidebarEloSliders(sidebar_data_dict, global_pricing_dict.division_conference_winner_display_id);
}

function createMarketSettingsHandlers(pricing_market_dict, user_id, sidebar_data_dict) {

    //Populate Market Seletion Dropdown
    //Create option values
    let market_options_array = [];

    let market_ids = Object.keys(pricing_market_dict);

    for (let market_id of market_ids) {

        market_options_array.push({
            "market_id": market_id,
            "market_title": pricing_market_dict[market_id]['market_title'],
        })
    }

    let market_select_dropdown = d3.select("#market_select_dropdown");

    market_select_dropdown.selectAll("*").remove();

    let dropdown_options = market_select_dropdown.selectAll("option")
                                                                .data(market_options_array)
                                                                .enter()
                                                                .append("option")
                                                                .text(d => d.market_title)
                                                                .attr('value', d => d.market_id);

    market_select_dropdown.on("click", function() {
                                                                    
                                                                    let market_id = parseInt(this.value);

                                                                    populateVigSettingValues(sidebar_data_dict, market_id);

                                                                    //Playoff Market
                                                                    if (market_id == 2001) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,

                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);

                                                                    } else if (market_id == 2002) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                        };

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                                                    
                                                                    } else if (market_id == 2101) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            conference_id: global_pricing_dict.conference_winner_display_id,

                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);

                                                                    } else if (market_id == 2102) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            conference_id: global_pricing_dict.division_conference_winner_display_id,
                                                                            division_id: global_pricing_dict.division_winner_display_id,
                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);

                                                                    } else if (market_id == 2103) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            bowl_id: global_pricing_dict.bowl_id,
                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                                                    
                                                                    } else if (market_id == 2201) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            team_id: global_pricing_dict.win_totals_team_id,
                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);

                                                                    } else if (market_id == 2202) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            h2h_win_params: {
                                                                                h2h_win_total_team_1_id: global_pricing_dict.h2h_win_total_team_1_id,
                                                                                h2h_win_total_team_2_id: global_pricing_dict.h2h_win_total_team_2_id,
                                                                            }
                                                                        }

                                                                        console.log(pricing_request_params);

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);

                                                                    
                                                                    } else if (market_id == 2301) {

                                                                        let pricing_request_params = {

                                                                            pricing_market_id: market_id,
                                                                            conference_id: global_pricing_dict.conference_exacta_display_id,
                                                                        }

                                                                        sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);


                                                                    } else {

                                                                        console.log("Dropdown Market id not list: ", market_id);

                                                                    }

                                                                });

//Apply Vig
populateVigSettingValues(sidebar_data_dict, global_pricing_dict.pricing_market_id);

let apply_vig_button = d3.select("#apply_vig_button");

apply_vig_button.on('click', function() {

    console.log("Apply Vig button clicked.")

    handlePricingResponse(global_pricing_dict.json_data, sidebar_data_dict);        

});

}

function populateConferenceWinSelectDropdown(sidebar_data_dict) {

    //Create option values
    let conference_options_array = [];

    //Filter conferences without conference championship
    sidebar_data_dict.conferences.forEach(d => {

        if (d.conference_id != 18) {

            conference_options_array.push(d);
        }

    });

    let sorted_conference_options_array = d3.nest()
                            .key((d) => d.conference_abbrev)
                            .sortKeys(d3.ascending)
                            .entries(conference_options_array)
                            .map((group) => group.values)
                            .flat();

    let odds_table_dropdown = d3.select("#odds_table_dropdown");

    odds_table_dropdown.attr('pricing_market_id', global_pricing_dict.pricing_market_id);

    odds_table_dropdown.selectAll("*").remove();

    odds_table_dropdown.style('display', 'block');

    let dropdown_options = odds_table_dropdown.selectAll("option")
                                                                .data(sorted_conference_options_array)
                                                                .enter()
                                                                .append("option")
                                                                .text(d => d.conference_abbrev)
                                                                .attr('value', d => d.conference_id);


    odds_table_dropdown.on("change", function() {

                                                                    //set  global conference id
                                                                    let conference_id = parseInt(this.value);

                                                                    global_pricing_dict.conference_winner_display_id = conference_id;
                                                                    
                                                                    let pricing_request_params = {

                                                                        pricing_market_id: global_pricing_dict.pricing_market_id,
                                                                        conference_id: conference_id,

                                                                    }

                                                                     sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                                                    
                                                                });
}

function createDivisionOptionsArray(sidebar_data_dict) {

    let division_info_array = [];

    sidebar_data_dict.divisions.forEach(division_info_dict => {


        division_info_array.push({
            'conference_id': division_info_dict.conference_id,
            'conference_abbrev': division_info_dict.conference_abbrev,
            'division_id': division_info_dict.division_1_id,
            'division_name': division_info_dict.division_1_name,
        });

        division_info_array.push({
            'conference_id': division_info_dict.conference_id,
            'conference_abbrev': division_info_dict.conference_abbrev,
            'division_id': division_info_dict.division_2_id,
            'division_name': division_info_dict.division_2_name,
        });

    })

    return division_info_array

}

function populateDivisionWinSelectDropdown(sidebar_data_dict) {

    //Create option values
    let division_options_array = createDivisionOptionsArray(sidebar_data_dict);

    let odds_table_dropdown = d3.select("#odds_table_dropdown");

    odds_table_dropdown.attr('pricing_market_id', 1102);

    odds_table_dropdown.selectAll("*").remove();

    odds_table_dropdown.style('display', 'block');

    let dropdown_options = odds_table_dropdown.selectAll("option")
                                                                .data(division_options_array)
                                                                .enter()
                                                                .append("option")
                                                                .text(d => {
                                                                    return d.conference_abbrev + ' - ' +  d.division_name
                                                                })
                                                                .attr('value', d => d.division_id);
    
    let division_id_to_conference_map = {
        103: 5,
        104: 5,
        109: 8,
        110: 8,
        105: 15,
        106: 15,
        107: 17,
        108: 17,
        111: 37,
        112: 37,
    }

    odds_table_dropdown.on("change", function(d) {

                                                                    //set  global conference id
                                                                    let division_id = parseInt(this.value);
                                                                    let conference_id = division_id_to_conference_map[division_id];

                                                                    global_pricing_dict.division_conference_winner_display_id = conference_id;
                                                                    global_pricing_dict.division_winner_display_id = division_id;
                                                                    
                                                                    let pricing_request_params = {

                                                                        pricing_market_id: 2102,
                                                                        conference_id: conference_id,
                                                                        division_id: division_id,

                                                                    }

                                                                    console.log(pricing_request_params);
                                                                     sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                                                    
                                                                });
}

function populateBowlWinSelectDropdown(sidebar_data_dict) {

    //Create option values
    let bowl_options_array = sidebar_data_dict.bowls

    let odds_table_dropdown = d3.select("#odds_table_dropdown");

    odds_table_dropdown.attr('pricing_market_id', 2103);

    odds_table_dropdown.selectAll("option").remove();

    odds_table_dropdown.style('display', 'block');

    let dropdown_options = odds_table_dropdown.selectAll("option")
                                                                .data(bowl_options_array)
                                                                .enter()
                                                                .append("option")
                                                                .text(d => d.bowl_name)
                                                                .attr('value', d => d.bowl_id);

    odds_table_dropdown.on("change", function() {

                                                                    //set  global conference id
                                                                    let bowl_id = parseInt(this.value);

                                                                    global_pricing_dict.bowl_id = bowl_id;
                                                                    
                                                                    let pricing_request_params = {

                                                                        pricing_market_id: 2103,
                                                                        bowl_id: bowl_id,

                                                                    }

                                                                    console.log(pricing_request_params);
                                                                     sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                                                    
                                                                });
}

function populateTeamSelectDropdown(sidebar_data_dict) {

    //Create team_options_array
    let team_options_array = [];

    let team_ids = Object.keys(sidebar_data_dict.team_info_map);

    team_ids.forEach(team_id => {

        let team_dict = sidebar_data_dict.team_info_map[team_id];

        if (team_dict.team_classification_id == 1){

            team_options_array.push(team_dict);
        };
    })

    
    let sorted_team_option_array = d3.nest()
                            .key((d) => d.team_name)
                            .sortKeys(d3.ascending)
                            .entries(team_options_array)
                            .map((group) => group.values)
                            .flat();

    let team_dropdown = undefined;
    let pricing_market_id = undefined;
    
    team_dropdown = d3.select("#win_totals_team_dropdown");
    pricing_market_id = 2201

    team_dropdown.selectAll("*").remove();

    let dropdown_options = team_dropdown.selectAll("option")
                            .data(sorted_team_option_array)
                            .enter()
                            .append("option")
                            .text(d => d.team_name + " " + d.team_mascot)
                            .attr('value', d => d.team_id)
                            .property('selected', d => d.team_id === global_pricing_dict.win_totals_team_id);


    team_dropdown.on("change", function() {
                                //set  global conference id
                                let team_id = parseInt(this.value);

                                global_pricing_dict.win_totals_team_id = team_id;
                                
                                let pricing_request_params = {

                                    pricing_market_id: pricing_market_id,
                                    team_id: team_id,
                                }

                                console.log(pricing_request_params);
                                 sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                
                            });

}

function populateH2HWinTotalTeamsSelectDropdown(sidebar_data_dict) {

    //Create team_options_array
    let team_options_array = [];

    let team_ids = Object.keys(sidebar_data_dict.team_info_map);

    team_ids.forEach(team_id => {

        let team_dict = sidebar_data_dict.team_info_map[team_id];

        if (team_dict.team_classification_id == 1){

            team_options_array.push(team_dict);
        };
    })

    let sorted_team_option_array = d3.nest()
                            .key((d) => d.team_name)
                            .sortKeys(d3.ascending)
                            .entries(team_options_array)
                            .map((group) => group.values)
                            .flat();
    
    let h2h_team_1_dropdown = d3.select("#h2h_team_1_dropdown");

    h2h_team_1_dropdown.selectAll("*").remove();

    let h2h_team_1_dropdown_options = h2h_team_1_dropdown.selectAll("option")
                            .data(sorted_team_option_array)
                            .enter()
                            .append("option")
                            .text(d => d.team_name + " " + d.team_mascot)
                            .attr('value', d => d.team_id)
                            .property('selected', d => d.team_id === global_pricing_dict.h2h_win_total_team_1_id);


    h2h_team_1_dropdown.on("change", function() {

                                //set  global conference id
                                let team_id = parseInt(this.value);

                                global_pricing_dict.h2h_win_total_team_1_id = team_id;
                                
                                let pricing_request_params = {

                                    pricing_market_id: 2202,
                                    h2h_win_params: {
                                        h2h_win_total_team_1_id: team_id,
                                        h2h_win_total_team_2_id: global_pricing_dict.h2h_win_total_team_2_id,
                                    }

                                }

                                 sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                
                            });

    let h2h_team_2_dropdown = d3.select("#h2h_team_2_dropdown");

    h2h_team_2_dropdown.selectAll("*").remove();

    let h2h_team_2_dropdown_options = h2h_team_2_dropdown.selectAll("option")
                            .data(sorted_team_option_array)
                            .enter()
                            .append("option")
                            .text(d => d.team_name + " " + d.team_mascot)
                            .attr('value', d => d.team_id)
                            .property('selected', d => d.team_id === global_pricing_dict.h2h_win_total_team_2_id);



    h2h_team_2_dropdown.on("change", function() {

                                //set  global conference id
                                let team_id = parseInt(this.value);

                                global_pricing_dict.h2h_win_total_team_2_id = team_id;
                                
                                let pricing_request_params = {

                                    pricing_market_id: 2202,
                                    h2h_win_params: {
                                        h2h_win_total_team_1_id: global_pricing_dict.h2h_win_total_team_1_id,
                                        h2h_win_total_team_2_id: team_id,
                                    }

                                }

                                    sendPricingRequest(server_api_url, user_id, pricing_request_params, sidebar_data_dict);
                                
                            });

}

function populatePlayoffOddsPricingTable(pricing_data, sidebar_data_dict) {

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

     //Hide H2H Screen if visible
     let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

     if (!is_h2h_hidden) {
 
         d3.select("#h2h_screen").style("display", "none");
 
     }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    //Hide Odds table dropdown if visible
    d3.select("#odds_table_dropdown").style('display', 'None');

    let pricing_results_data = pricing_data['win_pricing_results'];

    console.log("--->", pricing_data.pricing_market_id);

    let vig_int = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    let pricing_market_id = pricing_data['pricing_market_id'];

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    //Update Table header 
    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);

    let odds_table_columns = ['Team Name', 'Vig (Vig Free)']; // 'FanDuel', 'DraftKings', 'Ceasers'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 180, 120, 120, 120, 120];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let team_abbrev = sidebar_data_dict.team_info_map[d.team_id].team_name;
        let vig_odds = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(team_abbrev)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds + " (" + vig_free_odds + ")")
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        // row.append('td')
        //     .text('--')
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[2] + 'px');

        // row.append('td')
        //     .text('--')
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[3] + 'px');

        // row.append('td')
        //     .text('--')
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[4] + 'px');


    });
}

function populateMakePlayoffsPricingTable(pricing_data, sidebar_data_dict) {

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

     //Hide H2H Screen if visible
     let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

     if (!is_h2h_hidden) {
 
         d3.select("#h2h_screen").style("display", "none");
 
     }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    //Hide Odds table dropdown if visible
    d3.select("#odds_table_dropdown").style('display', 'None');

    let pricing_results_data = pricing_data['win_pricing_results'];

    let vig_int = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    let pricing_market_id = pricing_data['pricing_market_id'];

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    //Update Table header 
    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);

    let odds_table_columns = ['Team Name', 'Vig', 'Vig Free'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 140, 120, 120, 120, 120];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let team_abbrev = sidebar_data_dict.team_info_map[d.team_id].team_name;
        let vig_odds = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(team_abbrev)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        row.append('td')
            .text(vig_free_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[2] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[3] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[4] + 'px');

    });
}

function populateConferenceOddsPricingTable(pricing_data, sidebar_data_dict) {

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

     //Hide H2H Screen if visible
     let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

     if (!is_h2h_hidden) {
 
         d3.select("#h2h_screen").style("display", "none");
 
     }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    //Display and populate conference dropdown
    let current_dropdown_pricing_market_id = parseInt(d3.select('#odds_table_dropdown').attr('pricing_market_id'));

    if (current_dropdown_pricing_market_id != 2101) {
        populateConferenceWinSelectDropdown(sidebar_data_dict);
    }

    let pricing_results_data = pricing_data['win_pricing_results'];

    let vig_int = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    let pricing_market_id = pricing_data['pricing_market_id'];

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    //Update Table header 
    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);

    let odds_table_columns = ['Team Name', 'Vig', 'Vig Free'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 140, 120, 120, 120, 120];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let team_abbrev = sidebar_data_dict.team_info_map[d.team_id].team_name;
        let vig_odds = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(team_abbrev)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        row.append('td')
            .text(vig_free_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[2] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[3] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[4] + 'px');

    });
}

function populateDivisionOddsPricingTable(pricing_data, sidebar_data_dict) {

    //Display Market Settings if hidden
    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

     //Hide H2H Screen if visible
     let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

     if (!is_h2h_hidden) {
 
         d3.select("#h2h_screen").style("display", "none");
 
     }

    //Display and populate conference dropdown
    let current_dropdown_pricing_market_id = parseInt(d3.select('#odds_table_dropdown').attr('pricing_market_id'));

    if (current_dropdown_pricing_market_id != 1102) {
        populateDivisionWinSelectDropdown(sidebar_data_dict);
    }

    let pricing_results_data = pricing_data['win_pricing_results'];

    let vig_int = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    let pricing_market_id = pricing_data['pricing_market_id'];

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    //Update Table header 
    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);

    let odds_table_columns = ['Team Name', 'Vig', 'Vig Free'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 140, 120, 120, 120, 120];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let team_abbrev = sidebar_data_dict.team_info_map[d.team_id].team_name;
        let vig_odds = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(team_abbrev)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        row.append('td')
            .text(vig_free_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[2] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[3] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[4] + 'px');

    });
}

function populateBowlOddsPricingTable(pricing_data, sidebar_data_dict) {

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

     //Hide H2H Screen if visible
     let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

     if (!is_h2h_hidden) {
 
         d3.select("#h2h_screen").style("display", "none");
 
     }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    //Display and populate conference dropdown if not already existing
    let current_dropdown_pricing_market_id = parseInt(d3.select('#odds_table_dropdown').attr('pricing_market_id'));

    if (current_dropdown_pricing_market_id != 1103) {
       populateBowlWinSelectDropdown(sidebar_data_dict);
    }

    let pricing_results_data = pricing_data['win_pricing_results'];

    let vig_int = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[pricing_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    let pricing_market_id = pricing_data['pricing_market_id'];

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    //Update Table header 
    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);

    let odds_table_columns = ['Team Name', 'Vig', 'Vig Free'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 140, 120, 120, 120, 120];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let team_abbrev = sidebar_data_dict.team_info_map[d.team_id].team_name;
        let vig_odds = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(team_abbrev)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        row.append('td')
            .text(vig_free_odds)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[2] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[3] + 'px');

        // row.append('td')
        //     .text("-")
        //     .attr('class', 'odds_table_td')
        //     .style('min-width', col_width_array[4] + 'px');

    });
}

function populateTeamTotalsPricingScreen(json_data, sidebar_data_dict) {

    let pricing_data = json_data["team_win_totals_pricing_results"];

    //Show Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'block')

    }

    //Hide Odds Table if visible
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (!is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'none');
    }

    //Hide H2H Screen if visible
    let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

    if (!is_h2h_hidden) {

        d3.select("#h2h_screen").style("display", "none");

    }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    populateTeamSelectDropdown(sidebar_data_dict);

    //Update team logo image
    let team_logo = sidebar_data_dict.team_info_map[pricing_data.team_id]['team_logo_url'];
    let team_name = sidebar_data_dict.team_info_map[pricing_data.team_id]['team_name'];

    d3.select("#win_totals_team_logo").attr("src", team_logo);
    d3.select("#win_totals_team_name").text(team_name);

    //Set radio button listener
    d3.selectAll("input[name='win_total_radio']")
            .property('checked', function() {

                let input_value = parseInt(this.value);

                if (input_value  === global_pricing_dict.win_totals_radio_value) {
                    return true;
                } else {
                    return false;
                }

            })
            .on('click', function() {

                let radio_button = d3.select(this);

                console.log(radio_button.attr('value'));

                global_pricing_dict.win_totals_radio_value = parseInt(radio_button.attr('value'));

                populateTeamTotalsPricingScreen(json_data, sidebar_data_dict);

            })


    //Add event listeners for slider and slider value
    const slider = document.getElementById('win_totals_slider');
    const sliderValue = document.getElementById('win_totals_slider_value');
    let win_total_radio_value = global_pricing_dict.win_totals_radio_value;

    //Set initial values on load
    slider.value = global_pricing_dict.win_totals_slider_value;
    let vig_int = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_type;
    
    console.log("-->>", win_total_radio_value);

    //If Over/Under selected for Odds type
    if (win_total_radio_value == 1) {

        //Show O/U text
        d3.select("#win_totals_under_price_div").style('display', 'inline');
        d3.select('#win_totals_over_price_div').style('display', 'inline');

        //Hide exact text
        d3.select('#win_totals_exact_price_div').style('display', 'none');

        d3.select("#win_totals_slider").attr('step', '0.5');
    
        let win_index = parseInt(slider.value * 2);

        let under_prob = pricing_data['over_win_total_map'][win_index];
        let over_prob = 1 - under_prob;

        let vig_percent = vig_int / 100;

        let under_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, under_prob);
        let over_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, over_prob);

        let under_american_odds = convertProbToAmericanOdds(under_prob_with_vig);
        let over_american_odds = convertProbToAmericanOdds(over_prob_with_vig);

        d3.select("#win_totals_under_price").text(under_american_odds);
        d3.select("#win_totals_over_price").text(over_american_odds);

        const sliderPosition = (slider.value - slider.min) / (slider.max - slider.min);
        const thumbWidth = getComputedStyle(slider).getPropertyValue('--thumb-width') || '20px';
        const thumbOffset = parseInt(thumbWidth) * sliderPosition;

        sliderValue.textContent = slider.value;
        sliderValue.style.left = `calc(${sliderPosition * 100}% - ${thumbOffset}px)`;

        slider.addEventListener('input', () => {
            const sliderPosition = (slider.value - slider.min) / (slider.max - slider.min);
            const thumbWidth = getComputedStyle(slider).getPropertyValue('--thumb-width') || '20px';
            const thumbOffset = parseInt(thumbWidth) * sliderPosition;


            sliderValue.textContent = slider.value;
            sliderValue.style.left = `calc(${sliderPosition * 100}% - ${thumbOffset}px)`;

            let win_index = parseInt(slider.value * 2);

            let vig_int = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_percent;
            let vig_type_id = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_type;

            let under_prob = pricing_data['over_win_total_map'][win_index];
            let over_prob = 1 - under_prob;

            let vig_percent = vig_int / 100;

            let under_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, under_prob);
            let over_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, over_prob);

            let under_american_odds = convertProbToAmericanOdds(under_prob_with_vig);
            let over_american_odds = convertProbToAmericanOdds(over_prob_with_vig);

            d3.select("#win_totals_under_price").text(under_american_odds);
            d3.select("#win_totals_over_price").text(over_american_odds);
            
            global_pricing_dict.win_totals_slider_value = slider.value;

        });

    } else {

        //Hide O/U text
        d3.select("#win_totals_under_price_div").style('display', 'none');
        d3.select('#win_totals_over_price_div').style('display', 'none');

        //Show exact text
        d3.select('#win_totals_exact_price_div').style('display', 'inline');
        
        //Set values to just even numbers for the slider
        d3.select("#win_totals_slider").attr('step', '1');

        let win_index = parseInt(slider.value * 2);

        let exact_prob = pricing_data['exact_win_total_map'][win_index];

        let vig_percent = vig_int / 100;

        let exact_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, exact_prob);
        let exact_american_odds = convertProbToAmericanOdds(exact_prob_with_vig);

        d3.select("#win_totals_exact_price").text(exact_american_odds);

        const sliderPosition = (slider.value - slider.min) / (slider.max - slider.min);
        const thumbWidth = getComputedStyle(slider).getPropertyValue('--thumb-width') || '20px';
        const thumbOffset = parseInt(thumbWidth) * sliderPosition;

        sliderValue.textContent = slider.value;
        sliderValue.style.left = `calc(${sliderPosition * 100}% - ${thumbOffset}px)`;

        slider.addEventListener('input', () => {
            const sliderPosition = (slider.value - slider.min) / (slider.max - slider.min);
            const thumbWidth = getComputedStyle(slider).getPropertyValue('--thumb-width') || '20px';
            const thumbOffset = parseInt(thumbWidth) * sliderPosition;


            sliderValue.textContent = slider.value;
            sliderValue.style.left = `calc(${sliderPosition * 100}% - ${thumbOffset}px)`;

            let win_index = parseInt(slider.value * 2);

            let exact_prob = pricing_data['exact_win_total_map'][win_index];

            let vig_percent = vig_int / 100;

            let exact_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, exact_prob);
            let exact_american_odds = convertProbToAmericanOdds(exact_prob_with_vig);

            d3.select("#win_totals_exact_price").text(exact_american_odds);
            
            global_pricing_dict.win_totals_slider_value = slider.value;

        });




    }
    
}

function populateH2HTeamWinTotalPricingScreeen(json_data, sidebar_data_dict) {

    let pricing_data = json_data["h2h_pricing_results"];

    //Show H2h Screen if  hidden
    let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

    if (is_h2h_hidden) {

        d3.select("#h2h_screen").style("display", "block");

    }

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Display Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (!is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'none');
    }

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    populateH2HWinTotalTeamsSelectDropdown(sidebar_data_dict);

    //Update team logo image
    let team_1_logo = sidebar_data_dict.team_info_map[pricing_data.h2h_win_total_team_1_id]['team_logo_url'];
    let team_1_abbrev = sidebar_data_dict.team_info_map[pricing_data.h2h_win_total_team_1_id]['team_abbrev'];

    d3.select("#h2h_team_1_logo").attr("src", team_1_logo);
    d3.select("#h2h_team_1_abbrev").text(team_1_abbrev);
    d3.select("#h2h_team_1_spread_abbrev_text").text(team_1_abbrev);
    d3.select("#h2h_team_1_price_text").text(team_1_abbrev);

    let team_2_logo = sidebar_data_dict.team_info_map[pricing_data.h2h_win_total_team_2_id]['team_logo_url'];
    let team_2_abbrev = sidebar_data_dict.team_info_map[pricing_data.h2h_win_total_team_2_id]['team_abbrev'];

    d3.select("#h2h_team_2_logo").attr("src", team_2_logo);
    d3.select("#h2h_team_2_abbrev").text(team_2_abbrev);
    d3.select("#h2h_team_2_price_text").text(team_2_abbrev);

    //Add event listeners for slider and slider value
    const slider = document.getElementById('h2h_team_1_spread_slider');
    const sliderValue = document.getElementById('h2h_team_1_spread_slider_value');

    //Set initial values on load
    let h2h_spread_wins = 8;
    slider.value = global_pricing_dict.h2h_team_1_spread_slider_value;

    let team_1_spread_index = parseInt((slider.value - (-h2h_spread_wins)) / 0.5);
    let team_1_win_prob = pricing_data['team_1_win_map'][team_1_spread_index];
    let team_2_win_prob = 1 - team_1_win_prob;

    let vig_int = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_type;
    let vig_percent = vig_int / 100;

    let team_1_win_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, team_1_win_prob);
    let team_2_win_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, team_2_win_prob);

    let team_1_american_odds = convertProbToAmericanOdds(team_1_win_prob_with_vig);
    let team_2_american_odds = convertProbToAmericanOdds(team_2_win_prob_with_vig);

    d3.select("#h2h_team_1_price").text(team_1_american_odds);
    d3.select("#h2h_team_2_price").text(team_2_american_odds);

    slider.addEventListener('input', () => {
        const sliderPosition = (slider.value - slider.min) / (slider.max - slider.min);
        const thumbWidth = getComputedStyle(slider).getPropertyValue('--thumb-width') || '20px';
        const thumbOffset = parseInt(thumbWidth) * sliderPosition;

        let spread_slider_text = slider.value > 0 ? `+${slider.value}`: slider.value;

        sliderValue.textContent = spread_slider_text;
        sliderValue.style.left = `calc(${sliderPosition * 100}% - ${thumbOffset}px)`;

        let team_1_spread_index = parseInt((slider.value - (-h2h_spread_wins)) / 0.5);
        let team_1_win_prob = pricing_data['team_1_win_map'][team_1_spread_index];
        let team_2_win_prob = 1 - team_1_win_prob;

        let vig_int = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_percent;
        let vig_type_id = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_type;
        let vig_percent = vig_int / 100;

        let team_1_win_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, team_1_win_prob);
        let team_2_win_prob_with_vig = CalcVig(vig_percent, 2, vig_type_id, team_2_win_prob);

        let team_1_american_odds = convertProbToAmericanOdds(team_1_win_prob_with_vig);
        let team_2_american_odds = convertProbToAmericanOdds(team_2_win_prob_with_vig);

        d3.select("#h2h_team_1_price").text(team_1_american_odds);
        d3.select("#h2h_team_2_price").text(team_2_american_odds);
        
        global_pricing_dict.win_totals_slider_value = slider.value;

    });

    



}

function populateConferenceExactaOddsPricingTable(json_data, sidebar_data_dict) {

    //Hide Win Totals Screen if shown
    let is_win_totals_hidden = d3.select('#win_totals_screen').style('display') == 'none';

    if (!is_win_totals_hidden) {

        d3.select('#win_totals_screen').style('display', 'none')

    }

    //Diplay Odds Table if hidden
    let is_odds_table_hidden = d3.select('#odds_table_display').style('display') == 'none';

    if (is_odds_table_hidden) {
        d3.select('#odds_table_display').style('display', 'block');
    }

    //Hide H2H Screen if visible
    let is_h2h_hidden = d3.select("#h2h_screen").style("display") == "none";

    if (!is_h2h_hidden) {

        d3.select("#h2h_screen").style("display", "none");

    }
    

    //Display Market Settings if hidden
    let is_market_settings_hidden = d3.select("#market_settings_container").style("display") == "none";

    if (is_market_settings_hidden) {
        d3.select("#market_settings_container").style("display", "flex");
    }

    //Display and populate conference dropdown if not already existing
    let current_dropdown_pricing_market_id = parseInt(d3.select('#odds_table_dropdown').attr('pricing_market_id'));

    if (current_dropdown_pricing_market_id != 2301) {
       populateConferenceWinSelectDropdown(sidebar_data_dict);
    }

    let pricing_results_data = json_data['conference_exacta_pricing_results'];
    let pricing_market_id = json_data['pricing_market_id'];


    let vig_int = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_percent;
    let vig_type_id = sidebar_data_dict.user_market_vig_map[json_data.pricing_market_id].market_vig_type;

    pricing_results_data = AddVigToPricing(vig_int, vig_type_id, pricing_results_data);

    //Sort by win prob descending
    pricing_results_data = pricing_results_data.sort((a,b) => d3.descending(
        a.probability_with_vig,
        b.probability_with_vig,
        ));

    let odds_table_heading_text = pricing_market_dict[pricing_market_id]['market_title'];
    d3.select("#odds_table_heading").text(odds_table_heading_text);
    
    let odds_table_columns = ['Exacta Name', 'Vig', 'Vig Free'];

    //Set column headers 
    let odds_table_headers = d3.select('#odds_table_thead');

    //Remove any previous column headers
    odds_table_headers.selectAll("th").remove();-

    odds_table_headers.selectAll(".odds_table_th")
                                            .data(odds_table_columns)
                                            .enter()
                                            .append('th')
                                            .text(column => column)
                                            .attr('class', 'odds_table_th')

    //Add odds rows to table
    let odds_table_tbody = d3.select("#odds_table_tbody");

    odds_table_tbody.selectAll("tr").remove();

    let odds_table_rows = odds_table_tbody.selectAll(".odds_table_tr")
                                                            .data(pricing_results_data)
                                                            .enter()
                                                            .append('tr')
                                                            .attr('class', 'odds_table_tr');

    
    //Create Min Width array for columns
    let col_width_array = [160, 140, 140];

    let odds_table_cells = odds_table_rows.each(function(d) {

        const row = d3.select(this);

        //Convert cell data
        let winning_team_name = sidebar_data_dict.team_info_map[d.conference_winner_team_id].team_name;
        let runner_up_team_name = sidebar_data_dict.team_info_map[d.conference_runner_up_team_id].team_name;
        let full_text = winning_team_name + " beats " + runner_up_team_name;
        let vig_odds_text = convertProbToAmericanOdds(d.probability_with_vig);
        let vig_free_odds_text = convertProbToAmericanOdds(d.win_probability);

        //Append Cells
        row.append('td')
            .text(full_text)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[0] + 'px');

        row.append('td')
            .text(vig_odds_text)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[1] + 'px');

        row.append('td')
            .text(vig_free_odds_text)
            .attr('class', 'odds_table_td')
            .style('min-width', col_width_array[2] + 'px');

    });


}


//*******************************Start of APP ***********************************************/
let sidebar_data_dict = fetchSidebarData(server_api_url, user_id)
                                                        .then((sidebar_data_dict) => {
                                                            
                                                            drawSidebarContents(sidebar_data_dict);
                                                            createMarketSettingsHandlers(pricing_market_dict, user_id, sidebar_data_dict);

                                                        });
