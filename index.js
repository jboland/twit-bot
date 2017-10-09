const Twit = require('twit');
const request = require('request');
const fs = require('fs');

require('dotenv').config()

const bot = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60*1000
});

function getBotTimeline(count=5) {
    bot.get('statuses/home_timeline', { count }, (err, data, response) => {
        if (err) {
            console.log('error: ', err);
        } else {
            data.forEach((d) => {
                console.log(d.text);
                console.log(d.user.screen_name);
                console.log(d.id_str);
                console.log('\n');
            });
        }
    });
}



function getPhoto() {
    var parameters = {
        url: 'https://api.nasa.gov/planetary/apod',
        qs: {
            api_key: process.env.NASA_KEY
        },
        encoding: 'binary'
    };

    request.get(parameters, function(err, response, body) {
        body = JSON.parse(body);
        saveFile(body, 'nasa.jpg');
    });


}

function saveFile(body, filename) {
    var file = fs.createWriteStream(filename);
    request(body).pipe(file).on('close', function(err) {
        if (err) return console.log(err);
        console.log('Media saved');
        const mediaText = body.title;
        postMedia(mediaText, filename);
    });

}

function postMedia(title, filename) {
    const filePath = __dirname + '/' + filename;
    bot.postMediaChunked({ file_path: filePath }, function(err, data, resp) {
        if (err) return console.log(err);
        const params = {
            status: title,
            media_ids: data.media_id_string
        };

        updateStatus(params);
    });
}

function updateStatus(params) {
    bot.post('statuses/update', params, (err, data) => {
        if (err) return console.log(err);
        console.log('posted');
    })
}

getPhoto();