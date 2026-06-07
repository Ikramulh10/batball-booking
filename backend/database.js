const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./badminton.db', function(err){

if(err){
    console.error(err.message);
}else{
    console.log('Connected to SQLite database');
}

});

db.run(
'CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, player_name TEXT, phone TEXT, court_number INTEGER, booking_type TEXT, booking_date TEXT, booking_time TEXT, amount REAL, payment_status TEXT)'
);

module.exports = db;