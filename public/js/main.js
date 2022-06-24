function ensureOneCheck(checkBoxName, messageId, submitId) {
	
	const checkBoxes = document.getElementsByName(checkBoxName);

	let checkCount = 0;
	for (let i=0; i < checkBoxes.length; i++){
		if (checkBoxes[i].checked)
			checkCount++;
	}
	if (checkCount === 0) {
		document.getElementById(messageId).style.display = 'block';
		document.getElementById(submitId).disabled = true;
		return false;
	} else {
		document.getElementById(messageId).style.display = 'none';
		document.getElementById(submitId).disabled = false;
		return true;
	}
}

function getOMdbMovie(){
	const title = document.getElementById('title').value;
	const poster = document.getElementById('poster');
	const omdbErr = document.getElementById('OMdbErr');
	const posterURL = document.getElementById('posterURL');
	const starring = document.getElementById('starring');
	const story = document.getElementById('story');
	const datepicker = document.getElementById('datepicker');
	fetch('https://www.omdbapi.com/?t=' + title + '&apikey=12a11354')
		.then((res)=>{
			return res.json();
		}).then((data) =>{
			if (data.Response === 'False'){
				poster.src = '/img/no-image.jpg';
				omdbErr.style.display = 'inline';
			} else {
				omdbErr.style.display = 'none';
				poster.src = data.Poster;
				starring.value = data.Actors;
				posterURL.value = data.Poster;
				story.value = data.Plot;
				datepicker.value = moment(new Date(data.Released)).format('DD/MM/YYYY');
			}
		}).catch(error => {omdbErr.innerHTML = error;})
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year,month,day].join('/');
}

$('#postedUpload').on('change', function(){
	let image = $('#postedUpload')[0].files[0];
	let formdata = new FormData();
	formdata.append('posterUpload', image);
	$.ajax({
		url:'/video/upload',
			type: 'POST',
			data: formdata,
			contentType:false,
			processData:false,
			'success':(data)=> {
				$('#poster').attr('src', data.file);
				$('#posterURL').attr('value', data.file); // sets postersURL hidden field
				if (data.err){
					$('#posterErr').show();
					$('#posterErr').text('value', data.file);
				} else {
					$('#posterErr').hide();
				}
			}
	});
});

$(document).ready(function () {
	$('#addPromotionForm').bootstrapValidator({
		// To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
		feedbackIcons: {
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			PromotionName: {
				validators: {
					stringLength: {
						min: 2,
					},
					notEmpty: {
						message: 'Please enter the Promotion Name'
					}
				}
			},
			EmailLimit: {
				validators: {
					stringLength: {
						min: 2,
					},
					notEmpty: {
						message: 'This is temp'
					}
				}
			},
			RedemptionPerPerson: {
				validators: {
					notEmpty: {
						message: 'Please enter the Redemption Limit Per Person'
					}
				}
			},
			TotalRedemption: {
				validators: {
					notEmpty: {
						message: 'Please enter the Total Redemption Limit'
					}
				}
			},
			PromotionCode: {
				validators: {
					stringLength: {
						min: 2,
						max: 8,
					},
					notEmpty: {
						message: 'Please enter the Promotion Code'
					}
				}
			},
			Purpose: {
				validators: {
					stringLength: {
						min: 2,
						max: 2000,
					},
					notEmpty: {
						message: 'Please enter the Purpose of the promotion'
					}
				}
			},
			PromotionAmount: {
				validators: {
					notEmpty: {
						message: 'Please enter the Promotion Amount'
					}
				}
			},
			StartOfPromotion: {
				validators: {
					date: {
						format: 'YYYY/MM/DD',
						message: 'This is not a valid date'
					},
					notEmpty: {
						message: 'Please choose a date'
					},
					callback: {
						message: 'The date is not in a valid range',
						callback: function(value, validator) {
							var m = new moment(value, 'YYYY-MM-DD', true);
							if (!m.isValid()) {
								return false;
							}

							const today = new Date();

							console.log(EndOfPromotion.value)

							return m.isAfter(formatDate(today))  && m.isBefore(EndOfPromotion.value);
						}
					}
				}
			},
			EndOfPromotion: {
				validators: {
					date: {
						format: 'YYYY/MM/DD',
						message: 'This is not a valid date'
					},
					notEmpty: {
						message: 'Please choose a date'
					},
					callback: {
						message: 'The date is not in a valid range',
						callback: function(value, validator) {
							var m = new moment(value, 'YYYY-MM-DD', true);
							if (!m.isValid()) {
								return false;
							}

							return m.isAfter(StartOfPromotion.value);
						}
					}
				}
			},
			
			
		}

	})
		.on('success.form.bv', function (e) {
			$('#success_message').slideDown({ opacity: "show" }, "slow") // Do something ...
			$('#contact_form').data('bootstrapValidator').resetForm();

			// Prevent form submission
			e.preventDefault();

			// Get the form instance
			var $form = $(e.target);

			// Get the BootstrapValidator instance
			var bv = $form.data('bootstrapValidator');

			// Use Ajax to submit form data
			$.post($form.attr('action'), $form.serialize(), function (result) {
				console.log(result);
			}, 'json');
		});
});

