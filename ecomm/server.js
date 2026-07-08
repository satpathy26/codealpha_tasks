const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server Running");
});


//GET ALL PRODUCTS
app.get("/api/products", (req, res) => {

    db.query(
        "SELECT * FROM products",
        (err, results) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );

});


//GET SINGLE PRODUCT
app.get("/api/products/:id", (req,res)=>{

    const id = req.params.id;

    db.query(
        "SELECT * FROM products WHERE id = ?",
        [id],
        (err,result)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(result[0]);
        }
    );
});

app.post("/api/register", async (req, res) => {

    const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    if(password.length < 6){
    return res.status(400).json({
        message: "Password must be at least 6 characters"
    });
}

    const hashedPassword =
    await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (name,email,password) VALUES (?,?,?)",
        [name, email, hashedPassword],
        (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message: "User Registered"
            });

        }
    );

});

//USER LOGIN
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, result) => {

            if(err){
                return res.status(500).json(err);
            }

            if(result.length === 0){
                return res.json({
                    message: "User Not Found"
                });
            }

            const user = result[0];

            const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

            if(!isMatch){
                return res.json({
                    message: "Invalid Password"
                });
            }

            res.json({
                message: "Login Successful",
                userId: user.id
            });

        }
    );

});

//PLACE ORDER
app.post("/api/orders", (req, res) => {

    const { userId, cart, total } = req.body;

    if(!userId){
        return res.status(400).json({
            message:"User not logged in"
        });
    }

    if(!cart || cart.length === 0){
        return res.status(400).json({
            message:"Cart is empty"
        });
    }

    if(total <= 0){
        return res.status(400).json({
            message:"Invalid total amount"
        });
    }


    db.query(
        "INSERT INTO orders (user_id,total_amount) VALUES (?,?)",
        [userId, total],
        (err, orderResult) => {

            if(err){
                return res.status(500).json(err);
            }

            const orderId = orderResult.insertId;

            cart.forEach(productId => {

                db.query(
                    `INSERT INTO order_items
                    (order_id, product_id, quantity)
                    VALUES (?, ?, ?)`,
                    [orderId, productId, 1]
                );

            });

            res.json({
                message: "Order Placed Successfully"
            });

        }
    );

});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

