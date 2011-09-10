/* Author: 

*/

(function( $, undefined ) {
	
	var DonationChoice = function(competitor_id, choice) {
		this.competitor_id = competitor_id;
		this.choice = choice;
	}
	
	DonationChoice.prototype = {
		toString: function() { return this.competitor_id + " with time " + this.choice; }
	}
	
	var DonationStatus = function(donationChoice, choiceTaken) {
		this.donationChoice = donationChoice;
		this.choiceTaken = choiceTaken;
	}
	
	DonationStatus.prototype = {
		toString: function() { return "choice: " + this.donationChoice + ", taken = " + this.choiceTaken; }
	}

	// Donation Modal logic
	var donate_action_current_step = 1;
	
	var move_donate_step = function(move_to) {
		
		switch (move_to) {
			case 1:
				$("#donate-label-step"+donate_action_current_step).removeClass("donate-step-current");
				$("#donate-action-step"+donate_action_current_step).removeClass("donate-action-current-step");
				
				donate_action_current_step = move_to;
				
				// Fill in choices
				$("#donation-modal-choices-list").empty();
				$(".sweep-table-competitor-name").each(function(i) {
					var c_id = $(this).data("competitor-id");
					$("#donation-modal-choices-list").append("<li><em>" + $("#slider-label-"+c_id).text() + "</em> for " + $(this).text() + "</li>");
				});
				$("#donate-action-next-btn").text("Confirm Choices");
				
				$("#donate-label-step"+donate_action_current_step).addClass("donate-step-current");
				$("#donate-action-step"+donate_action_current_step).addClass("donate-action-current-step");
				
			break;
			
			case 2:
				
				$("#donate-action-next-btn").text("Next");
				$("#donate-action-next-btn").hide();
				
				show_spinner();
								
				// Submit choices to server
				
				var choicesArray = new Array();
				$(".sweep-table-competitor-name").each(function(i) {
					choicesArray[i] = new DonationChoice($(this).data("competitor-id"), $("#slider-label-"+(i+1)).text());
				});
				
				$.ajax({
					type: 'POST',
					url: "choices/save",
					data: JSON.stringify(choicesArray),
					datatype: 'JSON',
					success: function() {
						hide_spinner();
						
						$("#donate-label-step"+donate_action_current_step).removeClass("donate-step-current");
						$("#donate-action-step"+donate_action_current_step).removeClass("donate-action-current-step");
						
						donate_action_current_step = move_to;
						$("#donate-label-step"+donate_action_current_step).addClass("donate-step-current");
						$("#donate-action-step"+donate_action_current_step).addClass("donate-action-current-step");
					},
					error: function() {
						hide_spinner();
						
						// TODO change this to real error handling
						$("#donate-label-step"+donate_action_current_step).removeClass("donate-step-current");
						$("#donate-action-step"+donate_action_current_step).removeClass("donate-action-current-step");
						
						donate_action_current_step = move_to;
						$("#donate-label-step"+donate_action_current_step).addClass("donate-step-current");
						$("#donate-action-step"+donate_action_current_step).addClass("donate-action-current-step");
					}
				});
				
				
			break;
			case 3:
				$("#donate-label-step"+donate_action_current_step).removeClass("donate-step-current");
				$("#donate-action-step"+donate_action_current_step).removeClass("donate-action-current-step");
				
				$("#donate-action-next-btn").hide();
				$("#donate-action-finish-btn").show();
				
				donate_action_current_step = move_to;
				
				$("#donate-label-step"+donate_action_current_step).addClass("donate-step-current");
				$("#donate-action-step"+donate_action_current_step).addClass("donate-action-current-step");
				
			break;
			default:
			break;
		}
		
		
	}
	
	var donation_spinner;
	
	var show_spinner = function() {
		if (donation_spinner === undefined) {
			var opts = {
			  lines: 10, // The number of lines to draw
			  length: 4, // The length of each line
			  width: 2, // The line thickness
			  radius: 4, // The radius of the inner circle
			  color: '#000', // #rbg or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 50, // Afterglow percentage
			  shadow: false // Whether to render a shadow
			};
			donation_spinner = new Spinner(opts);
		}
		$("#donate-loading-spinner").show();
		donation_spinner.spin(document.getElementById("donate-loading-spinner"));	// spin.js requires the raw DOM element, not the jQuery one
	}
	
	var hide_spinner = function() {
		if (donation_spinner !== undefined) {
			donation_spinner.stop();
		}
		$("#donate-loading-spinner").hide();
	}
	
	$("#donate-action-next-btn").click(function() {
		// Move to the next page
		move_donate_step(donate_action_current_step+1);
	});
		
	$(".donation-anchor").click(function() {
		$("#donation-external-btn").hide();
		$("#donate-action-next-btn").show();
	});
	
	$("#donate_btn").click(function() {
		$("#donate-action-next-btn").show();
		$("#donation-external-btn").show();
		move_donate_step(1);
		
		$('#donate-modal-reveal').reveal({
			 animation: 'fadeAndPop',					//fade, fadeAndPop, none
		     animationspeed: 300,						//how fast animtions are
		     closeonbackgroundclick: false,				//if you click background will modal close?
		     dismissmodalclass: 'modal-dismiss'    		//the class of a button or element that will close an open modal
		});
		
	});
	
	$(".modal-dismiss").click(function() {
		hide_spinner();
		$("#donate-action-finish-btn").hide();
	});
	
	
	
	
	
	$(document).ready(function() {
		
		$(".sweep-dragger").draggable({ axis: 'y', containment: '#sweep_table'});
		$(".sweep-free-cell").droppable({
			drop: function() { $(this).addClass( "sweep-active-cell" ); },
			out: function() { $(this).removeClass( "sweep-active-cell" ); },
			hoverClass: 'sweep-hover-cell'
		});

		var competitors = {
			<% @competitors.each do |c| %>
			"<%= c.facebook_id %>": new Array(),
			<% end %>
		};
		
		var sliderChoices = [
		<% @values.each do |v| %>
		"<%= Time.at(60*v).gmtime.strftime('%R') %>",
		<% end %>
		];
		
		for(var i=sliderChoices.length-1; i>=0; i--) {
			var sliderChoice = sliderChoices[i];
			for (var id in competitors) {
				// id is the competitor id, use to get free/taken from the db?
				var choiceTaken = false;
				var competitorChoices = competitors[id];
				competitorChoices.push(new DonationStatus(sliderChoice, choiceTaken))
			}
		}
		
		var slider_min = 0;
		var slider_max = sliderChoices.length - 1;
		var slider_step = 1;

		$(".sweep-slider").slider( {
			orientation: 'vertical',
			value: slider_max,
			min: slider_min,
			max: slider_max,
			step: slider_step,
			slide: function(event, ui) {
				var index = ui.value;
				var slider_id = $(this).data("competitor-id");
				var competitorChoices = competitors[slider_id];
				var label_to_write = competitorChoices[index].donationChoice;
				$("#slider-label-"+slider_id).html(label_to_write);
			}
		} );
	});

})(jQuery);






















