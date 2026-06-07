const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
res.send('Badminton Booking Backend Running');
});

app.get('/bookings', (req, res) => {

db.all(
    'SELECT * FROM bookings',
    [],
    (err, rows) => {

        if (err) {
            console.log('DATABASE ERROR:', err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);

    }
);

});

app.post('/bookings', (req, res) => {

const player_name = req.body.player_name;
const phone = req.body.phone;
const court_number = req.body.court_number;
const booking_type = req.body.booking_type;
const booking_date = req.body.booking_date;
const booking_time = req.body.booking_time;
const amount = req.body.amount || 0;
const payment_status = req.body.payment_status || 'Pending';

db.run(
    'INSERT INTO bookings (player_name, phone, court_number, booking_type, booking_date, booking_time, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
        player_name,
        phone,
        court_number,
        booking_type,
        booking_date,
        booking_time,
        amount,
        payment_status
    ],
    function(err) {

        if (err) {
            console.log('DATABASE ERROR:', err);
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            success: true,
            booking_id: this.lastID
        });

    }
);

});
app.put('/bookings/:id', (req, res) => {

    const {
        player_name,
        phone,
        amount,
        booking_type
    } = req.body;

    db.run(
        `UPDATE bookings
         SET player_name=?,
             phone=?,
             amount=?,
             booking_type=?
         WHERE id=?`,
        [
            player_name,
            phone,
            amount,
            booking_type,
            req.params.id
        ],
        function(err){

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success:true
            });

        }
    );

});
app.post('/bulk-check', (req, res) => {

    const {
        dates,
        court,
        time
    } = req.body;

    const conflicts = [];
    const available = [];

    let processed = 0;

    dates.forEach(date => {

        db.get(
            `SELECT * FROM bookings
             WHERE booking_date=?
             AND booking_time=?
             AND court_number=?`,
            [date, time, court],
            (err, row) => {

                processed++;

                if(row){

                    conflicts.push({
                        date: date,
                        court: court
                    });

                }else{

                    available.push(date);

                }

                if(processed === dates.length){

                    res.json({
                        available,
                        conflicts
                    });

                }

            }
        );

    });

});
app.post('/bulk-create', (req, res) => {

    const bookings = req.body.bookings;

    let completed = 0;

    bookings.forEach(booking => {

        db.run(
            `INSERT INTO bookings
            (
                player_name,
                phone,
                court_number,
                booking_type,
                booking_date,
                booking_time,
                amount,
                payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                booking.player_name,
                booking.phone,
                booking.court_number,
                booking.booking_type,
                booking.booking_date,
                booking.booking_time,
                booking.amount,
                booking.payment_status
            ],
            function(err){

                completed++;

                if(completed === bookings.length){

                    res.json({
                        success:true
                    });

                }

            }
        );

    });

});
app.delete('/bookings/:id', (req, res) => {
db.run(
    'DELETE FROM bookings WHERE id = ?',
    [req.params.id],
    function(err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            success: true
        });

    }
);

});
app.get('/customer/:name', (req, res) => {

    db.all(
        'SELECT * FROM bookings WHERE player_name = ?',
        [req.params.name],
        (err, rows) => {

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});
app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on port 5000');
});