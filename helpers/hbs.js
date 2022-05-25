const moment = require('moment');
module.exports = {

    radioCheck: function(value, radioCheck) {
        if (value === radioCheck) {
            return 'checked';
        }
        return '';
    },

    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
    },

    replaceCommas: function(str){
        if (str != null || str.length !== 0) { //check for null & empty string
            if (str.trim().length !== 0) {
                // Replace the ',' to '|'. Use pattern-matching string /,/g for ','
                return str.replace(/,/g, ' | ');
            }

        }

        return 'None'; // Display 'None' if got no subtitles 

    },
};



