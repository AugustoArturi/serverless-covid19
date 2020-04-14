const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.Notification = functions.database.ref('/register/{userDNI}').onWrite(async (change, context) => {
  const currentDNI = context.params.userDNI;
	//console.log("currentDNI: ", currentDNI);

  const state = change.after.child('state').val();
  console.log("state new: ", state);

  //the array containing interactions with contactDNI
  var dnis = []
  var ref = admin.database().ref('interactions')
  ref.on("value", function(snapshot) {
          snapshot.forEach(function(data) {
            //console.log("The key is: " + data.key + " ,child: " + data.child('contactDni').val() );
            if (data.child('contactDni').val() == currentDNI)
              dnis.push(data.child('dni').val())
            // data.forEach(function(payload){
            //   console.log( payload.key + " valor: " + payload.val());
            //
            // });
        });
    })


  //get the token of the user receiving the message

    dnis.forEach(function(dniToNotifity){
  		return admin.database().ref(`/register/${dniToNotifity}`).once('value').then(snap => {
  			const token = snap.child("messageToken").val();
        if (token == null)
          return null
  			console.log("token: ", token);

  			//we have everything we need
  			//Build the message payload and send the message
  			//console.log("Construction the notification message.");
  			const payload = {
  				data: {
  					body: state,
  				}
  			};

  			return admin.messaging().sendToDevice(token, payload)
  						.then(function(response) {
  							console.log("Successfully sent message:", response);
  						  })
  						  .catch(function(error) {
  							console.log("Error sending message:", error);
  						  });
  		});
    });
});
