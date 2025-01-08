import { Kafka, EachMessagePayload } from "kafkajs";
import { NextResponse } from "next/server";
import { ReadableStream } from "web-streams-polyfill";

// This initializes a variable to hold the Kafka consumer instance
let kafkaConsumer: any = null;

// And this creates a new kafka instance with the client id and broker addresses
const kafka = new Kafka({
  clientId: "my-consumer",
  brokers: ["localhost:9092"],
});

// Async function to connect and set up the Kafka consumer
const connectConsumer = async () => {
  // Creates a new consumer and specifying the group id 
  kafkaConsumer = kafka.consumer({ groupId: "stock-group" });
  // Wait to connect the consumer to the Kafka cluster and to subscribe to the heat-engineer-stock topic
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topic: "heat-engineer-stock",
    fromBeginning: false, // to not read messages from the beginning of the topic
  });
};

export async function GET() {
  // Creates a new readableStream to handle the server sent events
  const stream = new ReadableStream({
    // This deines the start behaviour of the stream
    start: (controller) => {
      // checks if consuer is not already connected
      if (!kafkaConsumer) {
        // continues to attempt to connected the consumer
        connectConsumer()
          .then(() => { // once theyre connected, start running the consumer to process each incoming message
            kafkaConsumer.run({
              eachMessage: async (payload: EachMessagePayload) => {
                // Extract the message value and convert it to a string, if it ends up being undefined it defaults to "{}"
                const data = payload.message.value?.toString() || "{}";

                // Enqueue the incoming stock data to the sse stream, sending it to the client
                controller.enqueue(`data: ${data}\n\n`);
              },
            });
          })
          .catch((error) => {
            console.error("Error connecting consumer:", error);
            controller.error(error);
          });
      }
    },
    // This defines the cancel behaviour when the client closes the connection
    cancel() {
      console.log("SSE conneciton closed by client");
      // if consumer exists, attempt to disconnect
      if (kafkaConsumer) {
        kafkaConsumer.disconnect().catch((error: any) => {
          console.error("Error disconnecting consumer:", error);
        });
        // then finally reset consumer variable to null
        kafkaConsumer = null;
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream", // Sets the content type to SSE
      "Cache-Control": "no-cache", // Disables caching
      Connection: "keep-alive", // Keeps the connection open
    },
  });
}
