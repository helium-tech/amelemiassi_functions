const functions = require("firebase-functions");
const admin = require('firebase-admin');


const app = express();
admin.initializeApp(functions.config().firebase)

exports.getUserByEmail = functions.https.onRequest((request, response) => {
    console.log("query data", request.query);
    var data = request.query
    var email = data['email']
    admin.auth().getUserByEmail(email).then((res) => {
        console.log("succesfully get user :", res.toJSON())
        response.send(res.toJSON());
    }).catch((error) => {
        console.log("an error occured when getting data", error)
    })
});

exports.paygateCallback = functions.https.onRequest((request, response) => {
    if (request.method == "POST") {
        return "C'est un post request";
    }
})