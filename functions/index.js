const functions = require("firebase-functions");
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;




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
        response.statusCode = 404;
        response.send({ message: "Utilisateur introuvable. Vérifier l'email" });
    })
});

exports.payementCallback = functions.https.onRequest((request, response) => {
    var body = request.body;
    var query = request.query;
    var trxid = body["orderid"];
    if (request.method == "POST") {
        var data = {
            "orderid": body['orderid'],
            "txref": body['txref'],
            "payref": body['payref'],
            "amount": body['amount'],
            "paydatetime": body['paydatetime'],
            "method": body['method'],
            "phone": body['phone'],
            "status": body['status'],


            "user_agent_api": request.headers["user-agent"],
            "x-appengine-citylatlong": request.headers['x-appengine-citylatlong'],
            "x-appengine-city": request.headers['x-appengine-city'],
            "x-appengine-country": request.headers['x-appengine-country'],
            "x-appengine-user-ip": request.headers['x-appengine-user-ip'],


        };

        admin.firestore().collection("transactions").doc(trxid).get().then((data) => {
            if (data["_fieldsProto"] == null) {
                response.send("data is null")
            } else {
                var useruid = data['_fieldsProto']['uid']['stringValue'];
                admin.firestore().collection("transactions").doc(trxid).update(data).then((res) => {
                    var amount = body['amount'];
                    amount = parseInt(amount);
                    admin.firestore().collection('users').doc(useruid).update({
                        balance: FieldValue.increment(amount),
                    }).then((data) => {
                        response.send(request.headers);

                    })

                }).catch((e) => {
                    console.log("erruer", e);
                    response.send("Une erreur est survenue");
                })
            }
        })





    } else {
        var data = {
            "message": "Les requête avec ce verbe ne sont pas autorisé",
        };
        response.send(data);
    }
})


exports.updateUser = functions.https.onRequest((request, response) => {
    var userid = request.query['userid'];
    var amount = request.body['amount'];
    amount = parseInt(amount);

    admin.firestore().collection('users').doc(userid).update({
        balance: FieldValue.increment(amount),
    }).then((res) => {
        response.send("Good")

    })

});


exports.checkDataExist = functions.https.onRequest((request, response) => {
    var id = request.query["id"];
    admin.firestore().collection("users").doc(id).get().then((data) => {
        if (data["_fieldsProto"] == null) {
            response.send("est vide")
        } else {

            response.send(data['_fieldsProto']['uid']['stringValue']);
        }
    })


})





exports.paygateCallback = functions.https.onRequest((request, response) => {
    var body = request.body;
    var query = request.query;
    if (request.method == "POST") {
        var data = {
            "orderid": body['orderid'],
            "txref": body['txref'],
            "payref": body['payref'],
            "amount": body['amount'],
            "paydatetime": body['paydatetime'],
            "method": body['method'],
            "phone": body['phone'],
            "status": body['status'],


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