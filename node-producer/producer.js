const { Kafka } = require("kafkajs");
const axios = require("axios");

async function runProducer() {

  // This initializes a new kafka instance with the client id and the brokers addresses
  const kafka = new Kafka({
    clientId: "my-producer",
    brokers: ["localhost:9092"],
  });

  // This creates a new producer instance from the kafka instance
  const producer = kafka.producer();

  // Connecxts the producer to the Kafka cluster
  await producer.connect();

  // This sets up an interval to fetch and send stck data every 5 seconds
  setInterval(async () => {
    try {
      const { data } = await axios.get(
        "https://stocks.heat-engineer.dev/api/stocks/heat-engineer/current"
      );

      console.log("[Producer] Fetched stock data:", data);

      // sends the fetched stock data to the specified Kafka topic
      await producer.send({
        topic: "heat-engineer-stock",
        messages: [
          {
            value: JSON.stringify(data),
          },
        ],
      });

      console.log("[Producer] Sent message to Kafka");
    } catch (error) {
      console.error("[Producer] Error:", err);
    }
  }, 5000);
}

runProducer().catch((err) => console.error(err));
