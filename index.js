var StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork()
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')

var accountA = StellarSdk.Keypair.fromSecret('SCKRBA3PWS35WLH6PXRZWYHFFO2YGPBDLBEYEZTIOORPIX6RY2Y2PCTK')
var accountB = StellarSdk.Keypair.fromSecret('SAV5A4JA4E2BYKNATJSN27LEUKAMGUFLJA2D4FX4RNVWJ7BDJDONEP4J')

//var pair = StellarSdk.Keypair.random()
//var pair = StellarSdk.Keypair.fromSecret('');
//var pair = StellarSdk.Keypair.fromPublicKey('GBBORXCY3PQRRDLJ7G7DWHQBXPCJVFGJ4RGMJQVAX6ORAUH6RWSPP6FM');

// console.log(pair.secret())
// console.log(pair.publicKey())

// test creds
// pub: GCHNKABCZZWT57477IBZQFDHZINSJDHHWWGWJSTPCJQIY5YA6BIXLFAL
// sec: SCKRBA3PWS35WLH6PXRZWYHFFO2YGPBDLBEYEZTIOORPIX6RY2Y2PCTK
// pub 2: GBCMBVBJTHY3IZ7XGBTIAAHKJBN7OVLKFRRYIR5LO6OYS5DXCLU3P2MT
// sec 2: SAV5A4JA4E2BYKNATJSN27LEUKAMGUFLJA2D4FX4RNVWJ7BDJDONEP4J

//sendStellarLumens(accountA, accountB.publicKey(), 10)

//newStellarAccount(accountA.publicKey())
getStellarAccount(accountA.publicKey())
getStellarAccount(accountB.publicKey())

function newStellarAccount(key) {
  //console.log(pair._publicKey)
  var request = require('request')
  request.get({
    url: 'https://friendbot.stellar.org',
    qs: { addr: key },
    json: true
  }, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.error('ERROR!', error || body)
    }
    else {
      console.log('SUCCESS! You have a new account :)\n', body)
    }
  })
}

function getStellarAccount(key) {
  // the JS SDK uses promises for most actions, such as retrieving an account
  server.loadAccount(key).then(function(account) {
    console.log('Balances for account: ' + key)
    account.balances.forEach(function(balance) {
      console.log('Type:', balance.asset_type, ', Balance:', balance.balance)
    })
  })
}

function sendStellarLumens(sourcePair, destinationKey, amount) {
  var transaction

  server.loadAccount(destinationKey)
    .catch(StellarSdk.NotFoundError, function (error) {
      throw new Error('The destination account does not exist!')
    })
    .then(function() {
      return server.loadAccount(sourcePair.publicKey())
    })
    .then(function(sourceAccount) {
      transaction = new StellarSdk.TransactionBuilder(sourceAccount)
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationKey,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString()
        }))
        .addMemo(StellarSdk.Memo.text('Brickion Test Transaction'))
        .build()
      transaction.sign(sourcePair)
      return server.submitTransaction(transaction)
    })
    .then(function(result) {
      console.log('Success! Results:', result)
    })
    .catch(function(error) {
      console.error('Something went wrong!', error)
    })
}
