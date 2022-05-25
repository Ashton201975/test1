const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../helpers/auth');
const alertMessage = require('../helpers/messenger'); // Bring in the alert messenger

// Require for file upload
const fs = require('fs');
const upload = require('../helpers/imageUpload');


// List videos belonging to current logged in user
router.get('/listVideos', ensureAuthenticated, (req, res) => {
    Video.findAll({
        where: {
            userId: req.user.id
        },
        order: [
            ['title', 'ASC']
        ],
        raw: true
    })
        .then((videos) => {
            // pass object to listVideos.handlebar
            res.render('video/listVideos', {
                videos: videos
            });
        })
        .catch(err => console.log(err));
});


router.get('/showAddVideo', ensureAuthenticated, (req, res) => {
    res.render('video/addVideo'); // Activates views/video/addVideo.handlebar
});

const moment = require('moment');
const Video = require('../models/Video');
const e = require('connect-flash');

// Adds new video jot from /video/addVideo
router.post('/addVideo', (req, res) => {
    let title = req.body.title;
    let story = req.body.story.slice(0, 1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    let subtitles = req.body.subtitles === undefined ? '' : req.body.subtitles.toString();
    let classification = req.body.classification;
    let userId = req.user.id;
    let posterURL = req.body.posterURL;
    let starring = req.body.starring;

    // Multi-value components return array of strings or undefined
    Video.create({
        title,
        story,
        classification,
        language,
        subtitles,
        dateRelease,
        posterURL,
        starring,
        userId
    }).then((video) => {
        res.redirect('/video/listVideos');
    })
        .catch(err => console.log(err))
});

// Shows edit video page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Video.findOne({
        where: {
            id: req.params.id
        }
    }).then((video) => {
        if (req.user.id === video.userId){ // user logged in is the owner of the video
            checkOptions(video);
            // call views/video/editVideo.handlebar to render the edit video page
            res.render('video/editVideo', {
                video // passes video object to handlebar
            });
        }else{ // Show error message & log the user out
            alertMessage(res, 'danger', 'Unauthorised access to video', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
        
    }).catch(err => console.log(err)); // To catch no video ID
});

// Creates variables with ‘check’ to put a tick in the appropriate checkbox
function checkOptions(video) {
    video.chineseLang = (video.language.search('Chinese') >= 0) ? 'checked' : '';
    video.englishLang = (video.language.search('English') >= 0) ? 'checked' : '';
    video.malayLang = (video.language.search('Malay') >= 0) ? 'checked' : '';
    video.tamilLang = (video.language.search('Tamil') >= 0) ? 'checked' : '';

    video.chineseSub = (video.subtitles.search('Chinese') >= 0) ? 'checked' : '';
    video.englishSub = (video.subtitles.search('English') >= 0) ? 'checked' : '';
    video.malaySub = (video.subtitles.search('Malay') >= 0) ? 'checked' : '';
    video.tamilSub = (video.subtitles.search('Tamil') >= 0) ? 'checked' : '';

}

router.put('/saveEditedVideo/:id', (req,res) =>{
    let title = req.body.title;
    let story = req.body.story.slice(0,1999);
    let dateRelease = moment(req.body.dateRelease, 'DD/MM/YYYY');
    let language = req.body.language.toString();
    let subtitles = req.body.subtitles === undefined ? '': req.body.subtitles.toString();
    let classification = req.body.classification;
    let posterURL = req.body.posterURL;
    let starring = req.body.starring;

    Video.update({
        title,
        story,
        classification,
        language,
        subtitles,
        dateRelease,
        posterURL,
        starring
    }, {
        where: {
            id: req.params.id
        }
    }).then((video) => {
        // After saving, redirect to router.get(/lsitVideos...) to retrieve all updated videos
        res.redirect('/video/listVideos')
    }).catch(err => console.log(err))
});

router.get('/delete/:id', ensureAuthenticated, (req, res) => {
    Video.findOne({
        where:{
            id: req.params.id
        }
    }).then((video) => {
        let videoTitle = video.title // to store the video title to display in success message
        // Only authorised user who is owner of video can delete it
        if (req.user.id === video.userId) {
            Video.destroy({ //delete the video
                where: {
                    id: req.params.id
                }
            }).then(() => { //Re-direct to the video list page with the appropriate success message
                alertMessage(res, 'success', videoTitle + ' Video Jot deleted', 'far fa-trash-alt', true);
                res.redirect('/video/listVideos');
            })
        }else{ // Show error message & log the user out
            alertMessage(res, 'danger', 'Unauthorised access the video', 'fas fa-exclamation-circle', true);
            res.redirect('/logout');
        }
    }).catch(err => console.log(err)); // To catch no video ID
});

// Upload poster
router.post('/upload', ensureAuthenticated, (req, res) => {
    // Create user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)){
        fs.mkdirSync('./public/uploads/' + req.user.id);
    }

    upload(req, res, (err) =>{
        if(err) {
            res.json({file:'/img/no-image.jpg', err: err});
        } else {
            if (req.file === undefined) {
                res.json({file: '/img/no-image.jpg', err: err});
            }else {
                res.json({file:`/uploads/${req.user.id}/${req.file.filename}`});
            }
        }
    });

})

module.exports = router;