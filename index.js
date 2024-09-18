import express from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();


const app = express();

app.use(express.json());
// app.use(cors());

app.use(cors({
  origin: 'https://mini-expenses-tracker.netlify.app'
}));

const PORT = 17863;
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Database connected successfully.");
});

app.get("/", (req, res) => {
  const q =
    "SELECT *, 'budget' AS source FROM budget_list UNION SELECT *, 'expenses' AS source FROM expenses_list ORDER BY date DESC LIMIT 15";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/totalBudget", (req, res) => {
  const q =
    "SELECT COALESCE((SELECT SUM(amount) FROM budget_list), 0) + COALESCE((SELECT SUM(amount) FROM expenses_list), 0) AS combinedTotal;";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/totalExpenses", (req, res) => {
  const q =
    "SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses_list";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/expenses", (req, res) => {
  const q =
    "SELECT *, 'expenses' AS source FROM expenses_list ORDER BY id DESC LIMIT 15";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.get("/budget", (req, res) => {
  const q =
    "SELECT *, 'budget' AS source FROM budget_list ORDER BY id DESC LIMIT 15";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

app.delete("/reset", (req, res) => {
  const q1 = "TRUNCATE TABLE expenses_list";
  const q2 = "TRUNCATE TABLE budget_list";

  db.query(q1, (err, data) => {
    if (err) return res.json(err);

    db.query(q2, (err, data) => {
      if (err) return res.json(err);
      return res.json("RESET SUCCESSFULLY");
    });
  });
});

app.post("/add", (req, res) => {
  const q =
    "INSERT INTO expenses_list (`name`, `amount`, `date`) VALUES (?, ?, NOW())";
  const values = [req.body.name, -req.body.amount];

  db.query(q, values, (err, data) => {
    if (err) return res.json(err);
    return res.json("Successfully Added");
  });
});

app.post("/addBudget", (req, res) => {
  const q =
    "INSERT INTO budget_list (`name`, `amount`, `date`) VALUES (?, ?, NOW())";
  const values = [req.body.name, req.body.amount];

  db.query(q, values, (err, data) => {
    if (err) return res.json(err);
    return res.json("Added Successfully");
  });
});

app.delete("/:source/:id", (req, res) => {
  const id = req.params.id;
  const source =
    req.params.source === "expenses" ? "expenses_list" : "budget_list";

  const q = "DELETE FROM ?? WHERE id=?";
  const value = [source, id];
  db.query(q, value, (err, data) => {
    if (err) return res.json(err);
    return res.json("Successfullly deleted");
  });
});

app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { type } = req.query;
  
  if(type === "budget"){
    const q = "SELECT * FROM budget_list WHERE id = ?";

    db.query(q, [id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    })
  } else if(type === "expenses"){
    const q = "SELECT * FROM expenses_list WHERE id = ?";

    db.query(q, [id], (err, data) => {
      if (err) return res.json(err);
      return res.json(data);
    })
  }
});

app.put("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  

  if(type === "budget"){
    const values = [
      req.body.name,
      req.body.amount,
      id
    ]
    const q = "UPDATE budget_list SET `name` = ?, `amount` = ?, `date` = NOW() WHERE id = ?"
    db.query(q, values, (err, data) => {
      if(err) res.json(err)
        return res.json("Updated Successsfully");
    })

  } else if(type === "expenses"){
    const values = [
      req.body.name,
      -req.body.amount,
      id
    ]
    const q = "UPDATE expenses_list SET `name` = ?, `amount` = ?, `date` = NOW() WHERE id = ?"
    // console.log(values)
    db.query(q, values, (err, data) => {
      if(err) res.json(err)
        return res.json("Updated Successsfully");
    })
  }

});

app.listen(process.env.PORT || PORT, () => {
  console.log("Backend Connected");
});

// app.listen(PORT, () => {
//   console.log("Backend Connected");
// });