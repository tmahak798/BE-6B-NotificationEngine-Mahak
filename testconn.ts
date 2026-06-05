import { Client } from "pg";

const client = new Client({
  host: "127.0.0.1",
  port: 5432,
  database: "notification_engine",
  user: "notification_user",
  password: "notificationengine123",
});

client.connect()
  .then(() => {
    console.log("Connected successfully!");
    return client.end();
  })
  .catch((err) => {
    console.error(err);
  });