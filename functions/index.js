const functions = require("firebase-functions");
const admin = require('firebase-admin');

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
    var body = request.body;
    var query = request.query;
    if (request.method == "POST") {
        var data = {
            "txReference": body['tx_reference'],
            "identifier": body['identifier'],
            "paymentReference": body['payment_reference'],
            "amount": body['amount'],
            "datetime": body['datetime'],
            "payementMethod": body['payment_method'],
            "phoneNumber": body['phone_number'],
            "user_agent_api": request.headers["user-agent"],
            "x-appengine-citylatlong": request.headers['x-appengine-citylatlong'],
            "x-appengine-city": request.headers['x-appengine-city'],
            "x-appengine-country": request.headers['x-appengine-country'],
            "x-appengine-user-ip": request.headers['x-appengine-user-ip'],


        };

        admin.firestore().collection("paymentsTransactions").add(data).then((res) => {
            response.send(request.headers);

        }).catch((e) => {
            console.log("erruer", e);
            response.send("Une erreur est survenue");
        })



    } else {
        var data = {
            "message": "Les requête avec ce verbe ne sont pas autorisé",
        };
        response.send(data);
    }
})