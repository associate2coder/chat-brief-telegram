import { createApp } from "./http/app";
import { loadConfig } from "./config";
import { handleSend } from "./relay";

const config = loadConfig();
const app = createApp((request) => handleSend(request, config));

app.listen(config.port, () => {
  console.log(`chat-brief-telegram relay listening on port ${config.port}`);
});
